import { v2 as cloudinary } from "cloudinary";
import { CLOUD_NAME, API_SECRET, API_KEY } from "../config/config.js";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export const uploadImage = async (filesPath) => {
  return await cloudinary.uploader.upload(filesPath, {
    folder: "imagenProyect",
    resource_type: "image",
  });
};

export const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

export const deleteVideo = async (publicId) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
};

export async function uploadVideo(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "videoProyect",
  });
}
