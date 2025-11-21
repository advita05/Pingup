import express from "express";
import { upload } from "../configs/multer.js";
import { protect } from "../middleware/auth.js";
import { addpost, getpost, likepost } from "../controllers/postcontroller.js";

const postRouter = express.Router();

postRouter.post("/add", upload.array("images", 4), protect, addpost);
postRouter.post("/feed", protect, getpost);
postRouter.post("/add", protect, likepost);

export default postRouter;