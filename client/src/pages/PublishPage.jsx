import { useState } from "react";
import { Music, Heart, Palette, Users } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import Map from "../components/Map";
import { createPublication } from "../api/publish";
import "react-toastify/dist/ReactToastify.css";

const CATEGORIES = [
  {
    id: "musical",
    label: "Evento Musical",
    icon: Music,
    color: "bg-purple-100",
  },
  {
    id: "charity",
    label: "Evento Caritativo",
    icon: Heart,
    color: "bg-pink-100",
  },
  {
    id: "cultural",
    label: "Evento Cultural",
    icon: Palette,
    color: "bg-blue-100",
  },
  { id: "social", label: "Evento Social", icon: Users, color: "bg-green-100" },
];

const CustomCalendar = ({
  selectedDates,
  // eslint-disable-next-line react/prop-types
  onDateSelect,
  // eslint-disable-next-line react/prop-types
  startDate,
  // eslint-disable-next-line react/prop-types
  endDate,
}) => {
  const [currentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const getDateStatus = (date) => {
    const currentDay = new Date();
    const checkDate = new Date(date);
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;

    if (
      startDateObj &&
      endDateObj &&
      checkDate >= startDateObj &&
      checkDate <= endDateObj
    ) {
      if (checkDate <= currentDay && checkDate >= startDateObj) {
        return "bg-green-200 hover:bg-green-300"; // En curso
      } else if ((endDateObj - checkDate) / (1000 * 60 * 60 * 24) <= 7) {
        return "bg-orange-200 hover:bg-orange-300"; // Por finalizar
      }
      return "bg-gray-100 hover:bg-gray-200"; // Seleccionado
    }

    if (checkDate < currentDay) {
      return "bg-red-100 text-gray-400"; // Finalizado
    }

    return "";
  };

  const renderCalendarDays = () => {
    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
    const days = [];
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();

    // Agregar días vacíos al inicio
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];
      const status = getDateStatus(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => onDateSelect(dateString)}
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200
            ${status}
            hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-200 mr-1"></div>
          <span>En curso</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-200 mr-1"></div>
          <span>Por finalizar</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-100 mr-1"></div>
          <span>Finalizado</span>
        </div>
      </div>
    </div>
  );
};

const Publish = () => {
  const initialPosition = [-26.1845, -58.1854];
  const [formData, setFormData] = useState({
    titles: "",
    descriptions: "",
    locations: { lat: initialPosition[0], long: initialPosition[1] },
    category: "",
    medias: { photos: [], videos: [] },
    startDates: "",
    endDates: "",
  });
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.titles.trim()) errors.titles = "El título es requerido";
    if (!formData.descriptions.trim())
      errors.descriptions = "La descripción es requerida";
    if (!formData.category) errors.category = "Seleccione una categoría";
    if (!formData.startDates) errors.dates = "Seleccione la fecha de inicio";
    if (!formData.endDates) errors.dates = "Seleccione la fecha de fin";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleDateSelect = (dateString) => {
    if (!formData.startDates) {
      setFormData((prev) => ({
        ...prev,
        startDates: dateString,
      }));
    } else if (!formData.endDates && dateString >= formData.startDates) {
      setFormData((prev) => ({
        ...prev,
        endDates: dateString,
      }));
    } else {
      setFormData((prev) => ({
        startDates: dateString,
        endDates: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor, complete todos los campos requeridos");
      return;
    }

    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "locations" || key === "medias") {
        submissionData.append(key, JSON.stringify(formData[key]));
      } else {
        submissionData.append(key, formData[key]);
      }
    });

    try {
      const response = await createPublication(submissionData);
      if (response && response.message === "Publicación creada exitosamente") {
        toast.success("¡Publicación creada exitosamente!");
      } else {
        toast.error("Error al crear la publicación");
      }
    } catch (err) {
      setError("Error al crear la publicación: " + err.message);
      toast.error("Error al crear la publicación");
    }
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 animate-fade-in">
        Crear Publicación
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-2xl"
      >
        {/* Título */}
        <div className="mb-6 group">
          <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-indigo-600">
            Título
          </label>
          <input
            type="text"
            name="titles"
            value={formData.titles}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                validationErrors.titles ? "border-red-500" : "border-gray-300"
              }`}
          />
          {validationErrors.titles && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.titles}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div className="mb-6 group">
          <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-indigo-600">
            Descripción
          </label>
          <textarea
            name="descriptions"
            value={formData.descriptions}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                validationErrors.descriptions
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
          />
          {validationErrors.descriptions && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.descriptions}
            </p>
          )}
        </div>

        {/* Categorías */}
        <div className="mb-6 group">
          <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-indigo-600">
            Categoría
          </label>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "category", value: category.id },
                  })
                }
                className={`flex items-center justify-center px-4 py-2 border rounded-lg transition-all duration-300
                  ${
                    formData.category === category.id
                      ? "bg-indigo-200 border-indigo-500 text-indigo-900"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
              >
                <category.icon className="w-5 h-5 mr-2" />
                {category.label}
              </button>
            ))}
          </div>
          {validationErrors.category && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.category}
            </p>
          )}
        </div>

        {/* Ubicación */}
        <div className="mb-6 group">
          <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-indigo-600">
            Ubicación
          </label>
          <Map
            initialPosition={initialPosition}
            onLocationChange={(position) =>
              setFormData((prev) => ({
                ...prev,
                locations: { lat: position[0], long: position[1] },
              }))
            }
          />
        </div>

        {/* Fechas */}
        <div className="mb-6 group">
          <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-indigo-600">
            Fechas del Evento
          </label>
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {formData.startDates && formData.endDates
              ? `Del ${formData.startDates} al ${formData.endDates}`
              : "Selecciona las fechas"}
          </button>
          {showCalendar && (
            <CustomCalendar
              selectedDates={[formData.startDates, formData.endDates]}
              onDateSelect={handleDateSelect}
              startDate={formData.startDates}
              endDate={formData.endDates}
            />
          )}
          {validationErrors.dates && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.dates}
            </p>
          )}
        </div>

        {/* Botón para enviar */}
        <button
          type="submit"
          className="w-full bg-indigo-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-all duration-300 focus:outline-none"
        >
          Publicar
        </button>
      </form>

      {/* Contenedor de Toasts */}
      <ToastContainer />
    </div>
  );
};
export default Publish;
