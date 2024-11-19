import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Users,
  ArrowRight,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";
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
      console.error("Error al cargar los eventos");
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

  const sortedPublications = filteredPublications.sort(
    (a, b) => new Date(b.startDates) - new Date(a.startDates)
  );

  const popularEvents = publications.slice(0, 5).reverse();

  const now = new Date();
  const upcomingEvents = publications
    .filter((pub) => new Date(pub.endDates) >= now)
    .sort((a, b) => new Date(a.endDates) - new Date(b.endDates))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.h1
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            ViewsEvents
          </motion.h1>
          <motion.p
            className="text-xl opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Descubre eventos increíbles cerca de ti
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar izquierdo */}
          <div className="lg:w-1/4 space-y-6">
            {/* Perfil de Usuario */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400"
                    alt="Perfil"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-100"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-full">
                    👋
                  </div>
                </div>

                <h2 className="text-xl font-bold mt-4 text-gray-800">
                  Invitado
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Descubre eventos increíbles
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 w-full">
                  <motion.button
                    onClick={() => navigate("/login")}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogIn className="w-4 h-4" />
                    Ingresar
                  </motion.button>

                  <motion.button
                    onClick={() => navigate("/register")}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Registro
                  </motion.button>
                </div>

                <p className="mt-6 text-center text-gray-500 italic text-sm">
                  "Únete a nuestra comunidad y vive experiencias inolvidables"
                </p>
              </div>
            </motion.div>

            {/* Próximos eventos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Próximos Eventos
                </h2>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const endDate = new Date(event.endDates);
                  const daysLeft = Math.ceil(
                    (endDate - now) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <motion.div
                      key={event._id}
                      className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100"
                      whileHover={{ scale: 1.02 }}
                    >
                      <h3 className="font-medium text-gray-800 mb-1">
                        {event.titles}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {daysLeft} días restantes
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contenido principal - Lista de Eventos */}
          <div className="lg:w-1/2">
            <div className="grid gap-6">
              {loadingPublications ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando eventos...</p>
                </div>
              ) : (
                sortedPublications.map((pub) => {
                  const startDate = new Date(pub.startDates);
                  const endDate = new Date(pub.endDates);
                  const categoryData = categories.find(
                    (cat) => cat.id === pub.category
                  );

                  return (
                    <motion.div
                      key={pub._id}
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative">
                        <img
                          src={
                            pub.medias?.photos?.[0]?.url ||
                            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
                          }
                          alt={pub.titles}
                          className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <span className="text-lg">{categoryData?.icon}</span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-800">
                          {pub.titles}
                        </h3>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {startDate.toLocaleDateString("es-ES", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {startDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -
                              {endDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {Math.floor(Math.random() * 1000)} asistentes
                            </span>
                          </div>
                        </div>

                        <motion.button
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium hover:from-purple-700 hover:to-blue-700"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Ver detalles
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar derecho */}
          <div className="lg:w-1/4 space-y-6">
            {/* Lista de Categorías */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Categorías
              </h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3
                      ${
                        selectedCategory === category.id
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </motion.button>
                ))}
                <motion.button
                  onClick={() => handleCategoryChange("all")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3
                    ${
                      selectedCategory === "all"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xl">🌟</span>
                  <span className="font-medium">Todos los eventos</span>
                </motion.button>
              </div>
            </div>

            {/* Eventos populares */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Eventos Populares
                </h2>
              </div>
              <div className="space-y-3">
                {popularEvents.map((event) => (
                  <motion.div
                    key={event._id}
                    className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {
                            categories.find((cat) => cat.id === event.category)
                              ?.icon
                          }
                        </span>
                        <h3 className="font-medium text-gray-800">
                          {event.titles}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.floor(Math.random() * 1000)} 👥
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUser;
