<a href="https://sawyerf.github.io/Castafiore/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/sawyerf/Castafiore/assets/22857002/ad3f2f95-92d8-4b09-83fe-d0d9a4dd61e1#gh-dark-mode-only">
    <img alt="logo" src="https://github.com/sawyerf/Castafiore/assets/22857002/a6969f24-415a-497a-99ef-f2c9da432d27#gh-light-mode-only">
  </picture>
</a>

<div align="center">
  <a href="https://github.com/sawyerf/Castafiore/assets/22857002/d97befb0-92f6-4d29-b1ef-f43fc96bbc41" >
    <img style="width: 20%; margin-right: 5px;" src="https://github.com/sawyerf/Castafiore/assets/22857002/d97befb0-92f6-4d29-b1ef-f43fc96bbc41" />
  </a>
  <a href="https://github.com/sawyerf/Castafiore/assets/22857002/7e43e4ff-433d-4150-a98f-99dec38769ad" >
    <img style="width: 20%; margin-right: 5px;" src="https://github.com/sawyerf/Castafiore/assets/22857002/7e43e4ff-433d-4150-a98f-99dec38769ad" />
  </a>
  <a href="https://github.com/sawyerf/Castafiore/assets/22857002/5d3973a3-1f2e-4948-a167-b55162c2e725" >
    <img style="width: 20%; margin-right: 5px;" src="https://github.com/sawyerf/Castafiore/assets/22857002/5d3973a3-1f2e-4948-a167-b55162c2e725" />
  </a>
  <a href="https://github.com/sawyerf/Castafiore/assets/22857002/93058bc3-f593-4f83-b9f8-1fc278e1e7d5" >
    <img style="width: 20%; margin-right: 5px;" src="https://github.com/sawyerf/Castafiore/assets/22857002/93058bc3-f593-4f83-b9f8-1fc278e1e7d5" />
  </a>
</div>

</br>

**Castafiore** is a music player that support Subsonic API. It is available on the following platforms: **Web** (PWA), **Android**.

## Support Feature
- Customize Home page
- Offline music
- Song
- Playlist
- Search
- Artist
- Radio

## Build locally
### Web
If you want to build the web version, run the following command:
```bash
npm i
npm run export:web
```
It will generate a folder `web-build` that you can deploy to your server.

### Android
If you want to build the .apk, you need to install Android Studio and you run the following command
```bash
npm i
npm run export:android
```

## Development
### Web
If you want to run the app in development mode, run the following command:
```bash
npm i
npm run web
```

### Android
If you want to run the app in development mode for android, you need to install Android Studio.

Run the following command that will created an apk
```bash
npm i
npm run build-dev
```

Install the apk and run the dev server
```bash
npm run android
```
