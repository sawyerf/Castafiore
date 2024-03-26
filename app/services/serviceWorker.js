import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
	({ url }) => {
		return url.origin === self.location.origin && url.pathname.endsWith(".png")
	},
	new CacheFirst({
		cacheName: "images",
		plugins: [
			new ExpirationPlugin({
				maxAgeSeconds: 60 * 60 * 24 * 7,
			}),
		],
	})
);

registerRoute(
	({ url }) => {
		return url.pathname.match(/\/rest\/getCoverArt$/)
	},
	new StaleWhileRevalidate({
		cacheName: "coverArt",
	})
);

registerRoute(
	({ url }) => {
		return url.pathname.match(/\/rest\/(getAlbum|getAlbum|getPlaylists|getTopSongs|getRandomSongs|search2)$/)
	},
	new NetworkFirst({
		cacheName: "api",
	})
);

registerRoute(
	({ url }) => {
		return url.pathname.match(/\/rest\/getSimilarSongs$/)
	},
	new StaleWhileRevalidate({
		cacheName: "apiLongResponse",
	})
);

registerRoute(
	({ url }) => {
		return url.pathname.match(/\/rest\/stream$/)
	},
	new CacheFirst({
		cacheName: "song",
	})
);

self.addEventListener("message", event => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});