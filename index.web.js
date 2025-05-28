import "@expo/metro-runtime";
import { registerRootComponent } from 'expo';

import App from './App';
import { initService } from '~/utils/player';

registerRootComponent(App);

initService()