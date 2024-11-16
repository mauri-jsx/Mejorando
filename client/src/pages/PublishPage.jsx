import { useState } from "react";
import { Music, Heart, Palette, Users } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPublication } from "../api/publish";
import Map from "../components/Map";
import { useDropzone } from "react-dropzone";
import { AiOutlineHome } from "react-icons/ai";
import { FaTimes } from "react-icons/fa"; // Icono para eliminar imagen
import { motion } from "framer-motion"; // Importamos Framer Motion
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  {
    id: "musical",
    label: "Evento Musical",
    icon: Music,
    color: "bg-purple-100",
  },
  {
    id: "charity",
    label: "Evento Caritativo",
    icon: Heart,
    color: "bg-pink-100",
  },
  {
    id: "cultural",
    label: "Evento Cultural",
    icon: Palette,
    color: "bg-blue-100",
  },
  { id: "social", label: "Evento Social", icon: Users, color: "bg-green-100" },
];

const Publish = () => {
  const [formData, setFormData] = useState({
    titles: "",
    descriptions: "",
    locations: { lat: "", long: "" },
    category: "",
    startDates: "",
    endDates: "",
    medias: { photos: [], videos: [] },
  });
  const [mediaFiles, setMediaFiles] = useState({ photos: [], videos: [] });
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!formData.titles.trim()) errors.titles = "El título es requerido";
    if (!formData.descriptions.trim())
      errors.descriptions = "La descripción es requerida";
    if (!formData.locations.lat || !formData.locations.long)
      errors.locations = "Las coordenadas son requeridas";
    if (!formData.category) errors.category = "Seleccione una categoría";
    if (!formData.startDates)
      errors.startDates = "Seleccione la fecha de inicio";
    if (!formData.endDates) errors.endDates = "Seleccione la fecha de fin";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData((prev) => ({ ...prev, category: categoryId }));
  };

  const handleMediaChange = (e) => {
    const { files, name } = e.target;
    const updatedFiles = { ...mediaFiles };
    if (name === "photos") {
      updatedFiles.photos = Array.from(files);
    } else if (name === "videos") {
      updatedFiles.videos = Array.from(files);
    }
    setMediaFiles(updatedFiles);
  };

  const handleAddressUpdate = (lat, long) => {
    setFormData((prev) => ({ ...prev, locations: { lat, long } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor, complete todos los campos requeridos");
      return;
    }

    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "locations" || key === "medias") {
        submissionData.append(key, JSON.stringify(formData[key]));
      } else {
        submissionData.append(key, formData[key]);
      }
    });

    // Añadir archivos de medios
    mediaFiles.photos.forEach((file) => submissionData.append("media", file));
    mediaFiles.videos.forEach((file) => submissionData.append("media", file));

    const loadingToast = toast.loading("Subiendo publicación...");

    try {
      setLoading(true); // Activar la carga
      const response = await createPublication(submissionData);
      if (response && response.message === "Publicación creada exitosamente") {
        toast.update(loadingToast, {
          render: "¡Publicación creada exitosamente!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        // Reiniciar el formulario
        setFormData({
          titles: "",
          descriptions: "",
          locations: { lat: "", long: "" },
          category: "",
          startDates: "",
          endDates: "",
          medias: { photos: [], videos: [] },
        });
        setMediaFiles({ photos: [], videos: [] });
      } else {
        toast.update(loadingToast, {
          render: "Error al crear la publicación",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.update(loadingToast, {
        render: "Error al crear la publicación",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false); // Desactivar la carga
    }
  };

  const { getRootProps: getMediaRootProps, getInputProps: getMediaInputProps } =
    useDropzone({
      onDrop: (acceptedFiles) =>
        setMediaFiles({
          ...mediaFiles,
          photos: acceptedFiles.filter((file) => file.type.startsWith("image")),
          videos: acceptedFiles.filter((file) => file.type.startsWith("video")),
        }),
      accept: "image/*,video/*",
      multiple: true,
    });

  const handleMediaRemove = (index, type) => {
    const updatedMedia = { ...mediaFiles };
    updatedMedia[type].splice(index, 1);
    setMediaFiles(updatedMedia);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 relative">
      {/* Botón de Home con animación de Framer Motion */}
      <motion.button
        onClick={() => navigate("/home")}
        className="absolute top-6 left-6 flex items-center p-2 bg-blue-500 text-white rounded-full shadow-lg"
        whileHover={{
          scale: 1.2,
          rotate: 5,
          boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.2)",
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <AiOutlineHome className="w-5 h-5 mr-1" />
      </motion.button>

      {/* Título principal */}
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Crear Mis Publicaciones
      </h1>

      {/* Contenedor principal */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-lg shadow-2xl border border-gray-200 ">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Título
              </label>
              <input
                type="text"
                name="titles"
                value={formData.titles}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
              />
              {validationErrors.titles && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.titles}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Descripción
              </label>
              <textarea
                name="descriptions"
                value={formData.descriptions}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
              />
              {validationErrors.descriptions && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.descriptions}
                </p>
              )}
            </div>

            {/* Categorías */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Categoría
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <motion.button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-300 border-2 ${
                      formData.category === category.id
                        ? `bg-${category.color} text-gray-800 border-${category.color}`
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <category.icon className="w-5 h-5 mr-2" />
                    {category.label}
                  </motion.button>
                ))}
              </div>
              {validationErrors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.category}
                </p>
              )}
            </div>

            {/* Fechas */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Fechas del Evento
              </label>
              <input
                type="datetime-local"
                name="startDates"
                value={formData.startDates}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
              />
              {validationErrors.startDates && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.startDates}
                </p>
              )}
              <input
                type="datetime-local"
                name="endDates"
                value={formData.endDates}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-2 transition duration-200"
              />
              {validationErrors.endDates && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.endDates}
                </p>
              )}
            </div>

            {/* Botón de Envío */}
            <motion.button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition duration-200"
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              Crear Publicación
            </motion.button>
          </form>
        </div>

        {/* Contenedor de Mapa y Medios */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Mapa */}
          <div className="bg-white p-4 rounded-lg shadow-2xl border border-gray-200">
            <Map setAddress={handleAddressUpdate} />
            {validationErrors.locations && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.locations}
              </p>
            )}
          </div>

          {/* Media */}
          <div className="bg-white p-4 rounded-lg shadow-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-center text-gray-700 mb-4">
              Añadir Imagen o Video
            </h3>
            <div className="space-y-4">
              <div
                {...getMediaRootProps()}
                className="w-full h-32 border-2 border-dashed border-gray-400 rounded-lg p-4 text-center bg-gray-100 hover:bg-gray-200 transition duration-200"
              >
                <input {...getMediaInputProps()} />
                {mediaFiles.photos.length > 0 ||
                mediaFiles.videos.length > 0 ? (
                  <div className="flex flex-wrap gap-4 justify-center">
                    {mediaFiles.photos.map((photo, index) => (
                      <div key={index} className="relative w-1/3">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Vista previa ${index}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <motion.button
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2"
                          onClick={() => handleMediaRemove(index, "photos")}
                          whileHover={{
                            scale: 1.1,
                            rotate: 45,
                          }}
                        >
                          <FaTimes />
                        </motion.button>
                      </div>
                    ))}
                    {mediaFiles.videos.map((video, index) => (
                      <div key={index} className="relative w-1/3">
                        <video
                          controls
                          className="w-full h-full object-cover rounded-lg"
                        >
                          <source src={URL.createObjectURL(video)} />
                        </video>
                        <motion.button
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2"
                          onClick={() => handleMediaRemove(index, "videos")}
                          whileHover={{
                            scale: 1.1,
                            rotate: 45,
                          }}
                        >
                          <FaTimes />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Arrastra o selecciona tus medios
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Publish;
