import { useState } from "react";
import Map from "../components/Map"; // Asegúrate de que la ruta de importación sea correcta
import { createPublication } from "../api/publish"; // Asegúrate de ajustar la ruta de importación

const Publish = () => {
  const initialPosition = [-26.1845, -58.1854]; // Posición inicial del mapa
  const [formData, setFormData] = useState({
    titles: "",
    descriptions: "",
    locations: { lat: initialPosition[0], long: initialPosition[1] },
    category: "",
    medias: { photos: [], videos: [] },
    startDates: "",
    endDates: "",
  });
  const [markerPosition, setMarkerPosition] = useState(initialPosition);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name.includes("lat") || name.includes("long")
          ? { ...prevData.locations, [name]: value } // Actualiza lat/long
          : value,
    }));
  };

  // Maneja la carga de imágenes
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const photos = files.map((file) => ({
      _id: file.name,
      url: URL.createObjectURL(file),
    }));
    setFormData((prevData) => ({
      ...prevData,
      medias: { ...prevData.medias, photos },
    }));
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Crear un objeto FormData para enviar archivos
    const submissionData = new FormData();
    submissionData.append("titles", formData.titles);
    submissionData.append("descriptions", formData.descriptions);
    submissionData.append("locations", JSON.stringify(formData.locations)); // Convierte a cadena
    submissionData.append("category", formData.category);
    submissionData.append("startDates", formData.startDates);
    submissionData.append("endDates", formData.endDates);

    // Agregar fotos al FormData
    formData.medias.photos.forEach((photo) => {
      submissionData.append("medias[photos]", JSON.stringify(photo)); // Enviar como cadena
    });

    try {
      const response = await createPublication(submissionData);
      if (response.ok) {
        // Asegúrate de manejar la respuesta correctamente
        setSuccess("Publicación creada exitosamente!");
        console.log(await response.json()); // Mostrar la respuesta de la API
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (err) {
      setError("Error al crear la publicación: " + err.message);
    }
  };

  // Función para actualizar la posición del marcador y la ubicación
  const handleMarkerPositionChange = (lat, long) => {
    setMarkerPosition([lat, long]);
    setFormData((prevData) => ({
      ...prevData,
      locations: { lat, long },
    }));
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl mb-4">Crear Publicación</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div>
          <label>Título:</label>
          <input
            type="text"
            name="titles"
            value={formData.titles}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea
            name="descriptions"
            value={formData.descriptions}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Ubicación (Latitud):</label>
          <input
            type="number"
            name="lat"
            value={formData.locations.lat}
            onChange={handleChange}
            required
            disabled // Deshabilitado ya que se selecciona en el mapa
          />
        </div>
        <div>
          <label>Ubicación (Longitud):</label>
          <input
            type="number"
            name="long"
            value={formData.locations.long}
            onChange={handleChange}
            required
            disabled // Deshabilitado ya que se selecciona en el mapa
          />
        </div>
        <div>
          <label>Categoría:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            name="startDates"
            value={formData.startDates}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Fecha de Fin:</label>
          <input
            type="date"
            name="endDates"
            value={formData.endDates}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Cargar Imágenes:</label>
          <input type="file" multiple onChange={handleMediaChange} />
        </div>
        <button type="submit">Publicar</button>
      </form>

      {/* Mapa */}
      <Map setAddress={handleMarkerPositionChange} />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
};

export default Publish;
