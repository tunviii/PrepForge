import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";

import practiceRoute from "./practice.js";
import interviewRoute from "./Interview.js";

import userRoutes from "./routes/users.js";
import mongoose from "mongoose";

/* PATH SETUP */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* LOAD ENV */

dotenv.config();

/* CREATE SERVER */

const app = express();

app.use(cors());
app.use(express.json());

/* ROUTES */

app.use("/api/practice", practiceRoute);
app.use("/api/interview", interviewRoute);
app.use("/api/users", userRoutes);

/* CONNECT DATABASE */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* START SERVER */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});