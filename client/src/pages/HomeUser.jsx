import { useNavigate } from "react-router-dom";

const HomeUser = () => {
  const navigate = useNavigate();

  // Aquí verificamos si existe un token en la cookie
  const isAuthenticated = document.cookie.includes("authToken");

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {!isAuthenticated ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-6">
            ¡Bienvenido a ViewsEvent!
          </h2>
          <p className="mb-4 text-gray-600">
            Por favor, inicia sesión o regístrate para continuar.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Iniciar sesión
            </button>
            <button
              onClick={handleRegister}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Registrarse
            </button>
          </div>
        </div>
      ) : (
        <div className="justify-center">
          <h2 className="text-2xl font-bold text-gray-700">Estás logueado</h2>
        </div>
      )}
    </div>
  );
};

export default HomeUser;
