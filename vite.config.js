import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, '2dsim.html'), // Set home.html as your main entry
        other: resolve(__dirname, 'index.html'), 
      },
    },
  },
})