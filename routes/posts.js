import express from "express";
import Post from "../models/Post.js";
import B2 from "backblaze-b2";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

const b2 = new B2({
	applicationKeyId: process.env.AWS_ACCESS_KEY_ID,
	applicationKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const router = express.Router();

router
	.route("/")
	.post(upload.single("image"), async (req, res) => {
		try {

			await b2.authorize();

			const response = await b2.getUploadUrl({
				bucketId: process.env.B2_BUCKET_ID,
			});

			const uploadResponse = await b2.uploadFile({
				uploadUrl: response.data.uploadUrl,
				uploadAuthToken: response.data.authorizationToken,
				fileName: req.file.originalname,
				data: req.file.buffer,
			});

			const { title, description } = req.body;
			const image = uploadResponse.data.fileId;

			const newPost = new Post({ title, description, image });
			await newPost.save();

			res.status(201).json(newPost);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Server error" });
		}
	})
	.get(async (req, res) => {
		try {
			const posts = await Post.find();
			res.status(200).json(posts);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Server error" });
		}
	});

router.delete("/:id", async (req, res) => {
	try {
		const postId = req.params.id;
		await Post.findByIdAndDelete(postId); // Delete the post by ID
		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

router.get("/getImage/:id", async (req, res) => {
	const { id } = req.params;
	let file = "";
	await b2
		.authorize()
		.then(async () => await b2.getFileInfo({ fileId: id }))
		.then(async (response) => {
			file = response.data.fileName;
			return await b2.downloadFileByName({
				bucketName: process.env.B2_BUCKET_NAME,
				fileName: response.data.fileName, 
				responseType: "arraybuffer", 
			});
		})
		.then(({ data }) => {
			res.setHeader("Content-Type", "application/octet-stream");
			res.setHeader("Content-Disposition", `attachment; filename=${file}`);
			res.end(Buffer.from(data));
		})
		.catch((error) => {
			console.error("Download error:", error);
			res.status(500).json({ error: "Failed to download file" });
		});
});

router.put("/:id", upload.single("image"), async (req, res) => {
	try {
		const { title, description } = req.body;

		const postId = req.params.id;

		const updateData = { title, description };
		if (req.file) {
			await b2.authorize();

			const response = await b2.getUploadUrl({
				bucketId: process.env.B2_BUCKET_ID,
			});

			const uploadResponse = await b2.uploadFile({
				uploadUrl: response.data.uploadUrl,
				uploadAuthToken: response.data.authorizationToken,
				fileName: req.file.originalname,
				data: req.file.buffer,
			});

			const image = uploadResponse.data.fileId;
			updateData.image = image;
		}

		const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
			new: true,
		});
		res.status(200).json(updatedPost);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
