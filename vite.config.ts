import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react()],
    server: {
      open: env.VITE_OPEN !== 'false',
      host: 'localhost',
      port: (env.VITE_PORT && Number(env.VITE_PORT)) || 5173,
      hmr: true,
    },
    optimizeDeps: {
      exclude: ['@fireblocks/ncw-js-sdk', 'tsl-apple-cloudkit'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true,
          }),
        ],
      },
    },
  }
})
