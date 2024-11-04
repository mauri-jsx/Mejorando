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

  // Ordenar publicaciones de más recientes a más antiguas
  const sortedPublications = filteredPublications.sort(
    (a, b) => new Date(b.startDates) - new Date(a.startDates)
  );

  const popularEvents = publications.slice(0, 5).reverse(); // Muestra la última publicación primero

  // Eventos por finalizar
  const now = new Date();
  const upcomingEvents = publications
    .filter((pub) => {
      const endDate = new Date(pub.endDates);
      return endDate >= now;
    })
    .sort((a, b) => new Date(a.endDates) - new Date(b.endDates));

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Banner */}
      <div className="bg-purple-600 text-white text-center py-4 mb-6">
        <h1 className="text-4xl font-bold">Bienvenido a ViewsEvents</h1>
        <p className="mt-2">Descubre los mejores eventos en tu área</p>
      </div>

      <div className="container mx-auto px-4 py-8 flex justify-between">
        {/* Tarjeta de Usuario */}
        <div className="w-1/4 mr-4">
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
            <img
              src="https://i.pinimg.com/564x/13/b4/08/13b408f0ad453542c0d8fa8e62602245.jpg"
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
            <p className="mt-4 text-center text-gray-500 italic text-xs">
              "Conectando personas a través de eventos increíbles."
            </p>
          </div>

          {/* Tarjeta de Eventos por Finalizar */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
            <h2 className="text-lg font-bold mb-4">Eventos por Finalizar</h2>
            <div className="flex flex-col space-y-2">
              {upcomingEvents.map((event) => {
                const endDate = new Date(event.endDates);
                const isExpired = endDate < now;
                const isAboutToExpire =
                  endDate - now <= 3 * 24 * 60 * 60 * 1000; // 3 días

                let statusColor;
                if (isExpired) {
                  statusColor = "bg-red-500"; // Finalizado
                } else if (isAboutToExpire) {
                  statusColor = "bg-orange-500"; // Por finalizar
                } else {
                  statusColor = "bg-green-500"; // Disponible
                }

                return (
                  <div
                    key={event._id}
                    className={`flex items-center justify-between p-2 rounded-lg ${statusColor} text-white`}
                  >
                    <span>{event.titles}</span>
                    <span className="text-xs">
                      {endDate.toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sección de Publicaciones */}
        <div className="w-1/2">
          <h2 className="text-2xl font-bold text-center mb-6">Publicaciones</h2>
          {loadingPublications ? (
            <p className="text-center">Cargando publicaciones...</p>
          ) : (
            <div className="flex flex-col space-y-6">
              {sortedPublications.map((pub) => {
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
                    className="bg-white shadow-lg rounded-lg p-4 relative w-full mx-auto"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Imagen y etiqueta de categoría */}
                    {pub.medias?.photos?.[0]?.url && (
                      <div className="relative">
                        <img
                          src={pub.medias.photos[0].url}
                          alt={pub.titles}
                          className="w-full h-60 object-cover rounded-t-lg"
                        />
                        <motion.div
                          className="absolute bottom-2 right-2 bg-blue-400/80 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1 cursor-pointer overflow-hidden"
                          initial={{ width: "2rem" }}
                          whileHover={{ width: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-lg opacity-90">
                            {categoryData?.icon || "🎉"}
                          </span>
                          <span className="ml-1 whitespace-nowrap">
                            {categoryData?.name || "Categoría"}
                          </span>
                        </motion.div>
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mt-3 mb-1 text-center">
                      {pub.titles}
                    </h3>
                    <p className="text-gray-600 text-xs text-center">
                      📅 Fecha de Inicio: {formattedStartDate} -{" "}
                      {formattedStartTime}
                    </p>
                    <p className="text-gray-600 text-xs text-center">
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

        {/* Tarjeta de Categorías */}
        <div className="w-1/4 ml-4">
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

          {/* Top de Eventos Populares */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
            <h2 className="text-sm font-bold mb-4">Top Eventos Populares</h2>
            <ul className="space-y-2">
              {popularEvents.map((event) => (
                <motion.li
                  key={event._id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-xs"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center">
                    <span className="text-lg">{event.category.icon}</span>
                    <span className="ml-2">{event.titles}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="material-icons">people</span>
                    <span className="ml-1">
                      {Math.floor(Math.random() * 1000)} seguidores
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUser;
