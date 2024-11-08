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
          {/* izquierda Column - Categorías */}
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

            {/* Tarjeta de publicaciones que has dado "me gusta" */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Publicaciones que me gustan
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
                      className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {/* Foto de perfil redondeada */}
                        <img
                          src={userProfilePicture}
                          alt="Perfil"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {/* Título de la publicación */}
                        <span className="text-sm font-semibold">
                          {publication.titles}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Corazón para indicar que tiene like */}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLike(publication._id)}
                          className="text-red-500"
                        >
                          <Heart size={18} />
                        </motion.button>

                        {/* X para eliminar el like */}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeLike(publication._id)}
                          className="text-gray-500"
                        >
                          <span className="text-xl">❌</span>
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
            className="lg:w-1/3 md:w-1/2 sm:w-11/12 mx-auto overflow-y-auto max-h-[80vh] p-4"
          >
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
                        className="bg-white shadow-lg rounded-lg p-5 relative w-full mx-auto"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {pub.medias?.photos?.[0]?.url && (
                          <div className="relative w-full h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                            <img
                              src={pub.medias.photos[0].url}
                              alt={pub.titles}
                              className="w-full h-full object-cover"
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
                        <h3 className="font-semibold text-lg mt-3 mb-2 text-center">
                          {pub.titles}
                        </h3>
                        {/* Alinear las fechas a la izquierda */}
                        <p className="text-gray-600 text-xs text-left">
                          📅 Fecha de Inicio: {formattedStartDate} -{" "}
                          {formattedStartTime}
                        </p>
                        <p className="text-gray-600 text-xs text-left">
                          📅 Fecha de Fin: {formattedEndDate} -{" "}
                          {formattedEndTime}
                        </p>

                        {/* Botón de Like en la parte inferior derecha */}
                        <motion.button
                          onClick={() => handleLike(pub._id)}
                          className="absolute bottom-4 right-4 bg-transparent flex items-center"
                        >
                          <Heart
                            size={24}
                            className={`transition-colors ${
                              likedPublicationIds.has(pub._id)
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                          />
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
