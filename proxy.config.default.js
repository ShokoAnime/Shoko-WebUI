module.exports = {
  '^/(api|plex)/.*': 'http://localhost:8111', // Set to proxy url
  '/webui/api/v3/WebUI/Theme.css': {
    target: 'http://localhost:8111',
    rewrite: path => path.replace('/webui', ''),
  },
  '/signalr': {
    target: 'http://localhost:8111',
    ws: true,
  },
};
