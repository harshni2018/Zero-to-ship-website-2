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

let databaseConnection;

function ensureDatabaseConnection() {
  if (!databaseConnection) {
    databaseConnection = connectMongo();
  }
  return databaseConnection;
}

app.use((_req, _res, next) => {
  ensureDatabaseConnection().then(() => next()).catch(next);
});

app.use(comparisonRoutes);
app.use(errorHandler);

async function start() {
  await ensureDatabaseConnection();
  await new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Resume parser API is running on http://localhost:${port}`);
      resolve(server);
    });
    server.once("error", reject);
  });
}

if (!process.env.VERCEL) {
  start().catch((error) => {
    console.error(`Could not start the resume parser API on port ${port}:`, error.message);
    process.exitCode = 1;
  });
}

export default app;
