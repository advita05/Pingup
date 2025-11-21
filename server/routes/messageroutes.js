import express from "express";
import {
  sendmessage,
  ssecontroller,
  getmessage,
} from "../controllers/messagecontroller.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";
import message from "../models/message";
const messagerouter = express.Router();

messagerouter.get("/:userId", ssecontroller);
messagerouter.post("/send", upload.single("image"), protect, sendmessage);
messagerouter.post("/get", protect, getmessage);

export default messagerouter;