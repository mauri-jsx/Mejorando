import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { logoutUser } from "../api/auth";

const Home = () => {
  const navigate = useNavigate();

  // Datos simulados del usuario
  const user = {
    name: "Juan Pérez",
    profilePic: "https://via.placeholder.com/150", // Foto de perfil de ejemplo
    email: "juan.perez@example.com", // Gmail inventado
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      console.log("Respuesta del servidor:", response);
      if (response.success) {
        toast.success("Sesión cerrada exitosamente", {
          iconTheme: {
            primary: "#4caf50",
            secondary: "#fff",
          },
        });
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

  const handlePublishRedirect = () => {
    navigate("/publish");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Contenedor de usuario a la izquierda */}
      <div className="flex">
        {/* Ajuste de tamaño más grande para el perfil */}
        <aside className="w-1/3 p-6 flex justify-center items-center">
          {" "}
          {/* Se aumenta el ancho aquí */}
          <div className="flex flex-col items-center mt-20 bg-white/30 rounded-lg p-8 shadow-lg h-96 w-full">
            {" "}
            {/* Ajuste de altura y ancho completo */}
            {/* Imagen, nombre y correo */}
            <motion.img
              src={user.profilePic}
              alt="Foto de perfil"
              className="rounded-full w-32 h-32 mb-4" // Imagen más pequeña
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-semibold text-gray-800" // Nombre más pequeño
            >
              {user.name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-gray-500 text-sm" // Correo más pequeño
            >
              {user.email} {/* Gmail del usuario */}
            </motion.p>
          </div>
        </aside>

        <div className="w-2/3">
          {/* La navegación ocupa toda la pantalla */}
          <nav className="bg-white shadow-md w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-2xl font-bold text-indigo-600">
                      ViewsEvent
                    </h1>
                  </div>
                </div>
                <div className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cerrar sesión
                  </motion.button>
                </div>
              </div>
            </div>
          </nav>

          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="px-4 py-6 sm:px-0"
              >
                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                  <h2 className="text-3xl font-semibold text-gray-700">
                    Bienvenido a ViewsEvent
                  </h2>
                </div>
              </motion.div>

              {/* Nueva sección para redirigir a la página de publicar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={handlePublishRedirect}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ir a Publicar
                </button>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
