import express from "express";
import { upload } from "../configs/multer.js";
import { protect } from "../middleware/auth.js";
import { adduserstory, getstory } from "../controllers/storycontroller.js";


const storyRouter = express.Router();

storyRouter.post("/create", upload.single('media'),protect, adduserstory);
storyRouter.post("/get", protect, getstory);

export default storyRouter;