import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getInputs() {
  const entries = await glob('src/**/*.html');
  return entries.map((entry) => resolve(__dirname, entry));
}

export default defineConfig(async () => {
  const inputs = await getInputs();

  console.log('HTML inputs:', inputs);

  return {
    root: resolve(__dirname, 'src'),
    build: {
      emptyOutDir: true,
      rollupOptions: {
        input: inputs,
      },
      outDir: resolve(__dirname, 'dist'),
    },
  };
});
