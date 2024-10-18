import { Router } from "express";
import { deleteImage, deleteVideo } from "../controllers/media.controller.js";

const mediaRouter = Router();
mediaRouter.delete("/deleteImage/:id", deleteImage);
mediaRouter.delete("/deleteVideo/:id", deleteVideo);

export default mediaRouter;
