import { registerRootComponent } from 'expo'
import { registerWidgetTaskHandler } from 'react-native-android-widget'

import App from './App'
import widgetTaskHandler from '~/widgets/widget-task-handler'
import { initService } from '~/utils/player'

registerRootComponent(App)
registerWidgetTaskHandler(widgetTaskHandler)

initService()