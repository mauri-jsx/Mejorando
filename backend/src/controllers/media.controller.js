import { deleteImageOfdataBase, deleteVideoOfdataBase } from "../utils/media.utils.js";

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const { idImage } = req.body;

    const { message } = await deleteImageOfdataBase(id, idImage);

    res.json({ message: message });
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                Error en el controlador de eliminación de imagen de la base de datos"));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const { idVideo } = req.body;

    const { message } = await deleteVideoOfdataBase(id, idVideo);

    return res.json({ message: message });
  } catch (error) {
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log(color.red("                Error en el controlador de eliminación de videos de la base de datos"));
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
    console.log();
    console.log(error);
    console.log();
    console.log(color.blue("----------------------------------------------------------------------------------------------------"));
  }
};
