import bcrypt from "bcrypt";
import { IS_PRODUCTION } from "../config/config.js";
import { user } from "../models/user.model.js";
import color from "chalk";
import { publications } from "../models/publications.model.js";
import generateJWT from "../helpers/generateJWT.js";
import { uploadImage } from "../helpers/cloudinary.js";
import fs from "fs-extra";

export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const searchEmail = await user.find({ emails: email }).exec();

    if (!searchEmail.length == 0)
      return res
        .status(406)
        .json({ message: "usuario ya existe con ese email" });

    const searchUsername = await user.find({ username: username }).exec();

    if (!searchUsername.length == 0)
      return res
        .status(406)
        .json({ message: "usuario ya existe con ese nombre de usuario " });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new user({
      username: username,
      passwords: hashedPassword,
      email: email,
    });

    await newUser.save();

    return res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    console.log(
      color.red(
        "                           Error en el controlador de registros de usuarios"
      )
    );
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    console.error();
    console.error(error);
    console.error();
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    res.status(500).json({
      message: "Ocurrió un error inesperado por favor intente mas tarde",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userSearched = await user.findOne({ email: email });
    if (!userSearched)
      return res.status(401).json({ message: "Invalid email" });
    const isValidPassword = await bcrypt.compare(
      password,
      userSearched.passwords
    );
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid password" });
    const token = await generateJWT(userSearched._id);
    req.session.token = token;
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: IS_PRODUCTION === "production",
      sameSite: IS_PRODUCTION === "production" ? "None" : "Lax",
      maxAge: 3600000,
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    console.log(
      color.red(
        "                                Error en el controlador de Accesos"
      )
    );
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    console.error();
    console.error(error);
    console.error();
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    return res
      .status(500)
      .json({ message: "Erro inesperado por favor intente mas tarde" });
  }
};

export const secureAccess = (req, res) => {
  try {
    if (!req.user)
      return res.json({ message: "El usuario no a iniciado session " });
    res.json({ message: "acceso concedido ", user: req.user });
  } catch (error) {
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    console.log(
      color.red(
        "                                        Error en el controlador de sesiones de Usuarios"
      )
    );
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    console.error();
    console.error(error);
    console.error();
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    res
      .status(500)
      .json({ message: "Error inesperado por favor intente mas tarde " });
  }
};

export const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err)
        return res.status(500).json({ message: "Error al cerrar sesión" });

      res.clearCookie("authToken");

      return res.json({ success: true, message: "Cierre de sesión exitoso" });
    });
  } catch (error) {
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    console.log(
      color.red(
        "                               Erro en el controlador de cerrar session "
      )
    );
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    console.error();
    console.error(error);
    console.error();
    console.log(
      color.blue(
        "----------------------------------------------------------------------------------------------------"
      )
    );
    res
      .status(500)
      .json({ message: "Error inesperado por favor intente de nuevo " });
  }
};

export const profileUpdater = async (req, res) => {
  try {
    const { id } = req.user;
    const { email, username } = req.body;

    console.log("Username received in request body:", username);
    let updatedFields = {};

    if (email) {
      const searchEmail = await user.find({ emails: email }).exec();
      if (searchEmail.length > 0) {
        return res
          .status(406)
          .json({ message: "Usuario ya existe con ese email" });
      }
      updatedFields.emails = email;
    }

    if (username) {
      const searchUsername = await user.find({ username: username }).exec();
      if (searchUsername.length > 0) {
        return res
          .status(406)
          .json({ message: "Usuario ya existe con ese nombre de usuario" });
      }
      updatedFields.username = username;
    }

    if (req.files?.media) {
      const media = req.files.media;
      if (media.mimetype !== "image/jpeg" && media.mimetype !== "image/png") {
        return res.status(400).json({ message: "Formato de imagen no válido" });
      }
      const rout = media.tempFilePath;
      const result = await uploadImage(rout);
      updatedFields.profilePicture = {
        _id: result.public_id,
        url: result.secure_url,
      };
      fs.unlink(rout);
    }

    const userUpdated = await user.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true }
    );

    if (!userUpdated) {
      return res
        .status(404)
        .json({ message: "No se pudo actualizar el usuario" });
    }

    return res.status(200).json({
      message: "Perfil actualizado con éxito",
      profilePicture: userUpdated.profilePicture,
      username: userUpdated.username,
      email: userUpdated.email,
    });
  } catch (error) {
    console.error("Error en el controlador de actualización de usuario", error);
    return res
      .status(500)
      .json({ message: "Error inesperado, intente más tarde" });
  }
};

export const getLoggedUser = async (req, res) => {
  try {
    const { id } = req.user;
    const userLogged = await user
      .findById(id)
      .select("username email profilePicture likedPublications")
      .exec();
    if (!userLogged) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const publicationsWithLikes = await publications
      .find({ "_id": { $in: userLogged.likedPublications } })
      .exec();
    const likedPublicationIds = new Set(userLogged.likedPublications.map((pub) => pub.toString()));

    const allPublications = publicationsWithLikes.map((pub) => ({
      ...pub.toObject(),
      liked: likedPublicationIds.has(pub._id.toString()),
    }));
    return res.status(200).json({
      username: userLogged.username,
      email: userLogged.email,
      profilePicture: userLogged.profilePicture,
      likedPublications: allPublications,
    });
  } catch (error) {
    console.error("Error al obtener el usuario logueado:", error);
    return res.status(500).json({ message: "Error al obtener el usuario logueado" });
  }
};
