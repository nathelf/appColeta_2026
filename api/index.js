/**
 * Vercel Serverless: handler único para /api/*
 * O rewrite /api/:path* -> /api envia path como query; restaurarmos para o Express
 */
import app from "../appcoleta-backend/app.js";

// Middleware: quando Vercel rewrite envia path como query (?path=auth/login), restaurar req.url
app.use((req, res, next) => {
  const pathParam = req.query.path;
  if (pathParam && typeof pathParam === "string") {
    req.url = "/api/" + pathParam + (req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "");
  }
  next();
});

export default app;
