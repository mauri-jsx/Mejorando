import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
    fetchPublications(); // Cargar todas las publicaciones al inicio
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

      setPublications(data); // Asegúrate de que `data` contenga las publicaciones
    } catch (error) {
      toast.error("Error al cargar publicaciones");
    } finally {
      setLoadingPublications(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchPublications(category); // Llama a la función para cargar publicaciones por categoría
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
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  // Filtrado de publicaciones por categoría
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
          {/* Profile Card */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-1/3"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
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

          {/* Events Section */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-2/3"
          >
            <h2 className="text-2xl font-bold mb-4">Publicaciones</h2>
            <div className="flex flex-wrap gap-4 mb-4">
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

            {loadingPublications ? (
              <p>Cargando publicaciones...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPublications.map((pub) => (
                  <div
                    key={pub.id}
                    className="bg-white shadow-md rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-lg">{pub.title}</h3>
                    <p className="text-gray-600">{pub.description}</p>
                    <p className="text-gray-500">{pub.category}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
