// vite.config.ts
import { defineConfig } from "file:///H:/UTFPR/Coleta%20Biometrica/bio-sync-guardian/node_modules/vite/dist/node/index.js";
import react from "file:///H:/UTFPR/Coleta%20Biometrica/bio-sync-guardian/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///H:/UTFPR/Coleta%20Biometrica/bio-sync-guardian/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///H:/UTFPR/Coleta%20Biometrica/bio-sync-guardian/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "H:\\UTFPR\\Coleta Biometrica\\bio-sync-guardian";
var vite_config_default = defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const isProd = mode === "production";
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins: [
      react(),
      // só ativa o componentTagger em dev para não poluir produção
      isDev ? componentTagger() : false,
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "icons/*.png", "icons/*.svg"],
        // durante desenvolvimento o plugin instala um service worker em modo teste (útil para debugging)
        devOptions: isDev ? {
          enabled: true,
          type: "module"
        } : void 0,
        manifest: {
          name: "Coleta Biom\xE9trica Neonatal",
          short_name: "Coleta Bio",
          description: "Sistema de coleta biom\xE9trica neonatal",
          theme_color: "#2563eb",
          background_color: "#f8fafc",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png", purpose: "any" },
            { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png", purpose: "any" },
            { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png", purpose: "any" },
            { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png", purpose: "any" },
            { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png", purpose: "any" },
            { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
            { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png", purpose: "any maskable" },
            { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          runtimeCaching: [
            {
              // Google Fonts styles
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-stylesheets",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                  // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Google Fonts static assets
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                  // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // opcional: cache para chamadas de API do próprio domínio (ajuste conforme necessário)
              urlPattern: /^\/api\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24
                  // 1 day
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJIOlxcXFxVVEZQUlxcXFxDb2xldGEgQmlvbWV0cmljYVxcXFxiaW8tc3luYy1ndWFyZGlhblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiSDpcXFxcVVRGUFJcXFxcQ29sZXRhIEJpb21ldHJpY2FcXFxcYmlvLXN5bmMtZ3VhcmRpYW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0g6L1VURlBSL0NvbGV0YSUyMEJpb21ldHJpY2EvYmlvLXN5bmMtZ3VhcmRpYW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH06IHsgbW9kZTogc3RyaW5nIH0pID0+IHtcclxuICBjb25zdCBpc0RldiA9IG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIjtcclxuICBjb25zdCBpc1Byb2QgPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIjtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBob3N0OiBcIjo6XCIsXHJcbiAgICAgIHBvcnQ6IDgwODAsXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICByZWFjdCgpLFxyXG4gICAgICAvLyBzXHUwMEYzIGF0aXZhIG8gY29tcG9uZW50VGFnZ2VyIGVtIGRldiBwYXJhIG5cdTAwRTNvIHBvbHVpciBwcm9kdVx1MDBFN1x1MDBFM29cclxuICAgICAgaXNEZXYgPyBjb21wb25lbnRUYWdnZXIoKSA6IGZhbHNlLFxyXG4gICAgICBWaXRlUFdBKHtcclxuICAgICAgICByZWdpc3RlclR5cGU6IFwiYXV0b1VwZGF0ZVwiLFxyXG4gICAgICAgIGluY2x1ZGVBc3NldHM6IFtcImZhdmljb24uaWNvXCIsIFwicm9ib3RzLnR4dFwiLCBcImljb25zLyoucG5nXCIsIFwiaWNvbnMvKi5zdmdcIl0sXHJcbiAgICAgICAgLy8gZHVyYW50ZSBkZXNlbnZvbHZpbWVudG8gbyBwbHVnaW4gaW5zdGFsYSB1bSBzZXJ2aWNlIHdvcmtlciBlbSBtb2RvIHRlc3RlIChcdTAwRkF0aWwgcGFyYSBkZWJ1Z2dpbmcpXHJcbiAgICAgICAgZGV2T3B0aW9uczogaXNEZXZcclxuICAgICAgICAgID8ge1xyXG4gICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgdHlwZTogXCJtb2R1bGVcIixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICAgIG5hbWU6IFwiQ29sZXRhIEJpb21cdTAwRTl0cmljYSBOZW9uYXRhbFwiLFxyXG4gICAgICAgICAgc2hvcnRfbmFtZTogXCJDb2xldGEgQmlvXCIsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJTaXN0ZW1hIGRlIGNvbGV0YSBiaW9tXHUwMEU5dHJpY2EgbmVvbmF0YWxcIixcclxuICAgICAgICAgIHRoZW1lX2NvbG9yOiBcIiMyNTYzZWJcIixcclxuICAgICAgICAgIGJhY2tncm91bmRfY29sb3I6IFwiI2Y4ZmFmY1wiLFxyXG4gICAgICAgICAgZGlzcGxheTogXCJzdGFuZGFsb25lXCIsXHJcbiAgICAgICAgICBvcmllbnRhdGlvbjogXCJwb3J0cmFpdFwiLFxyXG4gICAgICAgICAgc2NvcGU6IFwiL1wiLFxyXG4gICAgICAgICAgc3RhcnRfdXJsOiBcIi9cIixcclxuICAgICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICAgIHsgc3JjOiBcIi9pY29ucy9pY29uLTcyeDcyLnBuZ1wiLCBzaXplczogXCI3Mng3MlwiLCB0eXBlOiBcImltYWdlL3BuZ1wiLCBwdXJwb3NlOiBcImFueVwiIH0sXHJcbiAgICAgICAgICAgIHsgc3JjOiBcIi9pY29ucy9pY29uLTk2eDk2LnBuZ1wiLCBzaXplczogXCI5Nng5NlwiLCB0eXBlOiBcImltYWdlL3BuZ1wiLCBwdXJwb3NlOiBcImFueVwiIH0sXHJcbiAgICAgICAgICAgIHsgc3JjOiBcIi9pY29ucy9pY29uLTEyOHgxMjgucG5nXCIsIHNpemVzOiBcIjEyOHgxMjhcIiwgdHlwZTogXCJpbWFnZS9wbmdcIiwgcHVycG9zZTogXCJhbnlcIiB9LFxyXG4gICAgICAgICAgICB7IHNyYzogXCIvaWNvbnMvaWNvbi0xNDR4MTQ0LnBuZ1wiLCBzaXplczogXCIxNDR4MTQ0XCIsIHR5cGU6IFwiaW1hZ2UvcG5nXCIsIHB1cnBvc2U6IFwiYW55XCIgfSxcclxuICAgICAgICAgICAgeyBzcmM6IFwiL2ljb25zL2ljb24tMTUyeDE1Mi5wbmdcIiwgc2l6ZXM6IFwiMTUyeDE1MlwiLCB0eXBlOiBcImltYWdlL3BuZ1wiLCBwdXJwb3NlOiBcImFueVwiIH0sXHJcbiAgICAgICAgICAgIHsgc3JjOiBcIi9pY29ucy9pY29uLTE5MngxOTIucG5nXCIsIHNpemVzOiBcIjE5MngxOTJcIiwgdHlwZTogXCJpbWFnZS9wbmdcIiwgcHVycG9zZTogXCJhbnkgbWFza2FibGVcIiB9LFxyXG4gICAgICAgICAgICB7IHNyYzogXCIvaWNvbnMvaWNvbi0zODR4Mzg0LnBuZ1wiLCBzaXplczogXCIzODR4Mzg0XCIsIHR5cGU6IFwiaW1hZ2UvcG5nXCIsIHB1cnBvc2U6IFwiYW55IG1hc2thYmxlXCIgfSxcclxuICAgICAgICAgICAgeyBzcmM6IFwiL2ljb25zL2ljb24tNTEyeDUxMi5wbmdcIiwgc2l6ZXM6IFwiNTEyeDUxMlwiLCB0eXBlOiBcImltYWdlL3BuZ1wiLCBwdXJwb3NlOiBcImFueSBtYXNrYWJsZVwiIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICAgIGdsb2JQYXR0ZXJuczogW1wiKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZix3b2ZmMn1cIl0sXHJcbiAgICAgICAgICBydW50aW1lQ2FjaGluZzogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgLy8gR29vZ2xlIEZvbnRzIHN0eWxlc1xyXG4gICAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvZm9udHNcXC5nb29nbGVhcGlzXFwuY29tXFwvLiovaSxcclxuICAgICAgICAgICAgICBoYW5kbGVyOiBcIkNhY2hlRmlyc3RcIixcclxuICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwiZ29vZ2xlLWZvbnRzLXN0eWxlc2hlZXRzXCIsXHJcbiAgICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxyXG4gICAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgLy8gMSB5ZWFyXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgLy8gR29vZ2xlIEZvbnRzIHN0YXRpYyBhc3NldHNcclxuICAgICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ3N0YXRpY1xcLmNvbVxcLy4qL2ksXHJcbiAgICAgICAgICAgICAgaGFuZGxlcjogXCJDYWNoZUZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgY2FjaGVOYW1lOiBcImdvb2dsZS1mb250cy13ZWJmb250c1wiLFxyXG4gICAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAyMCxcclxuICAgICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IC8vIDEgeWVhclxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XHJcbiAgICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIC8vIG9wY2lvbmFsOiBjYWNoZSBwYXJhIGNoYW1hZGFzIGRlIEFQSSBkbyBwclx1MDBGM3ByaW8gZG9tXHUwMEVEbmlvIChhanVzdGUgY29uZm9ybWUgbmVjZXNzXHUwMEUxcmlvKVxyXG4gICAgICAgICAgICAgIHVybFBhdHRlcm46IC9eXFwvYXBpXFwvLiovaSxcclxuICAgICAgICAgICAgICBoYW5kbGVyOiBcIk5ldHdvcmtGaXJzdFwiLFxyXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGNhY2hlTmFtZTogXCJhcGktY2FjaGVcIixcclxuICAgICAgICAgICAgICAgIG5ldHdvcmtUaW1lb3V0U2Vjb25kczogMTAsXHJcbiAgICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxyXG4gICAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgLy8gMSBkYXlcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xyXG4gICAgICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICBdLmZpbHRlcihCb29sZWFuKSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1UsU0FBUyxvQkFBb0I7QUFDN1YsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGVBQWU7QUFKeEIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQXdCO0FBQzFELFFBQU0sUUFBUSxTQUFTO0FBQ3ZCLFFBQU0sU0FBUyxTQUFTO0FBRXhCLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUE7QUFBQSxNQUVOLFFBQVEsZ0JBQWdCLElBQUk7QUFBQSxNQUM1QixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsUUFDZCxlQUFlLENBQUMsZUFBZSxjQUFjLGVBQWUsYUFBYTtBQUFBO0FBQUEsUUFFekUsWUFBWSxRQUNSO0FBQUEsVUFDRSxTQUFTO0FBQUEsVUFDVCxNQUFNO0FBQUEs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
