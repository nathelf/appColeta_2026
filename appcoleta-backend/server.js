/**
 * Servidor local (desenvolvimento) - usa app.js e adiciona static + SPA fallback
 * No Vercel, apenas app.js é usado via api/[[...path]].js
 */
import path from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";
import app from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");

// Static + SPA fallback (apenas se dist existir, ex: após npm run build)
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
