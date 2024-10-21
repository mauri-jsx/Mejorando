import mongoose from "mongoose";
import { publications } from "../models/publications.model.js";
import { deletesFiles } from "../utils/deletePath.js";
import {
  multimediaFormat,
  singlMediaFormat,
} from "../utils/savePublications.js";
import fs from "fs-extra";
import { deleteImage, deleteVideo } from "../helpers/cloudinary.js";
import color from "chalk";
import { user } from "../models/user.model.js";

export const publicationGetter = async (req, res) => {
  try {
    const publicCollections = await publications.find();
    if (publicCollections.length === 0)
      return res.status(404).json({ message: "No hay eventos que mostrar" });
    return res.status(200).json(publicCollections);
  } catch (error) {
    console.log(
      color.blue("-----------------------------------------------------------")
    );
    console.log(
      color.red("Error en el controlador de mostrar todas las publicaciones")
    );
    console.log(
      color.blue("-----------------------------------------------------------")
    );
    console.log(error);
  }
};

export const postFinderById = async (req, res) => {
  try {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) return res.status(404).json({ message: "Invalid ID" });

    const publicationsSearched = await publications.findById(id);
    if (!publicationsSearched)
      return res.status(404).json({ message: "El evento no existe" });

    res.status(200).json(publicationsSearched);
  } catch (error) {
    console.log(
      color.blue("-----------------------------------------------------------")
    );
    console.log(
      color.red("Error en el controlador de mostrar el evento buscado por ID")
    );
    console.log(
      color.blue("-----------------------------------------------------------")
    );
    console.log(error);
  }
};

export const postCreator = async (req, res) => {
  try {
    const { titles, descriptions, category, startDates, endDates } = req.body;
    const { lat, long } = JSON.parse(req.body.locations);

    const idUser = req.user._id;

    if (!titles || !descriptions || !lat || !long || !category || !startDates || !endDates) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const mediaFiles = req.files?.media || [];
    const photos = [];
    const videos = [];

    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        if (file.mimetype.startsWith("image/")) {
          const result = await uploadImage(file.tempFilePath);
          photos.push(result.secure_url);
        } else if (file.mimetype.startsWith("video/")) {
          const result = await uploadVideo(file.tempFilePath);
          videos.push(result.secure_url);
        }
      }
    }

    const newPublication = new publications({
      titles,
      idUsers: idUser,
      descriptions,
      locations: { lat, long },
      categorys: category,
      startDates,
      endDates,
      medias: {
        photos,
        videos,
      },
    });

    await newPublication.save();

    for (const file of mediaFiles) {
      await fs.unlink(file.tempFilePath);
    }

    return res.status(200).json({ message: "Publicación creada exitosamente" });
  } catch (error) {
    console.error("Error al crear la publicación", error);
    return res.status(500).json({ message: "Error inesperado en el servidor. Intente más tarde" });
  }
};

export const postUpdater = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, lat, long, category, startDate, endDate } =
      req.body;
    const isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) return res.status(404).json({ message: "Invalid ID" });

    if (req.files?.media) {
      const media = req.files.media;
      const isAnArray = Array.isArray(media);

      if (!isAnArray) {
        const { video, photo } = await singlMediaFormat(media);
        if (media.mimetype === "video/mp4") {
          await publications.findByIdAndUpdate(
            id,
            {
              $push: {
                "medias.videos": { _id: video[0]._id, url: video[0].url },
              },
            },
            { new: true }
          );
        } else if (
          media.mimetype === "image/png" ||
          media.mimetype === "image/jpeg"
        ) {
          await publications.findByIdAndUpdate(
            id,
            {
              $push: {
                "medias.photos": { _id: photo[0]._id, url: photo[0].url },
              },
            },
            { new: true }
          );
        }
        await publications.findByIdAndUpdate(
          id,
          {
            $set: {
              titles: title,
              descriptions: description,
              locations: { lat, long },
              categorys: category,
              startDates: startDate,
              endDates: endDate,
            },
          },
          { new: true }
        );

        await fs.unlink(media.tempFilePath);
        return res
          .status(200)
          .json({ message: "Publication updated successfully" });
      } else {
        const type = media.map((e) => e.mimetype);
        const path = media.map((e) => e.tempFilePath);
        const { photo, video } = await multimediaFormat(media, type, path);

        photo.forEach(async (e) => {
          await publications.findByIdAndUpdate(
            id,
            { $push: { "medias.photos": { _id: e._id, url: e.url } } },
            { new: true }
          );
        });

        video.forEach(async (e) => {
          await publications.findByIdAndUpdate(
            id,
            { $push: { "medias.videos": { _id: e._id, url: e.url } } },
            { new: true }
          );
        });

        await publications.findByIdAndUpdate(
          id,
          {
            $set: {
              titles: title,
              descriptions: description,
              locations: { lat, long },
              categorys: category,
              startDates: startDate,
              endDates: endDate,
            },
          },
          { new: true }
        );

        await deletesFiles(path);
        return res
          .status(200)
          .json({ message: "Publication updated successfully" });
      }
    } else {
      await publications.findByIdAndUpdate(
        id,
        {
          $set: {
            titles: title,
            descriptions: description,
            locations: { lat, long },
            categorys: category,
            startDates: startDate,
            endDates: endDate,
          },
        },
        { new: true }
      );
      return res.json({ message: "Publication updated successfully" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const postRemover = async (req, res) => {
  try {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid)
      return res.status(404).json({ message: "Publication not found" });

    const publication = await publications.findById(id);
    if (!publication)
      return res.status(404).json({ message: "Publication not found" });

    const ThereAreVideos = Boolean(publication.medias.videos.length);
    const ThereAreImages = Boolean(publication.medias.photos.length);

    const video = publication.medias.videos;
    const image = publication.medias.photos;

    if (ThereAreImages) {
      for (const img of image) {
        await deleteImage(img._id);
      }
    }

    if (ThereAreVideos) {
      for (const vid of video) {
        await deleteVideo(vid._id);
      }
    }

    await publications.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(
      color.blue("-----------------------------------------------------------")
    );
    console.log(
      color.red("Error en el controlador para eliminar las publicaciones")
    );
    console.log(
      color.blue("-----------------------------------------------------------")
    );
    console.log(error);
  }
};

export const categoryPostGetter = async (req, res) => {
  try {
    const { category } = req.params;
    const publicationsSearched = await publications
      .find({ categorys: category })
      .exec();

    if (!publicationsSearched.length)
      return res
        .status(404)
        .json({ message: "No hay eventos con esa categoría" });

    return res
      .status(200)
      .json({ message: "Resultados de Búsqueda", publicationsSearched });
  } catch (error) {
    console.log(
      color.blue("-----------------------------------------------------------")
    );
    console.log(
      color.red("Error en el controlador de mostrar eventos por categorías")
    );
    console.log(
      color.blue("-----------------------------------------------------------")
    );
    console.log(error);
  }
};
