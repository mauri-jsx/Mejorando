import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  LogOut,
  Music,
  Users2,
  Theater,
  Heart,
} from "lucide-react";
import { logoutUser } from "../api/auth";

const Home = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const user = {
    name: "Juan Pérez",
    profilePic: "/api/placeholder/150/150",
    email: "juan.perez@example.com",
    eventsCreated: 12,
    eventsAttending: 5,
  };

  // Categorías actualizadas según especificación
  const categories = [
    { id: "all", name: "Todos", icon: Users2 },
    { id: "musical", name: "Musicales", icon: Music },
    { id: "social", name: "Sociales", icon: Users },
    { id: "cultural", name: "Culturales", icon: Theater },
    { id: "charity", name: "Caritativos", icon: Heart },
  ];

  // Sample featured events data con las nuevas categorías
  const featuredEvents = [
    {
      id: 1,
      title: "Festival de Rock Nacional",
      date: "2024-06-15",
      time: "18:00",
      location: "Estadio Central",
      category: "musical",
      attendees: 230,
      image: "/api/placeholder/400/200",
    },
    {
      id: 2,
      title: "Gala Benéfica Anual",
      date: "2024-06-20",
      time: "20:00",
      location: "Hotel Diplomatic",
      category: "charity",
      attendees: 150,
      image: "/api/placeholder/400/200",
    },
    {
      id: 3,
      title: "Exposición de Arte Local",
      date: "2024-06-25",
      time: "10:00",
      location: "Centro Cultural",
      category: "cultural",
      attendees: 80,
      image: "/api/placeholder/400/200",
    },
    {
      id: 4,
      title: "Fiesta de Networking",
      date: "2024-06-30",
      time: "19:00",
      location: "Business Center",
      category: "social",
      attendees: 120,
      image: "/api/placeholder/400/200",
    },
  ];

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.success) {
        toast.success("Sesión cerrada exitosamente");
        document.cookie =
          "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.message || "Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error durante el logout:", error);
      toast.error("Error de conexión");
    }
  };

  const filteredEvents =
    selectedCategory === "all"
      ? featuredEvents
      : featuredEvents.filter((event) => event.category === selectedCategory);

  const getCategoryColor = (category) => {
    const colors = {
      musical: "from-pink-500 to-rose-500",
      social: "from-blue-500 to-cyan-500",
      cultural: "from-purple-500 to-indigo-500",
      charity: "from-green-500 to-emerald-500",
      all: "from-gray-500 to-slate-500",
    };
    return colors[category] || colors.all;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-center" />

      {/* Header con navegación */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            ViewsEvent
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all"
          >
            <LogOut size={18} />
            Cerrar sesión
          </motion.button>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar con perfil */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-72 flex-shrink-0"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
            <div className="flex flex-col items-center">
              <motion.img
                src={user.profilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full ring-4 ring-indigo-100"
                whileHover={{ scale: 1.1 }}
              />
              <motion.h2
                className="mt-4 text-xl font-semibold text-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {user.name}
              </motion.h2>
              <p className="text-gray-500 text-sm">{user.email}</p>

              <div className="w-full mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">
                    {user.eventsCreated}
                  </p>
                  <p className="text-sm text-gray-600">Creados</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {user.eventsAttending}
                  </p>
                  <p className="text-sm text-gray-600">Asistiendo</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/publish")}
                className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus size={20} />
                Crear Evento
              </motion.button>
            </div>
          </div>
        </motion.aside>

        {/* Contenido principal */}
        <div className="flex-1">
          {/* Categorías */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Explorar Eventos
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${getCategoryColor(
                            category.id
                          )} text-white`
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    } transition-all`}
                  >
                    <Icon size={18} />
                    {category.name}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Grid de eventos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="wait">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {event.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(
                          event.category
                        )} text-white`}
                      >
                        {
                          categories.find((cat) => cat.id === event.category)
                            ?.name
                        }
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={18} className="mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={18} className="mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users size={18} className="mr-2" />
                        {event.attendees} asistentes
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`mt-4 w-full py-2 rounded-lg bg-gradient-to-r ${getCategoryColor(
                        event.category
                      )} text-white font-medium`}
                    >
                      Ver detalles
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
