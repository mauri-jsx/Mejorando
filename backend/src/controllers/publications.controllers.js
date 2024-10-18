import mongoose from "mongoose";
import { publications } from "../models/publications.model.js";
import { deletesFiles } from "../utils/deletePath.js";
import { multimediaFormat, singlMediaFormat } from "../utils/savePublications.js";
import fs from "fs-extra";
import { deleteImage, deleteVideo } from "../helpers/cloudinary.js";
import color from "chalk";
import { user } from "../models/user.model.js";

export const publicationGetter = async (req, res) => {
  try {
    const publicCollections = await publications.find();
    if (publicCollections.length === 0) return res.status(404).json({ message: "No hay eventos que mostrar" });
    return res.status(200).json(publicCollections);
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                                  Error en el controlador de mostrar todas las publicaciones"));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};

export const postFinderById = async (req, res) => {
  try {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) return res.status(404).json({ message: "invalid id" });
    const publicationsSearched = await publications.findById(id);
    if (!publicationsSearched) return res.status(404).json({ message: "El evento no existe" });
    res.status(200).json(publicationsSearched);
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                    Error en el controlador de mostrar el evento buscado por id "));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};

export const postCreator = async (req, res) => {
  try {
    const { title, description, lat, long, category, startDate, endDate } = req.body;

    const idUser = req.user._id;

    if (req.files?.media) {
      const mediaFiles = req.files.media;

      const identifier = Array.isArray(mediaFiles);

      if (identifier) {
        const mimetypes = mediaFiles.map((Element) => {
          return Element.mimetype;
        });

        const tempFilePaths = mediaFiles.map((Element) => {
          return Element.tempFilePath;
        });

        const { photo, video } = await multimediaFormat(mediaFiles, mimetypes, tempFilePaths);

        const newPublications = new publications({
          titles: title,
          idUsers: idUser,
          descriptions: description,
          locations: { lat: lat, long: long },
          categorys: category,
          startDates: startDate,
          endDates: endDate,
        });

        newPublications.medias.photos.push(...photo);

        newPublications.medias.videos.push(...video);

        await newPublications.save();

        await deletesFiles(tempFilePaths);

        return res.status(200).json({ message: "Post created successfully" });
      } else {
        const newPublications = new publications({
          titles: title,
          idUsers: idUser,
          descriptions: description,
          locations: { lat: lat, long: long },
          categorys: category,
          startDates: startDate,
          endDates: endDate,
        });

        const { video, photo } = await singlMediaFormat(mediaFiles);

        newPublications.medias.photos.push(...photo);

        newPublications.medias.videos.push(...video);

        await user.findByIdAndUpdate(idUser, { $push: { publications: newPublications._id } });

        await newPublications.save();

        await fs.unlink(mediaFiles.tempFilePath);

        return res.status(200).json({ message: "Post created successfully" });
      }
    } else {
      const newPublications = new publications({
        titles: title,
        idUsers: idUser,
        descriptions: description,
        locations: { lat: lat, long: long },
        categorys: category,
        startDates: startDate,
        endDates: endDate,
      });

      await newPublications.save();

      return res.json({ message: "Post created successfully" });
    }
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                         Error en el controlador de creación de publicaciones"));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    res.status(500).json({ message: "Error inesperado en el servidor por favor intente mas tarde" });
  }
};

export const postUpdater = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, lat, long, category, startDate, endDate } = req.body;

    const valor = mongoose.Types.ObjectId.isValid(id);

    if (!valor) res.status(404).json({ message: "invalid id" });

    if (req.files?.media) {
      const media = req.files.media;
      const isAnArray = Array.isArray(media);
      if (!isAnArray) {
        const { video, photo } = await singlMediaFormat(media);

        if (media.mimetype === "video/mp4") {
          await publications.findByIdAndUpdate(id, { $push: { "medias.videos": { _id: video[0]._id, url: video[0].url } } }, { new: true });
        } else if (media.mimetype === "image/png" || media.mimetype === "image/jpeg") {
          await publications.findByIdAndUpdate(id, { $push: { "medias.photos": { _id: photo[0]._id, url: photo[0].url } } }, { new: true });
        }
        await publications.findByIdAndUpdate(
          id,
          { $set: { titles: title, descriptions: description, locations: { lat: lat, long: long }, categorys: category, startDates: startDate, endDates: endDate } },
          { new: true }
        );

        await fs.unlink(media.tempFilePath);
        return res.status(200).json({
          message: "publication updated successfully",
        });
      } else {
        const type = media.map((e) => {
          return e.mimetype;
        });
        const path = media.map((e) => {
          return e.tempFilePath;
        });
        const { photo, video } = await multimediaFormat(media, type, path);
        photo.forEach(async (e) => {
          await publications.findByIdAndUpdate(id, { $push: { "medias.photos": { _id: e._id, url: e.url } } }, { new: true });
        });
        video.forEach(async (e) => {
          await publications.findByIdAndUpdate(id, { $push: { "medias.videos": { _id: e._id, url: e.url } } }, { new: true });
        });
        await publications.findByIdAndUpdate(
          id,
          {
            $set: {
              titles: title,
              descriptions: description,
              locations: { lat: lat, long: long },
              categorys: category,
              startDates: startDate,
              endDates: endDate,
            },
          },
          { new: true }
        );
        await deletesFiles(path);
        return res.status(200).json({
          message: "publication updated successfully",
        });
      }
    } else {
      await publications.findByIdAndUpdate(
        id,
        {
          $set: {
            titles: title,
            descriptions: description,
            locations: { lat: lat, long: long },
            categorys: category,
            startDates: startDate,
            endDates: endDate,
          },
        },
        { new: true }
      );
      return res.json({
        message: "publication updated successfully",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const postRemover = async (req, res) => {
  try {
    const { id } = req.params;

    const isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) return res.status(404).json({ message: "Publication not found" });

    const publication = await publications.findById(id);

    const ThereAreVideos = Boolean(publication.medias.videos.length);

    const ThereAreImages = Boolean(publication.medias.photos.length);

    const video = publication.medias.videos;

    const image = publication.medias.photos;

    if (ThereAreImages) {
      if (image.length > 1) {
        image.forEach(async (e) => {
          await deleteImage(e._id);
        });
      } else {
        await deleteImage(image[0]._id);
      }
    }

    if (ThereAreVideos) {
      if (video.length > 1) {
        video.forEach(async (e) => {
          await deleteVideo(e._id);
        });
      } else {
        await deleteVideo(video[0]._id);
      }
    }

    await publications.findByIdAndDelete(id);

    res.status(200).json({ message: "post deleted successfully" });
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                      Error en el controlador para eliminar las publicaciones"));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};

export const categoryPostGetter = async (req, res) => {
  try {
    const { category } = req.params;

    const publicationsSearched = await publications.find({ categorys: category }).exec();

    if (!publicationsSearched) return res.status(404).json({ message: "no hay eventos con esa categoría" });

    return res.status(200).json({ message: "Resultados de Búsqueda", publicationsSearched });
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                          Error en la búsqueda de Eventos por categoría"));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};

export const publicationGetterByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    const publicationsSearched = await publications.find({ titles: new RegExp(title, "i") }).exec();

    if (!publicationsSearched) return res.status(404).json({ message: "no hay Eventos con ese titulo" });

    return res.status(200).json({ message: "Resultados de Búsqueda", publicationsSearched });
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                         Error en la búsqueda de Eventos por categoría"));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};
