/**
 * Vercel Serverless: handler único para /api/*
 * O rewrite /api/:path* -> /api envia path como query; restaurarmos para o Express
 * O middleware de rewrite DEVE rodar antes do app para corrigir req.url
 */
import express from "express";
import mainApp from "../appcoleta-backend/app.js";

const log = (tag, ...args) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${tag}]`, ...args);
};

const wrapper = express();
wrapper.use((req, res, next) => {
  const pathParam = req.query.path;
  if (pathParam && typeof pathParam === "string") {
    const queryPart = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    req.url = "/api/" + pathParam + queryPart;
    log("vercel-rewrite", req.method, pathParam, "->", req.url);
  } else {
    log("vercel-request", req.method, req.url, pathParam ? "" : "(sem path - 404?)");
  }
  next();
});
wrapper.use(mainApp);

wrapper.use((err, _req, res, _next) => {
  log("vercel-error", "Erro não tratado:", err?.message || err);
  if (err?.stack) log("vercel-error", "Stack:", err.stack);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal Server Error", detail: err?.message || String(err) });
  }
});

export default wrapper;
