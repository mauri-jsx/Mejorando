import { useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { registerUser } from "../api/auth";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!username) newErrors.username = "El nombre de usuario es obligatorio";
    if (!email) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }
    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const res = await registerUser({ username, email, password });
        if (res.message === "Usuario registrado con éxito") {
          toast.success("Usuario creado con éxito");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          toast.error(res.message || "Error al registrar usuario");
        }
      } catch (error) {
        toast.error("Error de conexión");
      }
    }
  };

  const clearError = (field) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[field];
      return newErrors;
    });
  };

  const inputVariants = {
    focus: { scale: 1.02, borderColor: "#8B5CF6" },
    error: { scale: 1.02, borderColor: "#EF4444" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 relative">
      {/* Botón de inicio */}
      <motion.button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Home className="w-6 h-6 text-purple-600" />
      </motion.button>

      <div className="flex justify-center items-center min-h-screen">
        <Toaster position="top-center" reverseOrder={false} />
        <motion.div
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg mx-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Registrarse</h1>
            <p className="mt-2 text-gray-600">
              Únete a nuestra comunidad de eventos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="username"
              >
                Nombre de usuario
              </label>
              <motion.input
                variants={inputVariants}
                whileFocus="focus"
                animate={errors.username ? "error" : ""}
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearError("username");
                }}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Ingresa tu nombre de usuario"
              />
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.username}
                </motion.p>
              )}
            </div>

            <div>
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <motion.input
                variants={inputVariants}
                whileFocus="focus"
                animate={errors.email ? "error" : ""}
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Ingresa tu correo electrónico"
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Contraseña
              </label>
              <motion.input
                variants={inputVariants}
                whileFocus="focus"
                animate={errors.password ? "error" : ""}
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Ingresa tu contraseña"
              />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
            >
              Crear cuenta
            </motion.button>
          </form>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <motion.button
                onClick={() => navigate("/login")}
                className="font-medium text-purple-600 hover:text-purple-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Iniciar sesión
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
