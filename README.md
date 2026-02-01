<a href="https://sawyerf.github.io/Castafiore/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/sawyerf/Castafiore/assets/22857002/ad3f2f95-92d8-4b09-83fe-d0d9a4dd61e1#gh-dark-mode-only">
    <img alt="logo" src="https://github.com/sawyerf/Castafiore/assets/22857002/a6969f24-415a-497a-99ef-f2c9da432d27#gh-light-mode-only">
  </picture>
</a>

<div align="center">
  <a href="https://github.com/user-attachments/assets/860f7c32-bd7d-47af-9e46-86e298a48002" >
    <img style="width: 20%; margin-right: 5px;" src="https://github.com/user-attachments/assets/860f7c32-bd7d-47af-9e46-86e298a48002" />
  </a>
  <a href="https://github.com/user-attachments/assets/46bcde04-fe5d-4078-b7d3-de2f0db006b7" >
    <img style="width: 20%; margin-right: 5px;" src="https://github.com/user-attachments/assets/46bcde04-fe5d-4078-b7d3-de2f0db006b7" />
  </a>
  <a href="https://github.com/user-attachments/assets/a4a2b19e-17bb-4cc1-a3cb-1c8a8b30162f" >
    <img style="width: 20%; margin-right: 5px;" src="https://github.com/user-attachments/assets/a4a2b19e-17bb-4cc1-a3cb-1c8a8b30162f" />
  </a>
  <a href="https://github.com/user-attachments/assets/868031fc-0ddb-4a21-80c5-867fbd368235" >
    <img style="width: 20%; margin-right: 5px;" src="https://github.com/user-attachments/assets/868031fc-0ddb-4a21-80c5-867fbd368235" />
  </a>
</div>

</br>

<div align=center>
  <b>Castafiore</b> is a music player that support Subsonic API. It is available on the following platforms: <b>Web</b> (PWA), <b>Android</b>.
  </br>
  </br>



  <a href="https://play.google.com/store/apps/details?id=com.sawyerf.castafiore"><img src="https://github.com/user-attachments/assets/b6f3a981-e88d-43ad-be25-ef556d991269" alt="Google Play"></a>
  <a href="https://github.com/sawyerf/Castafiore/releases/latest"><img src="https://github.com/user-attachments/assets/9f773ff9-07fc-47e4-8bd3-9a232fd97413" alt="DOWNLOAD APK"></a>
  <a href="https://sawyerf.github.io/Castafiore/"><img src="https://github.com/user-attachments/assets/9c697790-cc75-4195-b7f4-4f74c0aeb9ac" alt="PWA"></a>
</div>

## Support Feature
- Customize Home page
- Offline music
- Favorited
- Playlist
- Radio
- Lyrics
- Listenbrainz stats
- Listenbrainz fresh releases
- Multi-languages
- Theme

## Install PWA on desktop
1. Open Google Chrome
2. Go to the [website](https://sawyerf.github.io/Castafiore/)
3. In the address bar, click the Install icon
4. Confirm by clicking Install

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
npm run export:dev
```

Install the apk and run the dev server
```bash
npm run android
```
