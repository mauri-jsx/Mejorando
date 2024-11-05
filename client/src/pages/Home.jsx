import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Edit2, LogOut, Plus, Camera } from "lucide-react";
import { updateProfilePicture, getLoggedUser, logoutUser } from "../api/auth";
import {
  fetchAllPublications,
  fetchPublicationsByCategory,
} from "../api/publish";
import { toast, Toaster } from "react-hot-toast";

const Home = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  const categories = [
    { id: "musical", name: "Eventos Musicales", icon: "🎵" },
    { id: "charity", name: "Eventos Caritativos", icon: "💝" },
    { id: "cultural", name: "Eventos Culturales", icon: "🎨" },
    { id: "social", name: "Eventos Sociales", icon: "🎉" },
  ];

  useEffect(() => {
    fetchUser();
    fetchPublications();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await getLoggedUser();
      setLoggedUser(userData);
      setEmail(userData.email);
      setUsername(userData.username);
      setPreviewImage(userData.profilePicture?.url || "/default-profile.png");
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
    }
  };

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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (email !== loggedUser.email) formData.append("email", email);
    if (username !== loggedUser.username) formData.append("username", username);
    if (profilePicture) formData.append("media", profilePicture);

    try {
      await updateProfilePicture(formData);
      toast.success("Perfil actualizado exitosamente");
      setIsEditing(false);
    } catch (error) {
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.success) {
        toast.success("Sesión cerrada exitosamente");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  const filteredPublications =
    selectedCategory === "all"
      ? publications
      : publications.filter((pub) => pub.category === selectedCategory);

  // Categorizar eventos por fecha
  const getEventStatus = (endDate) => {
    const now = new Date();
    if (now < new Date(endDate)) return "ongoing"; // Eventos que siguen en curso
    if (
      now >= new Date(endDate) &&
      now <= new Date(endDate).setDate(new Date(endDate).getDate() + 1)
    )
      return "ending"; // Evento por finalizar
    return "ended"; // Evento finalizado
  };

  const upcomingEvents = filteredPublications.filter((pub) => {
    const eventStatus = getEventStatus(pub.endDates);
    return eventStatus === "ending" || eventStatus === "ongoing";
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-md px-8 py-4 flex justify-between items-center"
      >
        <motion.h1
          className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          ViewsEvents
        </motion.h1>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/publish")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Crear Publicación
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </motion.button>
        </div>
      </motion.nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* izquierda Column - Categories */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-1/4 sticky top-0"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Categorías</h3>
              <div className="flex flex-col gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-full ${
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
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>

            {/* Tarjeta de Recomendación de Eventos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 mt-8 hover:bg-gray-100 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-4 text-center">
                Recomendación de Eventos
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                Explora eventos populares que podrían interesarte.
              </p>
              <div className="flex items-center gap-2 mb-4 justify-center">
                <span className="text-gray-800 font-semibold">Seguidores:</span>
                <span className="text-purple-600 font-bold">
                  {loggedUser?.followersCount || 1250}{" "}
                  {/* Valor ficticio predeterminado */}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {upcomingEvents.map((event) => {
                  const eventStatus = getEventStatus(event.endDates);
                  let bgColor, statusText;

                  if (eventStatus === "ongoing") {
                    bgColor = "bg-green-500";
                    statusText = "En Curso 🟢";
                  } else if (eventStatus === "ending") {
                    bgColor = "bg-orange-500";
                    statusText = "Por Finalizar 🟠";
                  } else {
                    bgColor = "bg-red-500";
                    statusText = "Finalizado 🔴";
                  }

                  return (
                    <a
                      key={event.id}
                      href={`/evento/${event.id}`}
                      className={`p-4 rounded-lg shadow-lg ${bgColor} text-white transition-all duration-200 hover:bg-opacity-90`}
                    >
                      <h4 className="font-semibold">{event.titles}</h4>
                      <p className="text-sm">{event.descriptions}</p>
                      <span className="text-xs font-bold mt-2 block">
                        {statusText}
                      </span>
                    </a>
                  );
                })}
              </div>
              <div className="mt-4 text-sm text-center text-gray-500">
                <p className="mb-2">Leyenda:</p>
                <p className="text-green-500">🟢 En Curso</p>
                <p className="text-orange-500">🟠 Por Finalizar</p>
                <p className="text-red-500">🔴 Finalizado</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Center Column - Publications */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-1/2 md:w-2/3 sm:w-11/12 mx-auto overflow-y-scroll max-h-[80vh]"
          >
            <h2 className="text-2xl font-bold text-center mb-4">
              Publicaciones
            </h2>
            {loadingPublications ? (
              <p className="text-center">Cargando publicaciones...</p>
            ) : (
              <div className="flex flex-col gap-6">
                {filteredPublications
                  .slice()
                  .reverse()
                  .map((pub) => {
                    const startDate = new Date(pub.startDates);
                    const endDate = new Date(pub.endDates);
                    const formattedStartDate = startDate.toLocaleDateString();
                    const formattedStartTime = startDate.toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                          📅 Fecha de Fin: {formattedEndDate} -{" "}
                          {formattedEndTime}
                        </p>
                        <motion.button className="mt-4 flex items-center justify-center mx-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-full hover:shadow-lg transition-all duration-300 font-semibold">
                          Ver más sobre el evento{" "}
                          <span className="ml-2">➡️</span>
                        </motion.button>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </motion.div>

          {/* derecha Column - Profile  */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-1/4 sticky top-0"
          >
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="relative mb-6">
                <img
                  src={previewImage || "/default-profile.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
                {isEditing && (
                  <label
                    htmlFor="profilePicture"
                    className="absolute bottom-0 right-1/3 cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-purple-600 text-white p-2 rounded-full"
                    >
                      <Camera size={20} />
                    </motion.div>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
                    placeholder="Nombre de usuario"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
                    placeholder="Email"
                  />
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg"
                    >
                      {loading ? "Guardando..." : "Guardar"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">{username}</h2>
                  <p className="text-gray-600 mb-4">{email}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="text-purple-600 flex items-center gap-2 mx-auto"
                  >
                    <Edit2 size={16} />
                    Editar Perfil
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
