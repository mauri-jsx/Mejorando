import mongoose from "mongoose";
import request from "../models/req.model.js";
import color from "chalk";
import { user } from "../models/user.model.js";

export const creatorRequest = async (req, res) => {
  try {
    const { description } = req.body;

    const { emails, usernames, _id } = req.user;

    const newRequest = new request({ user: usernames, email: emails, descriptions: description, idUser: _id });

    const status = await newRequest.save();

    const isSave = Boolean(status);

    if (!isSave) return res.status(404).json({ message: "no se puedo hacer el envió de la petición " });

    res.status(200).json({ message: "petición enviada cone éxitos" });
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                          Error al enviar una petición al servidor "));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    return res.status(404).json({ message: "No se pudo hacer la petición por favor intente mas tarde " });
  }
};

export const getAllRequest = async (req, res) => {
  try {
    const { isAuthorized } = req.user;

    if (!isAuthorized) return res.status(401).json({ message: "no tienes autorización para realizar estas acciones" });

    const theRequest = await request.find().exec();

    return res.status(200).json(theRequest);
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                   Error en el controlador de traer todas las peticiones "));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { isAuthorized } = req.user;

    if (!isAuthorized) return res.status(401).json({ message: "no tienes autorización para realizar estas acciones" });

    const { id } = req.params;

    const isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) return res.status(400).json({ message: "La id de los parámetro no es valida " });

    const theRequest = await request.findById(id).exec();

    if (!theRequest) return res.status(404).json({ message: "no se a encontrado la petición " });

    const { idUser } = theRequest;

    await user.findByIdAndUpdate(idUser, { $set: { isApproved: true } }, { new: true });

    // const authUser = await user.findByIdAndUpdate(idUser, { $set: { isApproved: true } }, { new: true });

    // const searchUser = await user.findById(idUser).exec();

    // console.log(searchUser.emails);

    const reqDeleted = await request.findByIdAndDelete(id);
    if (!reqDeleted) return res.status(304).json({ message: "no se pudo eliminar la petición por favor intente de nuevo " });
    res.status(200).json({ message: "aceptada y eliminada correctamente" });
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                     Error en el controlador de aceptación de pericones "));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};

export const denialsRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) return res.status(400).json({ message: "la id del parámetro es invalida" });

    const reqDeleted = await request.findByIdAndDelete(id);

    if (!reqDeleted) return res.status(304).json({ message: "No se a podido eliminar la petición por favor intente nuevo " });

    res.status(200).json({ message: "negado y eliminado correctamente " });
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                     Error en el controlador de negación de peticiones "));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};
