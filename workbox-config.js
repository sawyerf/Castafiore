module.exports = {
  globDirectory: './dist/',
  swDest: 'dist/serviceWorker.js',
  globPatterns: ["**/*.{html,js,css,png,jpg,jpeg,gif,svg,json,woff2,woff,eot,ttf}",],
  dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
  globIgnores: [
    'asset-manifest.json$',
    '**/*.map$',
    '**/LICENSE',
    '**/*.js.gz$',
    '**/(apple-touch-startup-image|chrome-icon|apple-touch-icon).*.png$',
  ],
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.match(/\/rest\/getCoverArt$/),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'coverArt',
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.match(/\/rest\/(getAlbumList2|getAlbum|favorited|getAlbum|getStarred2|getPlaylists|getArtist|getPlaylist|getTopSongs|getArtistInfo|getRandomSongs|search3)$/),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api',
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.match(/\/rest\/getSimilarSongs$/),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'apiLongResponse',
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.match(/\/rest\/stream$/),
      handler: 'CacheFirst',
      options: {
        cacheName: 'song',
      },
    },
    {
      urlPattern: ({ url }) => url.hostname === 'lrclib.net' || url.pathname.match(/\/rest\/getLyricsBySongId$/),
      handler: 'CacheFirst',
      options: {
        cacheName: 'lyrics',
      },
    },
  ],
};