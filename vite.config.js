import { defineConfig } from 'vite';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(async () => {
  const isDebug = process.env.NODE_ENV !== 'production';
  const version = setupEnv();

  let proxy = {};
  try {
    proxy = await import('./proxy.config');
  } catch {}

  let sentryPlugin;
  if (process.env.SENTRY_AUTH_TOKEN) {
    sentryPlugin = sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'shoko-anime',
      project: 'shoko-webui',
      release: isDebug ? 'dev' : version,
      include: './dist',
      urlPrefix: '~/webui/dist/',
      ignore: [],
    });
  }

  return {
    server: {
      open: "/webui/",
      port: 3000,
      proxy,
    },
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
      ],
    },
    build: {
      sourcemap: true,
    },
    plugins: [react(), sentryPlugin],
  };
});

function setupEnv() {
  const childProcess = require('child_process');
  const pkg = require('./package.json');
  const gitHash = childProcess.execSync("git log --pretty=format:'%h' -n 1").toString().replace(/["']/g, '');
  const appVersion = JSON.stringify(pkg.version);

  process.env.VITE_GITHASH = gitHash;
  process.env.VITE_APPVERSION = appVersion;

  return appVersion;
}
