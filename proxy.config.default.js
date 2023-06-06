const proxyUrl = 'http://localhost:8111';

module.exports = {
  '^/(api|plex)/.*': proxyUrl, // Set to proxy url
  '/webui/api/v3/WebUI/Theme.css': {
    target: proxyUrl,
    rewrite: path => path.replace('/webui', ''),
  },
  '/signalr': {
    target: proxyUrl,
    ws: true,
  },
};
