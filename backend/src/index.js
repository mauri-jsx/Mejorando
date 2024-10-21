import express from "express";
import cors from "cors";
import morgan from "morgan";
import color from "chalk";
import { PORT, SECRET_KEY, IS_PRODUCTION } from "./config/config.js";
import database from "./db/database.js";
import userRouter from "./routers/user.routes.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import publicationsRoutes from "./routers/publications.routes.js";
import fileUpload from "express-fileupload";
import mediaRouter from "./routers/medias.routes.js";
import reqRouter from "./routers/request.routes.js";

const app = express();

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);


app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "Lax",
    },
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./src/uploads",
    limits: { fileSize: 50 * 1024 * 1024 },
    cleanup: true,
  })
);
app.use(cookieParser());

// Rutas
app.use(userRouter);
app.use(publicationsRoutes);
app.use(mediaRouter);
app.use(reqRouter);

database();

app.listen(PORT, () => {
  console.log();
  console.log(color.blue("------------------------------------------------"));
  console.log(color.cyan(`Server is running at http://localhost:${PORT}`));
  console.log(color.blue("------------------------------------------------"));
  console.log();
});
