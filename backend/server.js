import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectMongo } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import comparisonRoutes from "./routes/comparisonRoutes.js";

dotenv.config();

const app = express();
const preferredPort = Number(process.env.PORT || 5050);
const port = Number.isFinite(preferredPort) && preferredPort > 0 ? preferredPort : 5050;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Resume parser backend is healthy." });
});

app.use(comparisonRoutes);
app.use(errorHandler);

async function start() {
  await connectMongo();
  app.listen(port, () => {
    console.log(`Resume parser API is running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Could not start the resume parser API:", error.message);
  process.exitCode = 1;
});
