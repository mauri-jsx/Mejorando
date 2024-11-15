import mongoose from "mongoose";
import { publications } from "../models/publications.model.js";
import { deletesFiles } from "../utils/deletePath.js";
import {
  multimediaFormat,
  singlMediaFormat,
} from "../utils/savePublications.js";
import fs from "fs-extra";
import { deleteImage, deleteVideo } from "../helpers/cloudinary.js";
import { uploadImage, uploadVideo } from "../helpers/cloudinary.js";
import color from "chalk";
import { user } from "../models/user.model.js";

export const publicationGetter = async (req, res) => {
  try {
    const publicCollections = await publications.find().populate('idUsers', 'username email profilePicture');
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

    const publicationsSearched = await publications.findById(id).populate('idUsers', 'username email');
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
    console.log('Request Body:', req.body);
    const { titles, descriptions, category, startDates, endDates } = req.body;
    const { lat, long } = JSON.parse(req.body.locations);
    const idUser = req.user._id;
    if (!titles || !descriptions || !lat || !long || !category || !startDates || !endDates) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    const mediaFiles = req.files?.media ? (Array.isArray(req.files.media) ? req.files.media : [req.files.media]) : [];
    const photos = [];
    const videos = [];
    if (mediaFiles.length > 0) {
      await Promise.all(mediaFiles.map(async (file) => {
        try {
          let result;
          if (file.mimetype.startsWith("image/")) {
            result = await uploadImage(file.tempFilePath);
            photos.push({ _id: new mongoose.Types.ObjectId().toString(), url: result.secure_url }); // Agrega objeto de foto
          } else if (file.mimetype.startsWith("video/")) {
            result = await uploadVideo(file.tempFilePath);
            videos.push({ _id: new mongoose.Types.ObjectId().toString(), url: result.secure_url }); // Agrega objeto de video
          }
        } catch (uploadError) {
          throw new Error("Error al procesar el archivo multimedia");
        }
      }));
    } else {
      console.log('No media files to process.');
    }
    const newPublication = new publications({
      titles,
      idUsers: idUser,
      descriptions,
      locations: { lat, long },
      category,
      startDates,
      endDates,
      medias: {
        photos,
        videos,
      },
    });
    await newPublication.save();
    await Promise.all(mediaFiles.map(file => fs.unlink(file.tempFilePath)));

    return res.status(201).json({ message: "Publicación creada exitosamente", publicationId: newPublication._id });
  } catch (error) {
    console.error("Error al crear la publicación", error);
    return res.status(500).json({ message: "Error inesperado en el servidor. Intente más tarde" });
  }
};

export const postUpdater = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, lat, long, category, startDate, endDate } = req.body;
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
          .json({ message: "Publicación actualizada exitosamente" });
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
          .json({ message: "Publicación actualizada exitosamente" });
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
      return res.json({ message: "Publicación actualizada exitosamente" });
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
      return res.status(404).json({ message: "Publicación no encontrada" });

    const publication = await publications.findById(id);
    if (!publication)
      return res.status(404).json({ message: "Publicación no encontrada" });

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
    res.status(200).json({ message: "Publicación eliminada exitosamente" });
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
      .find({ category: category })
      .populate('idUsers', 'username profilePicture');
    if (!publicationsSearched.length) {
      return res.status(404).json({ message: "No hay eventos con esa categoría" });
    }
    return res.status(200).json(publicationsSearched);
  } catch (error) {
    console.error("Error en el controlador de mostrar eventos por categorías:", error);
    return res.status(500).json({ message: "Error inesperado en el servidor" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });
    const publication = await publications.findById(id);
    if (!publication) return res.status(404).json({ message: "Publicación no encontrada" });
    const userLogged = await user.findById(userId);
    if (!userLogged) return res.status(404).json({ message: "Usuario no encontrado" });
    const isLiked = userLogged.likedPublications.includes(publication._id);

    if (isLiked) {
      userLogged.likedPublications = userLogged.likedPublications.filter(
        (pubId) => !pubId.equals(publication._id)
      );
    } else {
      userLogged.likedPublications.push(publication._id);
    }
    await userLogged.save();
    res.status(200).json({
      message: isLiked ? "Like eliminado" : "Like agregado",
      likesCount: publication.likes.length,
      liked: !isLiked,
    });
  } catch (error) {
    console.error("Error al dar o quitar like", error);
    res.status(500).json({ message: "Error al actualizar el estado de like" });
  }
};






