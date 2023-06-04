const fs = require('fs');
const del = require('del');
const ejs = require('ejs');
const webpack = require('webpack');

let configPath = './run.config';
let webpackConfigPath = './webpack.config';
try {
  fs.accessSync(`${configPath}.js`, fs.constants.F_OK);
} catch (ex) {
  configPath += '.default';
}
try {
  fs.accessSync(`${webpackConfigPath}.js`, fs.constants.F_OK);
} catch (ex) {
  webpackConfigPath += '.default';
}
const config = require(configPath);

const tasks = new Map();

function run(task) {
  const start = new Date();
  console.log(`Starting '${task}'...`);
  return Promise.resolve().then(() => tasks.get(task)()).then(() => {
    console.log(`Finished '${task}' after ${new Date().getTime() - start.getTime()}ms`);
  }, (err) => {
    if (Array.isArray(err)) {
      err.forEach(error => console.error(error.stack));
    } else if (err.hasOwnProperty(stack)) {
      console.error(err.stack);
    }
    return Promise.reject(null); // Returning null here prevents duplicate output
  });
}

function getEnvironment() {
  const nodeenv = process.env.NODE_ENV;
  if ((nodeenv === 'development' || nodeenv === 'production')) return nodeenv;
  return global.DEBUG ? '"development"' : '"production"';
}

//
// Run tests
// -----------------------------------------------------------------------------
tasks.set('version', () => {
  const childProcess = require('child_process');
  const pkg = require('./package.json');
  const gitHash = childProcess.execSync("git log --pretty=format:'%h' -n 1").toString().replace(/["']/g, '');
  const appVersion = JSON.stringify(pkg.version);
  const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');

  const template = fs.readFileSync('./templates/version.ejs', 'utf8');
  const render = ejs.compile(template, { filename: './templates/version.ejs' });
  const output = render({ git: gitHash, version: appVersion, debug: isDebug });
  fs.writeFileSync('./public/version.json', output, 'utf8');
});

//
// Clean up the output directory
// -----------------------------------------------------------------------------
tasks.set('clean', () => del(['public/dist/*', '!public/dist/.git'], { dot: true }));

//
// Copy ./index.html into the /public folder
// -----------------------------------------------------------------------------
tasks.set('html', () => {
  const webpackConfig = require(webpackConfigPath);

  const assets = JSON.parse(fs.readFileSync('./public/dist/assets.json', 'utf8'));
  const template = fs.readFileSync('./templates/index.ejs', 'utf8');
  const render = ejs.compile(template, { filename: './templates/index.ejs' });
  const output = render({
    debug: webpackConfig.debug, bundle: assets.main.js, css: assets.main.css, config,
  });
  fs.writeFileSync('./public/index.html', output, 'utf8');
});

//
// Bundle JavaScript, CSS and image files with Webpack
// -----------------------------------------------------------------------------
tasks.set('bundle', () => {
  const webpackConfig = require(webpackConfigPath);

  console.log(`Node env ${global.NODE_ENV}`);

  return new Promise((resolve, reject) => {
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        reject(err);
      } else if (stats.hasErrors()) {
        reject(stats.toJson().errors);
      } else {
        console.log(stats.toString(webpackConfig.stats));
        resolve();
      }
    });
  });
});

//
// Make release zip file
//
tasks.set('release', () => {
  const zipFolder = require('zip-a-folder');

  if (fs.existsSync('./public/dist/sourcemaps'))
    fs.rmdirSync('./public/dist/sourcemaps', { recursive: true });
  return zipFolder.zip('./public', process.env.NODE_ENV === 'development' ? './build/latest-unstable.zip' : './build/latest.zip')
    .then(() => { console.log('Release build created!'); });
});

//
// Build website into a distributable format
// -----------------------------------------------------------------------------
tasks.set('build', () => {
  global.DEBUG = process.argv.includes('--debug') || false;
  global.BUILDING = true;
  global.NODE_ENV = getEnvironment();
  return Promise.resolve()
    .then(() => run('clean'))
    .then(() => run('version'))
    .then(() => run('bundle'))
    .then(() => run('html'))
    .then(() => run('release'));
});

//
// Build website and launch it in a browser for testing (default)
// -----------------------------------------------------------------------------
tasks.set('start', () => {
  let count = 0;
  global.HMR = !process.argv.includes('--no-hmr'); // Hot Module Replacement (HMR)
  return run('clean').then(() => run('version')).then(() => new Promise((resolve) => {
    const bs = require('browser-sync').create();
    const webpackConfig = require(webpackConfigPath);
    const { createProxyMiddleware } = require('http-proxy-middleware');

    const compiler = webpack(webpackConfig);
    // Node.js middleware that compiles application in watch mode with HMR support
    // http://webpack.github.io/docs/webpack-dev-middleware.html
    const webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
      publicPath: webpackConfig.output.publicPath,
      stats: webpackConfig.stats,
    });

    const middleware = [];
    if (config.apiProxyUrl) {
      const proxyMiddleware = createProxyMiddleware(['/api', '/plex', '/signalr'], {
        target: `http://${config.apiProxyUrl}`,
        ws: true,
        logLevel: 'error',
        changeOrigin: true, // for vhosted sites, changes host header to match to target's host
      });
      middleware.push(proxyMiddleware);
    }
    middleware.push(webpackDevMiddleware);
    middleware.push(require('webpack-hot-middleware')(compiler));
    middleware.push(require('connect-history-api-fallback')());

    compiler.hooks.done.tap('run', (stats) => {
      // Generate index.html page
      const bundle = Array.from(stats.compilation.chunks).find(x => x.name === 'main').files.values().next().value;
      const template = fs.readFileSync('./templates/index.ejs', 'utf8');
      const render = ejs.compile(template, { filename: './templates/index.ejs' });
      const output = render({ debug: true, bundle: `/dist/${bundle}`, config });
      fs.writeFileSync('./public/index.html', output, 'utf8');

      // Launch Browsersync after the initial bundling is complete
      // For more information visit https://browsersync.io/docs/options
      // eslint-disable-next-line no-plusplus
      if (++count === 1) {
        bs.init({
          port: process.env.PORT || 3000,
          ui: { port: Number(process.env.PORT || 3000) + 1 },
          server: {
            baseDir: 'public',
            middleware,
          },
          serveStatic: [{
            route: ['/webui'],
            dir: 'public',
          }],
        }, resolve);
      }
    });
  }));
});

// Execute the specified task or default one. E.g.: node run build
run(/^\w/.test(process.argv[2] || '') ? process.argv[2] : 'start' /* default */).catch(() => process.exit(1));
