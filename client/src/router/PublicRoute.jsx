import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { getSession } from "../api/auth";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getSession();
        setUser(res.user || null);
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(null);
      }
    };

    checkAuth();
  }, []);
  if (user === undefined) {
    return <div>Cargando...</div>;
  }
  return user ? <Navigate to="/home" /> : children;
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicRoute;
