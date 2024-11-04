import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  fetchAllPublications,
  fetchPublicationsByCategory,
} from "../api/publish";

const HomeUser = () => {
  const [publications, setPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const navigate = useNavigate();

  const categories = [
    { id: "musical", name: "Eventos Musicales", icon: "🎵" },
    { id: "charity", name: "Eventos Caritativos", icon: "💝" },
    { id: "cultural", name: "Eventos Culturales", icon: "🎨" },
    { id: "social", name: "Eventos Sociales", icon: "🎉" },
  ];

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async (category = "all") => {
    setLoadingPublications(true);
    try {
      const data =
        category === "all"
          ? await fetchAllPublications()
          : await fetchPublicationsByCategory(category);
      setPublications(data);
    } catch (error) {
      toast.error("Error al cargar publicaciones");
    } finally {
      setLoadingPublications(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchPublications(category);
  };

  const filteredPublications =
    selectedCategory === "all"
      ? publications
      : publications.filter((pub) => pub.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="container mx-auto px-4 py-8 flex">
        {/* Tarjeta de Usuario */}
        <div className="w-1/4 mr-8">
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 flex flex-col items-center">
            <img
              src="https://i.pinimg.com/564x/13/b4/08/13b408f0ad453542c0d8fa8e62602245.jpg" // Reemplaza con la URL de tu imagen
              alt="Perfil"
              className="w-24 h-24 rounded-full bg-gray-300"
            />
            <h2 className="text-xl font-semibold mt-4">Invitado</h2>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-full hover:bg-gray-300"
              >
                Registrarse
              </button>
            </div>
          </div>

          {/* Tarjeta de Categorías */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Categorías</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    selectedCategory === category.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
              <button
                onClick={() => handleCategoryChange("all")}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  selectedCategory === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Todos
              </button>
            </div>
          </div>
        </div>

        <div className="w-3/4">
          {/* Events Section */}
          <h2 className="text-2xl font-bold mb-4">Publicaciones</h2>
          {loadingPublications ? (
            <p>Cargando publicaciones...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-10">
              {filteredPublications.map((pub) => {
                const startDate = new Date(pub.startDates);
                const endDate = new Date(pub.endDates);
                const formattedStartDate = startDate.toLocaleDateString();
                const formattedStartTime = startDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const formattedEndDate = endDate.toLocaleDateString();
                const formattedEndTime = endDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const categoryData = categories.find(
                  (cat) => cat.id === pub.category
                );

                return (
                  <motion.div
                    key={pub._id}
                    className="bg-white shadow-lg rounded-lg p-4 relative w-full h-[350px] mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Publication Image and Category Label */}
                    {pub.medias?.photos?.[0]?.url && (
                      <div className="relative">
                        <img
                          src={pub.medias.photos[0].url}
                          alt={pub.titles}
                          className="w-full h-52 object-cover rounded-t-lg"
                        />
                        <motion.div
                          className="absolute bottom-2 right-2 bg-blue-400/80 text-white px-1 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1 cursor-pointer overflow-hidden"
                          initial={{ width: "2rem" }}
                          whileHover={{ width: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <span
                            className="text-lg opacity-90"
                            style={{ fontSize: "20px" }}
                          >
                            {categoryData?.icon || "🎉"}
                          </span>
                          <span className="ml-2 whitespace-nowrap">
                            {categoryData?.name || "Categoría"}
                          </span>
                        </motion.div>
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mt-3 mb-1 text-center">
                      {pub.titles}
                    </h3>
                    <p className="text-gray-600 text-sm text-center">
                      📅 Fecha de Inicio: {formattedStartDate} -{" "}
                      {formattedStartTime}
                    </p>
                    <p className="text-gray-600 text-sm text-center">
                      📅 Fecha de Fin: {formattedEndDate} - {formattedEndTime}
                    </p>
                    <motion.button
                      className="mt-4 flex items-center justify-center mx-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-full hover:shadow-lg transition-all duration-300 font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Ver más sobre el evento <span className="ml-2">➡️</span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeUser;
