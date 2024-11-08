import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:4000/publications";

// Maneja errores de fetch
const handleFetchError = async (response) => {
  const errorText = await response.text();
  throw new Error(
    `HTTP error! Status: ${response.status}, Response: ${errorText}`
  );
};

// Obtiene las cabeceras necesarias para las peticiones
const getHeaders = () => {
  const token = Cookies.get("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), // Incluye el token si existe
  };
};

// Fetch para obtener todas las publicaciones
export const fetchAllPublications = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include", // Incluye cookies
      headers: getHeaders(),
    });
    if (!response.ok) await handleFetchError(response);
    return await response.json(); // Retorna el JSON
  } catch (error) {
    console.error("Error fetching publications:", error);
    throw error;
  }
};

// Fetch para obtener una publicación por ID
export const fetchPublicationById = async (id) => {
  if (!id) throw new Error("Invalid ID");
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(),
    });
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching publication by ID:", error);
    throw error;
  }
};

// Fetch para crear una nueva publicación
export const createPublication = async (formData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      credentials: "include",
      body: formData, // Asegúrate de que 'formData' contenga los datos correctos
      // No necesitas 'headers' aquí porque estás enviando 'formData'
    });
    if (!response.ok) await handleFetchError(response);
    toast.success("¡Publicación creada exitosamente!"); // Mensaje de éxito
    return await response.json();
  } catch (error) {
    console.error("Error creating publication:", error);
    toast.error("Error al crear la publicación"); // Mensaje de error
    throw error;
  }
};

// Fetch para actualizar una publicación existente
export const updatePublication = async (id, publicationData) => {
  if (!id) throw new Error("Invalid ID");
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: getHeaders(),
      body: JSON.stringify(publicationData), // Envía el cuerpo como JSON
    });
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    console.error("Error updating publication:", error);
    throw error;
  }
};

// Fetch para eliminar una publicación
export const deletePublication = async (id) => {
  if (!id) throw new Error("Invalid ID");
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(),
    });
    if (!response.ok) await handleFetchError(response);
    return true; // Retorna true si se elimina correctamente
  } catch (error) {
    console.error("Error deleting publication:", error);
    throw error;
  }
};

// Fetch para buscar publicaciones por categoría
export const fetchPublicationsByCategory = async (category) => {
  const trimmedCategory = category?.trim();
  if (!trimmedCategory) throw new Error("Invalid category");
  try {
    const response = await fetch(
      `${API_URL}/searched/for/category/${encodeURIComponent(trimmedCategory)}`,
      {
        method: "GET",
        credentials: "include",
        headers: getHeaders(),
      }
    );
    if (!response.ok) {
      await handleFetchError(response);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching publications by category:", error);
    throw error;
  }
};

// Fetch para alternar "me gusta" en una publicación
export const toggleLike = async (postId) => {
  if (!postId) throw new Error("Invalid Post ID");
  try {
    const response = await fetch(`${API_URL}/${postId}/like`, {
      method: "PATCH",
      credentials: "include",
      headers: getHeaders(),
    });

    if (!response.ok) await handleFetchError(response);

    const result = await response.json();
    return result; // Devolvemos solo los datos actualizados
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};


