import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import bodyParser from "body-parser";
import exportRoutes from "./routes/exportRoutes.js";
dotenv.config();
connectDB();
//const app = express();


 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
 app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(
  session({
      secret: process.env.SESSION_SECRET || "keyboard cat",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
      //store: new MongoStore({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

 // make user available in templates
 app.use((req, res, next) => {
 res.locals.currentUser = req.session.user || null;
 next();
 });

 app.use(bodyParser.json({ limit: "10mb" }));
 app.use(bodyParser.urlencoded({ extended: true }));
 app.locals.tagsList = [];
 app.use("/", authRoutes);


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/account", accountRoutes);
app.use('/account', exportRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// https://income-expense-data-project.onrender.com/login