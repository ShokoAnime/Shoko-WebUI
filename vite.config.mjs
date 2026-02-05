import path from 'path';
import { writeFile } from 'fs/promises';
import childProcess from 'child_process';
import pkg from './package.json';

import { defineConfig } from 'vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async () => {
  const isDebug = process.env.NODE_ENV !== 'production';
  const version = await setupEnv(isDebug);

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
      applicationKey: 'shoko-webui',
      release: {
        name: isDebug ? 'dev' : `shoko-webui@${version}`,
      },
      sourcemaps: {
        assets: './dist/assets/*.js?(.map)',
      },
      reactComponentAnnotation: { enabled: true },
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
      sourcemap: 'hidden',
      chunkSizeWarningLimit: 2000
    },
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      sentryPlugin,
      tailwindcss()
    ],
    base: "/webui/"
  };
});

async function setupEnv(isDebug) {
  const gitHash = childProcess.execSync("git log --pretty=format:'%h' -n 1").toString().replace(/["']/g, '');
  const appVersion = pkg.version;
  const minimumServerVersion = '5.3.0.6';

  process.env.VITE_GITHASH = gitHash;
  process.env.VITE_APPVERSION = appVersion;
  process.env.VITE_MIN_SERVER_VERSION = minimumServerVersion;

  const output = JSON.stringify({
    git: gitHash,
    package: appVersion,
    minimumServerVersion: minimumServerVersion,
    debug: isDebug
  }, null, '  ');
  await writeFile('./public/version.json', output, 'utf8');

  return appVersion;
}
