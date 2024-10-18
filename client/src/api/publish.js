// Define la URL base de tu API
const API_URL = "http://localhost:4000/publications";

// Obtener todas las publicaciones
export const fetchAllPublications = async () => {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Devuelve todas las publicaciones
    } catch (error) {
        console.error("Error fetching publications:", error);
        throw error; // Lanza el error para que pueda ser manejado en otro lugar
    }
};

// Obtener publicación por ID
export const fetchPublicationById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Devuelve la publicación encontrada
    } catch (error) {
        console.error("Error fetching publication by ID:", error);
        throw error; // Lanza el error para manejarlo en otro lugar
    }
};

// Crear una nueva publicación
export const createPublication = async (publicationData) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(publicationData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Devuelve el mensaje de éxito o la publicación creada
    } catch (error) {
        console.error("Error creating publication:", error);
        throw error; // Lanza el error para manejarlo en otro lugar
    }
};

// Actualizar publicación
export const updatePublication = async (id, publicationData) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(publicationData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Devuelve el mensaje de éxito
    } catch (error) {
        console.error("Error updating publication:", error);
        throw error; // Lanza el error para manejarlo en otro lugar
    }
};

// Eliminar publicación
export const deletePublication = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Devuelve el mensaje de éxito
    } catch (error) {
        console.error("Error deleting publication:", error);
        throw error; // Lanza el error para manejarlo en otro lugar
    }
};