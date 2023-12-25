import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
	({ url }) => {
		return url.origin === self.location.origin && url.pathname.endsWith(".png")
	},
	new StaleWhileRevalidate({
		cacheName: "images",
		plugins: [
			new ExpirationPlugin({ maxEntries: 50 }),
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
		return url.pathname.match(/\/rest\/(getAlbumList|getAlbum|favorited|getAlbum|getStarred|getPlaylists|getArtist|getPlaylist)$/)
	},
	new StaleWhileRevalidate({
		cacheName: "api",
	})
);

registerRoute(
	({ url }) => {
		return url.pathname.match(/\/rest\/stream$/)
	},
	new StaleWhileRevalidate({
		cacheName: "song",
	})
);

self.addEventListener("message", event => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});