import registerRootComponent from 'expo/build/launch/registerRootComponent';

import App from './App';
import { initService } from './app/utils/player';

registerRootComponent(App);

initService()