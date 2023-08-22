import React, { useCallback, useMemo, useState } from 'react'
import { Time } from '../services'
import { ScrollView } from 'react-native-gesture-handler'
import { Dimensions, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native'
import { getDate, getDayName } from '../utils/formatters'
import { ForecastListItem } from './ForecastListItem'
import { LocationObject } from 'expo-location'
import Constants from 'expo-constants'
import Background from './Background'
import { blockBackground, commonStyles } from '../utils/styles'
import _ from 'lodash'

const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height - (Constants.statusBarHeight + 50) //full height

interface ForecastHourlyListProps {
  graphWidth: number
  graphRef: React.MutableRefObject<any>
  detailedForecast: Time[]
  latestUpdate: Date
  location: LocationObject
  setLatestUpdate: (date: Date) => void
  isRefreshing: boolean
}

export function ForecastHourlyList({ graphWidth, graphRef, detailedForecast, latestUpdate, location, isRefreshing, setLatestUpdate }: ForecastHourlyListProps) {
  const [stickyIndexes, setStickyIndexes] = useState<number[]>([])

  // useEffect(() => {
  //   const indexes = []
  //   detailedForecast?.forEach((time, index) => {
  //     if (getUserLocalDate(time['@attributes'].from).getHours() === 0 || index === 0) {
  //       indexes.push(index + indexes.length)
  //     }
  //   })
  //   setStickyIndexes(indexes)
  // }, [detailedForecast])

  const sections = useMemo(() => {
    const result: { title: string; data: Time[] }[] = []
    if (detailedForecast) {
      detailedForecast.forEach((time, index) => {
        const title = getDayName(time['@attributes'].from) + ', ' + getDate(time['@attributes'].from)
        const existingDay = result.find((r) => r.title === title)
        if (existingDay) {
          existingDay.data.push(time)
        } else {
          result.push({ title, data: [time] })
        }
      })
    }

    return result
  }, [detailedForecast])

  const scrollHandler = useCallback(
    (e) => {
      if (e.nativeEvent?.contentSize) {
      }
    },
    [graphRef, graphWidth]
  )

  const handleScroll = useMemo(() => _.throttle(scrollHandler, 16, { leading: true }), [scrollHandler])

  return (
    <View style={styles.container}>
      <View style={styles.gradientWrapper}>
        <Background location={location}>
          <Text></Text>
        </Background>
      </View>

      <SectionList
        stickySectionHeadersEnabled={true}
        overScrollMode={'never'}
        initialNumToRender={12}
        sections={sections}
        keyExtractor={(item, index) => JSON.stringify(item)}
        renderItem={({ item: time }) => <ForecastListItem key={`${time['@attributes'].from}`} time={time} location={location} />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.dayNameWrapper} key={title}>
            <Text style={styles.dayName}>{title}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setLatestUpdate(new Date())
            }}
          />
        }
        onScroll={(e) => {
          const scrollAmount = (graphWidth / e.nativeEvent.contentSize.height) * e.nativeEvent.contentOffset.y
          if (graphRef.current !== null) {
            graphRef.current.scrollTo({
              y: 0,
              x: scrollAmount,
              animated: false,
            })
          }
        }}
        style={styles.scrollView}
      />

      <ScrollView stickyHeaderIndices={stickyIndexes}>{detailedForecast && detailedForecast.map((time, index) => [,])}</ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    marginTop: 10,
    borderRadius: 30,
    ...commonStyles.blockShadow,
  },
  gradientWrapper: {
    position: 'absolute',
    left: 0,
    bottom: -0,
    transform: [
      {
        rotate: `${180}deg`,
      },
    ],
    height: height,
    width: width,
  },
  scrollView: { backgroundColor: blockBackground },
  dayNameWrapper: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  dayName: {
    marginTop: 2,
    color: '#fff',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, .7)',
    borderColor: 'rgba(0,0,0,0.5)',
    borderWidth: 0.5,
    paddingHorizontal: 8,
    fontSize: 12,
    fontFamily: 'Inter_300Light',
  },
})
