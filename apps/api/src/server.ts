import cors from "cors";
import express from "express";
import { createRoutes } from "./routes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", createRoutes());
  return app;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 4000);
  createApp().listen(port, () => {
    console.log(`Smart care API running on http://127.0.0.1:${port}`);
  });
}
