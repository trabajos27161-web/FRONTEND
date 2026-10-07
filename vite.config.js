import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));
function htmlPages(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(folder, entry.name);
    return entry.isDirectory() ? htmlPages(full) : (entry.isFile() && entry.name.endsWith('.html') ? [full] : []);
  });
}
const input = [resolve(root, 'index.html'), resolve(root, 'login.html'), ...['admin','operador','tecnico'].flatMap((folder) => htmlPages(resolve(root, folder)))];

export default defineConfig({
  root,
  publicDir: 'static',
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true, rollupOptions: { input } }
});
