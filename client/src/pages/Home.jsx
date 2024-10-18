import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { logoutUser } from "../api/auth";

const Home = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <nav className="bg-white shadow-md">
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
        </div>
      </main>
    </div>
  );
};

export default Home;
