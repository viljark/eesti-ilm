import React, { useContext, useEffect, useState } from 'react'
import { AppState, AppStateStatus, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { getObservations, Observations, Station } from '../services'
import { closestStationWithObservationField, getDistance } from '../utils/distance'
import { ErrorMessage } from '../components/ErrorMessage'
import { Radar } from '../components/Radar'
import { CurrentWeather } from '../components/CurrentWeather'
import { LocationContext } from '../../LocationContext'
import * as Analytics from 'expo-firebase-analytics'
import Constants from 'expo-constants'
import * as WebBrowser from 'expo-web-browser'
import Feels from 'feels'
import useAsyncStorage from '../utils/useAsyncStorage'
import { ForecastRadar } from '../components/ForecastRadar'
import { TabButton } from '../components/TabButton'
import Background from '../components/Background'

export default function Main(props) {
  const [allObservations, setAllObservations] = useAsyncStorage<Observations>('allObservations')
  const [observations, setObservations] = useState<Observations>(undefined)
  const [errorMessage, setErrormessage] = useState(null)
  const [activeTab, setActiveTab] = useState('live')
  const [closestStation, setClosestStation] = useState<Station>(undefined)
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState)
  const [latestUpdate, setLatestUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true)
  const [showDataOrigin, setShowDataOrigin] = useState<boolean>(false)
  const [realFeel, setRealFeel] = useState<number>(null)
  const { location, locationName } = useContext(LocationContext)

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)
    return () => {
      AppState.removeEventListener('change', handleAppStateChange)
    }
  }, [])

  function handleAppStateChange(nextAppState: AppStateStatus) {
    setAppState((oldAppState) => {
      if (oldAppState.match(/inactive|background/) && nextAppState === 'active') {
        setLatestUpdate(new Date())
      }
      return nextAppState
    })
  }

  useEffect(() => {
    fetchObservations()
  }, [latestUpdate])

  useEffect(() => {
    if (allObservations && location) {
      const stationsWithDistance = allObservations.station.map((s) => {
        const stationLatLon = [Number(s.latitude), Number(s.longitude)]
        const distance = getDistance([location.coords.latitude, location.coords.longitude], stationLatLon)
        return {
          ...s,
          distance,
        }
      })

      let closest: Station = closestStationWithObservationField(stationsWithDistance, 'airtemperature')

      setClosestStation(closest)

      setObservations({
        ...observations,
        station: stationsWithDistance.sort((a, b) => a.name.localeCompare(b.name)),
      })
    }
  }, [location, allObservations])

  useEffect(() => {
    try {
		Analytics.logEvent('screen_view', {name: 'Main'})
    } catch (e) {
      console.warn('analytics error', e)
    }
  }, [])

  useEffect(() => {
    if (closestStation && observations) {
      try {
        const config = {
          temp: Number(closestStation.airtemperature),
          humidity: Number(getHumidity().relativehumidity),
          speed: Number(getWindSpeedStation().windspeed),
        }
        setRealFeel(Math.round(new Feels(config).like() * 10) / 10)
      } catch (e) {
        console.error('Real feel calculation failed', e)
        setRealFeel(null)
      }
    }
  }, [observations, closestStation])

  async function fetchObservations() {
    setIsRefreshing(true)
    const response = await getObservations()

    setIsRefreshing(false)
    setAllObservations(response.observations)
  }

  const getWaterTempStation = () => closestStationWithObservationField(observations?.station, 'watertemperature')
  const getPhenomenonStation = () => closestStationWithObservationField(observations?.station, 'phenomenon')
  const getWindSpeedStation = () => closestStationWithObservationField(observations?.station, 'windspeed')
  const getWindSpeedMax = () => closestStationWithObservationField(observations?.station, 'windspeedmax')
  const getHumidity = () => closestStationWithObservationField(observations?.station, 'relativehumidity')
  const getPrecipitations = () => closestStationWithObservationField(observations?.station, 'precipitations')
  const getUVIndex = () => closestStationWithObservationField(observations?.station, 'uvindex')

  const observationsReceivedAt = Number(allObservations?.$?.timestamp) * 1000 || null

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Text
        style={styles.ilmateenistus}
        onPress={async () => {
          await WebBrowser.openBrowserAsync('https://www.ilmateenistus.ee')
        }}
      >
        Riigi Ilmateenistus - www.ilmateenistus.ee
      </Text>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              console.log('setLatestUpdate')
              setLatestUpdate(new Date())
            }}
          />
        }
      >
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <View>
          <TouchableWithoutFeedback
            onPress={() => {
              setShowDataOrigin(!showDataOrigin)
            }}
          >
            <View style={styles.container}>
              <CurrentWeather
                closestStation={closestStation}
                realFeel={realFeel}
                latestUpdate={latestUpdate}
                observationsReceivedAt={observationsReceivedAt}
                phenomenon={getPhenomenonStation()?.phenomenon}
                windSpeed={getWindSpeedStation()?.windspeed}
                windSpeedMax={getWindSpeedMax()?.windspeedmax}
                windDirection={Number(getWindSpeedStation()?.winddirection)}
                waterStationName={getWaterTempStation()?.name}
                waterTemperature={getWaterTempStation()?.watertemperature}
                uv={getUVIndex()?.uvindex}
                humidity={getHumidity()?.relativehumidity}
                precipitations={getPrecipitations()?.precipitations}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View
          style={{
            ...styles.container,
            marginTop: -10,
          }}
        >
          <View
            style={{
              position: 'relative',
              display: 'flex',
              flex: 1,
              width: width - 20,
              overflow: 'hidden',
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              flexDirection: 'row',
            }}
          >
            <View style={styles.background}>
              <Background location={location}>
                <Text></Text>
              </Background>
            </View>
            <TabButton onPress={() => setActiveTab('live')} isActive={activeTab === 'live'} text="Sademed hetkel" style={[{ borderColor: '#000', borderRightWidth: 0.5 }]} />
            {/*<TabButton onPress={() => setActiveTab('forecast')} isActive={activeTab === 'forecast'} text="Sademete prognoos" />*/}
          </View>
          {activeTab === 'live' ? <Radar latestUpdate={latestUpdate} /> : <ForecastRadar latestUpdate={latestUpdate} />}
        </View>
      </ScrollView>
    </View>
  )
}

const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height - (Constants.statusBarHeight + 50) //full height

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    alignSelf: 'stretch',
  },
  container: {
    marginTop: 20,
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  background: {
    position: 'absolute',
    left: 0,
    top: -height + 160,
    transform: [
      {
        rotate: `${180}deg`,
      },
    ],
    height: height,
    width: width,
  },
  ilmateenistus: {
    position: 'absolute',
    bottom: 2,
    right: 10,
    color: '#fff',
    fontSize: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    opacity: 0.8,
    zIndex: 1,
  },
})
