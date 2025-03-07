import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  target: 'esnext',
  platform: 'node',
  splitting: false,
  outDir: 'dist',
  format: 'cjs',
  bundle: false,
  shims: true,
  clean: true,
  dts: true
});
