import React, { useContext, useEffect, useRef, useState } from 'react'
import { View, StyleSheet, RefreshControl, Dimensions, AppStateStatus, AppState } from 'react-native'
import { getDetailedForecast, getLocationByName, getWarnings, Time, Warning } from '../services'
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
const height = Dimensions.get('window').height - (Constants.statusBarHeight + 50 + 50) //full height

export default function ForecastScreen() {
  const [query, setQuery] = useState(undefined)
  const [data, setData] = useState([])

  const [coordinates, setCoordinates] = useAsyncStorage<string>('coordinates')
  const { location, locationName, locationRegion } = useContext<{
    location: Location.LocationObject
    locationName: string
    locationRegion: string
  }>(LocationContext)
  const [latestUpdate, setLatestUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true)
  const [detailedForecast, setDetailedForecast] = useAsyncStorage<Time[]>('detailedForecast')
  const [warning, setWarning] = useState<Warning>(null)
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState)

  async function getData(query) {
    if (!query) {
      setData([])
      return
    }
    const response = await getLocationByName(query)
    setData(response || [])
  }

  async function getInitialData(query) {
    if (!query) return
    const result = await getLocationByName(query)
    const coords = result && result.length && result[0].koordinaat
    setCoordinates(coords)
  }

  async function fetchWarnings() {
    if (!locationRegion) return
    const warningsResponse = await getWarnings()
    let warning = warningsResponse?.warnings?.warning
    let locationWarning
    if (warning) {
      if (Array.isArray(warning)) {
        locationWarning = warning.find((w) => {
          return w.area_eng.includes(locationRegion) || w.area_est.includes(locationRegion)
        })
      } else {
        if (warning.area_eng.includes(locationRegion) || warning.area_est.includes(locationRegion)) {
          locationWarning = warning
        }
      }

      setWarning(locationWarning)
    }
  }

  async function getForecast(coordinates) {
    setIsRefreshing(true)
    const response = await getDetailedForecast(coordinates)
    setDetailedForecast(response.forecast.tabular.time)
    setIsRefreshing(false)
  }

  const debounceGetData = useRef<Function>()

  useEffect(() => {
    debounceGetData.current = _.debounce(getData, 500)
  }, [])

  useEffect(() => {
    if (!coordinates) {
      return
    }
    getForecast(coordinates)
  }, [coordinates, latestUpdate])

  useEffect(() => {
    debounceGetData.current(query)
  }, [query])

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)
    return () => {
      AppState.removeEventListener('change', handleAppStateChange)
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

  useEffect(() => {
    fetchWarnings()
  }, [locationRegion, latestUpdate])

  const minTemp = detailedForecast && _.min(detailedForecast.map((f) => Number(f.temperature['@attributes'].value)))

  const graphRef = useRef(null)
  const graphWidth = width * 4.5

  return (
    <ScrollView
      style={styles.scrollContainer}
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled={true}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setLatestUpdate(new Date())
          }}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.forecastHourlyListWrapper}>
          <Alert alert={warning} location={location} />
          <ForecastHourlyList graphWidth={graphWidth} graphRef={graphRef} detailedForecast={detailedForecast} latestUpdate={latestUpdate} location={location} />
        </View>

        <ForecastGraph
          detailedForecast={detailedForecast}
          graphRef={graphRef}
          graphWidth={graphWidth}
          minTemp={minTemp}
          location={location}
          style={{
            zIndex: 10,
            height: '35%',
          }}
        />
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    flexGrow: 1,
    height,
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
