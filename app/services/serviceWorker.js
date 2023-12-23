import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
	({ request, url }) => {
		if (request.mode !== "navigate") {
			return false;
		}

		if (url.pathname.startsWith("/_")) {
			return false;
		}

		if (url.pathname.match(fileExtensionRegexp)) {
			return false;
		}

		return true;
	},
	createHandlerBoundToURL("/index.html")
);

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
		plugins: [
			new ExpirationPlugin({ maxEntries: 100 }),
		],
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


self.addEventListener("message", (event) => {
	console.log('message', event)
	//  event.data.arg
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});