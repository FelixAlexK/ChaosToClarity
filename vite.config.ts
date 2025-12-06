import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type PluginOption } from 'vite'
import wasm from 'vite-plugin-wasm'
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    visualizer({ open: true }) as PluginOption
  ],

  server: {
    watch: {
      usePolling: true,
    },
  },

  build: {
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              test: /node_modules\/react/,
              name: 'react',
            },
            {
              test: /node_modules\/@tailwindcss\/vite/,
              name: 'tailwind',
            },
            {
              test: /node_modules\/date-fns\/tz/,
              name: 'date-fns',
            },
            {
              test: /node_modules\/@google\/genai/,
              name: 'genai',
            }
          ]
        }
      },
    },
  },

  optimizeDeps: {
    exclude: ['@synckit-js/sdk'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
