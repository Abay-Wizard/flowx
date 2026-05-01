import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://flowx-jlry.onrender.com",
        changeOrigin: true,
      },
      "/auth": {
        target: "https://flowx-jlry.onrender.com",
        changeOrigin: true,
        // If your backend expects '/demo-login' but your frontend sends '/auth/demo-login',
        // use this rewrite line to strip the '/auth' prefix:
        rewrite: (path) => path.replace(/^\/auth/, ""),
      },
    },
  },
});