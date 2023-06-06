module.exports = {
  '^/(api|plex|signalr)/.*': 'http://localhost:8111', // Set to proxy url
  '/signalr': {
    target: 'http://localhost:8111',
    ws: true,
  },
};
