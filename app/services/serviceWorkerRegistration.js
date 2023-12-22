const isLocalhost = Boolean(
	window.location.hostname === "localhost" ||
	window.location.hostname === "[::1]" ||
	window.location.hostname.match(
		/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
	)
);

export function register(config) {
	const isEnvProduction = process.env.NODE_ENV === "production";
	if (isEnvProduction && "serviceWorker" in navigator) {
		const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
		if (publicUrl.origin !== window.location.origin) {
			return;
		}

		window.addEventListener("load", () => {
			const swUrl = `/serviceWorker.js`;

			if (isLocalhost) {
				checkValidServiceWorker(swUrl, config);

				navigator.serviceWorker.ready.then(() => {
					console.log('serviceWorker ready')
				});
			} else {
				registerValidSW(swUrl, config);
			}
		});
	}
}

function registerValidSW(swUrl, config) {
	navigator.serviceWorker
		.register(swUrl)
		.then((registration) => {
			registration.onupdatefound = () => {
				const installingWorker = registration.installing;
				if (installingWorker == null) {
					return;
				}
				installingWorker.onstatechange = () => {
					if (installingWorker.state === "installed") {
						if (navigator.serviceWorker.controller) {
							if (config && config.onUpdate) {
								config.onUpdate(registration);
							}
						} else {
							console.log("Content is cached for offline use.");

							if (config && config.onSuccess) {
								config.onSuccess(registration);
							}
						}
					}
				};
			};
		})
		.catch((error) => {
			console.error("Error during service worker registration:", error);
		});
}

function checkValidServiceWorker(swUrl, config) {
	fetch(swUrl, {
		headers: { "Service-Worker": "script" },
	})
		.then((response) => {
			const contentType = response.headers.get("content-type");
			if (
				response.status === 404 ||
				(contentType != null && contentType.indexOf("javascript") === -1)
			) {
				navigator.serviceWorker.ready.then((registration) => {
					registration.unregister().then(() => {
						window.location.reload();
					});
				});
			} else {
				registerValidSW(swUrl, config);
			}
		})
		.catch(() => {
			console.log("No internet connection found. App is running in offline mode.");
		});
}

export function unregister() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.ready
			.then((registration) => {
				registration.unregister();
			})
			.catch((error) => {
				console.error(error.message);
			});
	}
}

export const clearCache = async () => {
	caches.keys().then((names) => {
		// ['coverArt', 'api'].forEach((key) => {
		names.forEach((key) => {

			if (names.includes(key)) {
				caches.delete(key);
			}
		})
	});
}