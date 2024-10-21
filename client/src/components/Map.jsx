import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Configurar el ícono del marcador
const customIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// eslint-disable-next-line react/prop-types
const Map = ({ setAddress }) => {
  const initialPosition = [-26.1845, -58.1854];
  const [markerPosition, setMarkerPosition] = useState(initialPosition);

  const LocationMarker = () => {
    useMapEvents({
      // Cambiar 'click' a 'pointerdown' para utilizar la nueva API
      pointerdown(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        setAddress(lat, lng); // Actualizar latitud y longitud
      },
    });
    return null;
  };

  const handleMarkerDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setMarkerPosition([lat, lng]);
    setAddress(lat, lng); // Actualizar latitud y longitud
  };

  return (
    <div className="w-full h-96">
      <MapContainer
        center={initialPosition}
        zoom={13} // Comenzar con un zoom más bajo
        maxZoom={19} // Mantener el zoom máximo
        style={{ height: "100%", width: "100%" }}
      >
        {/* Usamos OpenStreetMap para los tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <LocationMarker />
        <Marker
          position={markerPosition}
          draggable={true} // Hacer el marcador movible
          eventHandlers={{
            dragend: handleMarkerDragEnd, // Maneja el evento cuando el marcador termina de moverse
          }}
          icon={customIcon} // Usar el ícono personalizado
        />
      </MapContainer>
    </div>
  );
};

export default Map;
