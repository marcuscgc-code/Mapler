import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      // O atalho '@' agora aponta para a própria pasta raiz do projeto.
      '@': path.resolve(__dirname, './'),
    },
  },
});