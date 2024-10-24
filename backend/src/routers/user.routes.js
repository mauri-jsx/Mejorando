import Router from "express";
import {
  login,
  logout,
  register,
  secureAccess,
  profileUpdater,
  getLoggedUser,
} from "../controllers/user.controllers.js";
import validatorJWT from "../middlewares/validatorJWT.js";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/session", validatorJWT, secureAccess);
userRouter.post("/logout", logout);
userRouter.put("/userUpdated", validatorJWT, profileUpdater);
userRouter.get("/profile", validatorJWT, getLoggedUser);
export default userRouter;
