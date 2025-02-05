import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/posts.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Server is running"));
app.use("/api/posts", postRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
