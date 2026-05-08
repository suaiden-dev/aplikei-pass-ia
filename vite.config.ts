import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      'cmdk',
      'pdf-lib',
    ],
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
})
