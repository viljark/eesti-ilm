import React, { useContext, useEffect, useRef, useState } from 'react'
import { View, StyleSheet, RefreshControl, Dimensions, AppStateStatus, AppState, Animated } from 'react-native'
import { getDetailedForecast, getLocationByName, getWarningForLocation, Time, Warning } from '../services'
import _ from 'lodash'
import { LocationContext } from '../../LocationContext'
import * as Location from 'expo-location'
import { ScrollView } from 'react-native-gesture-handler'
import { Alert } from '../components/Alert'
import { ForecastGraph } from '../components/ForecastGraph'
import { ForecastHourlyList } from '../components/ForecastHourlyList'
import useAsyncStorage from '../utils/useAsyncStorage'
import Constants from 'expo-constants'

const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height - (Constants.statusBarHeight + 50 + 72) //full height

export default function ForecastScreen() {
  const [coordinates, setCoordinates] = useAsyncStorage<string>('coordinates')
  const { location, locationName, locationRegion } =
    useContext<{
      location: Location.LocationObject
      locationName: string
      locationRegion: string
    }>(LocationContext)
  const [latestUpdate, setLatestUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true)
  const [detailedForecast, setDetailedForecast] = useState<Time[]>() //useAsyncStorage<Time[]>('detailedForecast')
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState)

  async function getInitialData(query) {
    if (!query) return
    const result = await getLocationByName(query)
    const coords = result && result.length && result[0].coordinates
    setCoordinates(coords)
  }

  async function getForecast(coordinates) {
    setIsRefreshing(true)
    const response = await getDetailedForecast(coordinates)
    setDetailedForecast(response.forecast.tabular.time)
    setIsRefreshing(false)
  }

  const debounceGetData = useRef<Function>()

  useEffect(() => {
    if (!coordinates) {
      return
    }
    getForecast(coordinates)
  }, [coordinates, latestUpdate])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      subscription.remove()
    }
  }, [])

  function handleAppStateChange(nextAppState: AppStateStatus) {
    setAppState((oldAppState) => {
      if (oldAppState.match(/inactive|background/) && nextAppState === 'active') {
        if (latestUpdate && new Date().getTime() - latestUpdate.getTime() > 1000 * 60 * 1) {
          setLatestUpdate(new Date())
        }
      }
      return nextAppState
    })
  }

  useEffect(() => {
    getInitialData(locationName)
  }, [locationName, latestUpdate])

  const minTemp = detailedForecast && _.min(detailedForecast.map((f) => Number(f.temperature['@attributes'].value)))

  const graphRef = React.useRef(new Animated.ValueXY({ x: 0, y: 0 }))
  const graphWidth = width * 5.5

  return (
    <View style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.forecastHourlyListWrapper}>
          <ForecastHourlyList
            graphWidth={graphWidth}
            graphRef={graphRef}
            detailedForecast={detailedForecast}
            latestUpdate={latestUpdate}
            location={location}
            isRefreshing={isRefreshing}
            setLatestUpdate={setLatestUpdate}
          />
        </View>

        <ForecastGraph
          detailedForecast={detailedForecast}
          graphRef={graphRef}
          graphWidth={graphWidth}
          minTemp={minTemp}
          location={location}
          style={{
            zIndex: 10,
            height: '30%',
          }}
        />
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    flexGrow: 1,
    height,
    paddingTop: 10,
  },
  container: {
    flex: 1,
    paddingTop: 0,
    height,
  },
  forecastHourlyListWrapper: {
    position: 'relative',
    paddingTop: 0,
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: 10,
    flexBasis: '65%',
  },
})
