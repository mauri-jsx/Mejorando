import { Router } from "express";
import {
  publicationGetter,
  postCreator,
  postFinderById,
  postUpdater,
  postRemover,
  categoryPostGetter,
} from "../controllers/publications.controllers.js";
import validatorJWT from "../middlewares/validatorJWT.js";

const publicationsRoutes = Router();
publicationsRoutes.get("/publications", publicationGetter);
publicationsRoutes.get("/publications/:id", postFinderById);
publicationsRoutes.post("/publications", validatorJWT, postCreator);
publicationsRoutes.put("/publications/:id", validatorJWT, postUpdater);
publicationsRoutes.delete("/publications/:id", validatorJWT, postRemover);
publicationsRoutes.get(
  "/publications/searched/for/category/:category",
  categoryPostGetter
);

export default publicationsRoutes;
