import React from 'react';
import { Text, View } from 'react-native';

import { getCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { SettingsContext } from '~/contexts/settings';
import HorizontalAlbums from './HorizontalAlbums';
import HorizontalArtists from './HorizontalArtists';
import HorizontalGenres from './HorizontalGenres';
import mainStyles from '~/styles/main';
import RadioList from './RadioList';
import CustomScroll from '~/components/lists/CustomScroll';


const HorizontalLBStat = ({ config, stats }) => {
  const theme = React.useContext(ThemeContext)
  const settings = React.useContext(SettingsContext)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [maxCount, setMaxCount] = React.useState(0)

  React.useEffect(() => {
    let maxCount = 1;
    stats?.forEach((stat) => {
      if (stat.listen_count > maxCount) maxCount = stat.listen_count
    })
    setMaxCount(maxCount)
  }, [stats])

  return (
    <CustomScroll
      style={styles.custScroll}
      contentContainerStyle={styles.scrollContainer(stats?.length)}
    >
      {
        stats?.map((stat) => {
          const time = new Date(stat.time_range)
          const day = days[time.getDay()]
          return (
            <View
              key={stat.time_range}
              style={{
                flex: 1,
                flexDirection: 'column-reverse',
                alignItems: 'center',
              }}>
              <Text style={{ color: theme.primaryLight, fontSize: 12, textAlign: 'center' }}>{time.getDate()}</Text>
              <View
                style={{
                  height: (stat.listen_count / maxCount) * 120,
                  width: '100%',
                  maxWidth: 55,
                  backgroundColor: theme.primaryTouch,
                }}
              >
              </View>
              <Text style={{ color: theme.secondaryLight, fontSize: 10, textAlign: 'center' }}>{stat.listen_count}</Text>
            </View>
          )
        })
      }
    </CustomScroll>
  )
}

const styles = {
  custScroll: {
    width: '100%',
  },
  scrollContainer: length => ({
    width: '100%',
    maxWidth: length * 60,
    paddingStart: 20,
    paddingEnd: 20,
    flexDirection: 'row',
    columnGap: 10,
    rowGap: 10,
  }),
}

export default HorizontalLBStat;