import { AppRegistry } from 'react-native';

import App from './App';
import { initService } from '~/utils/player';
import appJson from './app.json';
import { createRoot } from 'react-dom/client';
import { Platform } from 'react-native';
import React from 'react';
import iconFont from 'react-native-vector-icons/Fonts/FontAwesome.ttf';

const { name: appName } = appJson;

AppRegistry.registerComponent(appName, () => App);

if (Platform.OS === 'web') {
  // Inject the stylesheet into the document head
  const iconFontStyles = `@font-face {
    src: url(${iconFont});
    font-family: FontAwesome;
  }`;

  // Create a stylesheet
  const style = document.createElement('style');
  style.type = 'text/css';

  // Append the iconFontStyles to the stylesheet
  if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(document.createTextNode(iconFontStyles));
  }
  document.head.appendChild(style);

  const root = createRoot(document.getElementById('root'));
  root.render(<App />);
}

initService()