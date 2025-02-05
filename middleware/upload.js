import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
	endpoint: process.env.B2_ENDPOINT,
	region: process.env.B2_REGION,
	forcePathStyle: true,

});

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: process.env.B2_BUCKET_NAME,
		acl: "private",
		metadata: (req, file, cb) => {
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			cb(null, Date.now().toString() + "-" + file.originalname);
		},
	}),
});

export default upload;
