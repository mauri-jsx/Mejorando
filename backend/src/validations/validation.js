import { body } from "express-validator";
export const loginValidations = [
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("You must enter an email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be longer than 6 characters").isLength({ max: 25 }).withMessage("Password must be less than 25 characters"),
];
export const registerValidations = [
  body("username").notEmpty().withMessage("Username is required").isLength({ min: 3 }).withMessage("Username must be longer than 3 characters"),
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("You must enter an email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be longer than 6 characters").isLength({ max: 25 }).withMessage("Password must be less than 25 characters"),
];
//title, description, lat, long, category, startDate, endDate
export const publicationsValidations = [
  body("title").notEmpty().withMessage("El título es obligatorio").isLength({ max: 100 }).withMessage("El título no puede tener más de 100 caracteres"),
  body("description").notEmpty().withMessage("La descripción es obligatoria").isLength({ max: 500 }).withMessage("La descripción no puede tener más de 500 caracteres"),
  body("category").notEmpty().withMessage("La categoría es obligatoria").isIn(["Musical", "Cultural", "Académico", "Caritativo"]).withMessage("La categoría no es válida"),
  body("startDate").notEmpty().withMessage("La fecha de inicio es obligatoria").isISO8601().withMessage("La fecha de inicio debe ser una fecha válida"),
  body("endDate")
    .notEmpty()
    .withMessage("La fecha de fin es obligatoria")
    .isISO8601()
    .withMessage("La fecha de fin debe ser una fecha válida")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }
      return true;
    }),
];
