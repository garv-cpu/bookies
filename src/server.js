import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import job from "./lib/cron.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 8000;

job.start(); // Start the cron job

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  connectDB()
    .then(() => {
      console.log("Connected to MongoDB from Server.js");
    })
    .catch((err) => {
      console.log("Error connecting to MongoDB: ", err);
      process.exit(1); // Exit process with failure, 0 means success
    });
});
