import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Edit2, LogOut, Plus, Camera, Heart } from "lucide-react";
import { updateProfilePicture, getLoggedUser, logoutUser } from "../api/auth";
import {
  fetchAllPublications,
  fetchPublicationsByCategory,
  toggleLike,
} from "../api/publish";
import { toast, Toaster } from "react-hot-toast";
import logo from "../assets/Logo1.png";

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
  const [likedPublicationIds, setLikedPublicationIds] = useState(new Set());

  const navigate = useNavigate();

  const categories = [
    { id: "musical", name: "Eventos Musicales", icon: "🎵" },
    { id: "charity", name: "Eventos Caritativos", icon: "💝" },
    { id: "cultural", name: "Eventos Culturales", icon: "🎨" },
    { id: "social", name: "Eventos Sociales", icon: "🎉" },
  ];

  useEffect(() => {
    fetchUser();
    fetchPublications(selectedCategory);
  }, [selectedCategory]);

  const fetchUser = async () => {
    try {
      const userData = await getLoggedUser();
      console.log("Datos del usuario:", userData);
      setLoggedUser(userData);
      setEmail(userData.email);
      setUsername(userData.username);
      setPreviewImage(userData.profilePicture?.url || "/default-profile.png");
      const likedPublicationsSet = new Set(
        userData.likedPublications.map((pub) => pub._id)
      );
      setLikedPublicationIds(likedPublicationsSet);
      setPublications((prevPublications) =>
        prevPublications.map((pub) => ({
          ...pub,
          liked: likedPublicationsSet.has(pub._id),
        }))
      );
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

  const handleLike = async (publicationId) => {
    try {
      const updatedPublication = await toggleLike(publicationId);
      setLikedPublicationIds((prevLikes) => {
        const newLikes = new Set(prevLikes);
        if (newLikes.has(publicationId)) {
          newLikes.delete(publicationId);
          toast.success("¡Se quitó de tus publicaciones favoritas!");
        } else {
          newLikes.add(publicationId);
          toast.success("¡Se añadió a tus publicaciones favoritas!");
        }
        return newLikes;
      });
      setPublications((prevPublications) =>
        prevPublications.map((pub) =>
          pub._id === publicationId
            ? { ...pub, liked: updatedPublication.liked }
            : pub
        )
      );
    } catch (error) {
      toast.error("Error al alternar 'me gusta'");
    }
  };

  const filteredPublications =
    selectedCategory === "all"
      ? publications
      : publications.filter((pub) => pub.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-md px-8 py-4 flex justify-center items-center"
      >
        <motion.div whileHover={{ scale: 1.05 }} className="mr-auto">
          <img src={logo} alt="ViewsEvents Logo" className="h-20" />
        </motion.div>
        <div className="flex items-center gap-4 ml-auto">
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
          {/* izquierda Column - Categorías - Publicaciones Favoritas */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-1/4 sticky top-0 mx-auto"
          >
            {/* Categorías */}
            <div className="bg-white rounded-xl shadow-xl p-6 transition-all duration-300 ease-in-out transform hover:scale-105">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Categorías
              </h3>
              <div className="flex flex-col gap-4">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out ${
                      selectedCategory === category.id
                        ? "bg-purple-600 text-white shadow-xl"
                        : "bg-gray-200 text-gray-800 hover:bg-purple-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {category.icon} {category.name}
                  </motion.button>
                ))}
                <motion.button
                  onClick={() => handleCategoryChange("all")}
                  className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out ${
                    selectedCategory === "all"
                      ? "bg-purple-600 text-white shadow-xl"
                      : "bg-gray-200 text-gray-800 hover:bg-purple-100"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  Todos
                </motion.button>
              </div>
            </div>

            {/* Tarjeta de publicaciones favoritas */}
            <div className="bg-white rounded-xl shadow-xl p-6 mt-8 transition-all duration-300 ease-in-out transform hover:scale-105">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Publicaciones Favoritas
              </h3>

              <div className="space-y-4">
                {Array.from(likedPublicationIds).map((publicationId) => {
                  const publication = publications.find(
                    (pub) => pub._id === publicationId
                  );

                  if (!publication) return null;

                  const userProfilePicture =
                    loggedUser?.profilePicture?.url || "/default-profile.png"; // Foto de perfil del usuario
                  return (
                    <div
                      key={publication._id}
                      className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out"
                    >
                      <div className="flex items-center gap-4">
                        {/* Foto de perfil redondeada */}
                        <img
                          src={userProfilePicture}
                          alt="Perfil"
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                        />
                        {/* Título de la publicación */}
                        <span className="text-md font-semibold text-gray-700">
                          {publication.titles}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Corazón para indicar que tiene like */}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLike(publication._id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Heart size={20} />
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Center Column - Publications */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-2/5 md:w-2/3 sm:w-11/12 mx-auto overflow-y-auto p-4 mt-[-11px]"
          >
            {loadingPublications ? (
              <p className="text-center text-lg text-gray-500">
                Cargando publicaciones...
              </p>
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
                        className="bg-white rounded-xl shadow-xl p-6 relative w-full mx-auto hover:shadow-2xl transition-shadow duration-300 ease-in-out"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {pub.medias?.photos?.[0]?.url && (
                          <div className="relative w-full h-64 md:h-72 lg:h-80 overflow-hidden rounded-xl mb-4">
                            <img
                              src={pub.medias.photos[0].url}
                              alt={pub.titles}
                              className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
                            />
                            <motion.div
                              className="absolute bottom-4 left-4 bg-blue-500/80 text-white px-3 py-2 rounded-full text-xs font-medium shadow-md flex items-center gap-1 cursor-pointer overflow-hidden"
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
                        <h3 className="font-semibold text-xl text-center text-gray-800 mb-2">
                          {pub.titles}
                        </h3>
                        <p className="text-gray-600 text-sm text-left mb-2">
                          📅 Fecha de Inicio: {formattedStartDate} -{" "}
                          {formattedStartTime}
                        </p>
                        <p className="text-gray-600 text-sm text-left">
                          📅 Fecha de Fin: {formattedEndDate} -{" "}
                          {formattedEndTime}
                        </p>

                        {/* Botón de Like en la parte inferior derecha */}
                        <motion.button
                          onClick={() => handleLike(pub._id)}
                          className="absolute bottom-6 right-6 bg-transparent flex items-center text-red-600 hover:text-red-800 transition-colors duration-300"
                        >
                          {/* Aquí cambiamos el renderizado entre Heart (icono) y ❤️ (emoji) */}
                          {likedPublicationIds.has(pub._id) ? (
                            <span className="text-2xl">❤️</span>
                          ) : (
                            <Heart
                              size={28}
                              className="transition-colors text-gray-400 hover:text-red-600"
                            />
                          )}
                        </motion.button>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </motion.div>

          {/* derecha Column - Profile */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: -10, opacity: 1 }}
            className="lg:w-1/4 md:w-1/3 sm:w-11/12 sticky top-0 mx-auto"
          >
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-2xl p-6 mb-8 transform hover:scale-105 transition duration-300 ease-in-out">
              <div className="relative mb-6">
                {/* Foto de perfil */}
                <img
                  src={previewImage || "/default-profile.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-xl"
                />
                {/* Editar foto */}
                {isEditing && (
                  <label
                    htmlFor="profilePicture"
                    className="absolute bottom-0 right-1/3 cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-purple-600 text-white p-2 rounded-full shadow-md"
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

              {/* Formulario de edición o visualización */}
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 bg-gray-100"
                    placeholder="Nombre de usuario"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 bg-gray-100"
                    placeholder="Email"
                  />
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg shadow-md"
                    >
                      {loading ? "Guardando..." : "Guardar"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg shadow-md"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  {/* Nombre de usuario - ahora aparece arriba del email */}
                  <p className="text-gray-800 text-2xl font-semibold mb-2">
                    {username}
                  </p>
                  <p className="text-gray-600 text-lg mb-4">{email}</p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="text-purple-600 flex items-center gap-2 mx-auto font-medium"
                  >
                    <Edit2 size={18} />
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
