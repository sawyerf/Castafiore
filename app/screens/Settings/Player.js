import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SettingsContext } from '~/contexts/settings'
import { SetSettingsContext } from '~/contexts/settings'
import { ThemeContext } from '~/contexts/theme'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'
import SelectItem from '~/components/settings/SelectItem'

const FORMATS = [
  { name: 'Raw', value: 'raw' },
  { name: 'MP3', value: 'mp3' },
  { name: 'AAC', value: 'aac' },
  { name: 'Opus', value: 'opus' },
]

const BITRATES = [
  { name: 'Default', value: 0 },
  { name: '32', value: 32 },
  { name: '48', value: 48 },
  { name: '64', value: 64 },
  { name: '80', value: 80 },
  { name: '96', value: 96 },
  { name: '112', value: 112 },
  { name: '128', value: 128 },
  { name: '160', value: 160 },
  { name: '192', value: 192 },
  { name: '256', value: 256 },
  { name: '320', value: 320 },
]

const PlayerSettings = () => {
  const insets = useSafeAreaInsets()
  const theme = React.useContext(ThemeContext)
  const settings = React.useContext(SettingsContext)
  const setSettings = React.useContext(SetSettingsContext)

  return (
    <ScrollView
      style={mainStyles.mainContainer(theme)}
      contentContainerStyle={mainStyles.contentMainContainer(insets)}
    >
      <Header title="Player" />

      <View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
        <Text style={settingStyles.titleContainer(theme)}>Format stream</Text>
        <View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
          {FORMATS.map((item, index) => (
            <SelectItem
              key={index}
              text={item.name}
              icon={'file-audio-o'}
              isSelect={item.value === settings.streamFormat}
              onPress={() => {
                setSettings({ ...settings, streamFormat: item.value })
              }}
            />
          ))}
        </View>
				<Text style={settingStyles.description(theme)}>Specify the format of the stream to be played.</Text>

        <Text style={settingStyles.titleContainer(theme)}>Max bit rate</Text>
        <View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
          {
            BITRATES.map((item, index) => (
              <SelectItem
                key={index}
                text={item.name}
                icon={'tachometer'}
                isSelect={item.value === settings.maxBitRate}
                onPress={() => {
                  setSettings({ ...settings, maxBitRate: item.value })
                }}
                disabled={settings.streamFormat === 'raw'}
              />
            ))
          }
        </View>
				<Text style={settingStyles.description(theme)}>Specify the maximum bit rate in kilobits per second for the stream to be played. Lower bit rates will consume less data but may result in lower audio quality.</Text>
      </View>
    </ScrollView>
  )
}

export default PlayerSettings