import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/config.js";
import { user } from "../models/user.model.js";
import color from "chalk";

export default async (req, res, next) => {
  try {
    const token = req.cookies.authToken || req.session.token;
    if (!token) return res.status(403).json({ message: "No tienes autorización" });
    const decoded = jwt.verify(token, SECRET_KEY);
    const userSearched = await user.findById(decoded.id).exec();

    if (!userSearched) return res.status(401).json({ message: "Tu autorización ha expirado" });

    req.user = userSearched;

    next();
  } catch (error) {
    console.log(color.blue("------------------------------------------------"));
    console.log(color.red("       Error al verificar el token"));
    console.log(color.blue("------------------------------------------------"));
    console.log(error);
    console.log(color.blue("-------------------------------------------------"));

    return res.status(403).json({ message: "Error de autorización" });
  }
};