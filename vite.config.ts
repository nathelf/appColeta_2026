import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    server: {
  host: "0.0.0.0",   // aceita qualquer origem externa
  port: 8080,

  allowedHosts: [
    ".trycloudflare.com", // libera qualquer túnel CF
  ],

  proxy: {
    "/api": {
      target: "http://localhost:3001",
      changeOrigin: true,
      secure: false,
    },
  },
},

    plugins: [
      react(),

      // Ativa apenas em DEV
      isDev ? componentTagger() : false,

      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "robots.txt",
          "icons/*.png",
          "icons/*.svg",
        ],

        // 🚫 Service Worker NUNCA em dev
        devOptions: {
          enabled: false,
        },

        manifest: {
          name: "Coleta Biométrica Neonatal",
          short_name: "Coleta Bio",
          description: "Sistema de coleta biométrica neonatal",
          theme_color: "#2563eb",
          background_color: "#f8fafc",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
            { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
            { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
            { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
            { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-384x384.png",
              sizes: "384x384",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },

        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,

          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,woff,woff2}",
          ],

          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-stylesheets",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
      }),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
