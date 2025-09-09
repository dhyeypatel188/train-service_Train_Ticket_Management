import express from "express";
import "reflect-metadata"; // <-- This must be the FIRST import
import cors from "cors";
import bodyParser from "body-parser";

import trainRoutes from "./Module/Train/train.router";
import stationRoutes from "./Module/Station/station.router";
import schedularRoutes from "./Module/TrainSchedule/train-schedule.router";
import { stat } from "fs";
const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins (you can restrict to your frontend URL later)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options("*", cors());

// Routes
// app.use("/api", adminRoutes);
// app.use("/api", authRouters);
app.use("/api", trainRoutes);
app.use("/api", stationRoutes);
app.use("/api", schedularRoutes);
// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handling middleware

export default app;
