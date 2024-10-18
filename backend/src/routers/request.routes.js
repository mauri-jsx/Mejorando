import Router from "express";
import { acceptRequest, creatorRequest, denialsRequests, getAllRequest } from "../controllers/req.controllers.js";
import validatorJWT from "../middlewares/validatorJWT.js";
const reqRouter = Router();

reqRouter.post("/req", validatorJWT, creatorRequest);
reqRouter.get("/req", validatorJWT, getAllRequest);
reqRouter.post("/req/:id", validatorJWT, acceptRequest);
reqRouter.delete("/req/:id", validatorJWT, denialsRequests);

export default reqRouter;
