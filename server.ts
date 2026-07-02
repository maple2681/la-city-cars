import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";

// Import the Vercel serverless functions directly
import loginHandler from "./api/admin/login.js";
import logoutHandler from "./api/admin/logout.js";
import carsHandler from "./api/cars.js";

const app = express();
const PORT = 3000;

app.set('trust proxy', true);
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));

// Route everything directly to the serverless handlers for perfect cross-environment parity
app.all("/api/admin/login", loginHandler);
app.all("/api/admin/logout", logoutHandler);

app.all("/api/cars", (req: any, res: any) => {
  return carsHandler(req, res);
});
app.all("/api/cars/:id", (req: any, res: any) => {
  req.query.id = req.params.id;
  return carsHandler(req, res);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
