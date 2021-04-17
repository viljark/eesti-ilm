import React, { useContext, useEffect, useState } from 'react'
import { AppState, AppStateStatus, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { getObservations, Observations, Station } from '../services'
import { closestObservationField, closestStationWithObservationField, getDistance } from '../utils/distance'
import { ErrorMessage } from '../components/ErrorMessage'
import { getPhenomenonText } from '../utils/phenomenonUtil'
import { PhenomenonIcon } from '../components/PhenomenonIcon'
import { Radar } from '../components/Radar'
import { Forecast } from '../components/Forecast'
import { LocationContext } from '../../LocationContext'
import * as Analytics from 'expo-firebase-analytics'
import ArrowUp from '../icons/ArrowUp'
import Constants from 'expo-constants'
import * as WebBrowser from 'expo-web-browser'
import Feels from 'feels'

function addZeroBefore(n) {
  return (n < 10 ? '0' : '') + n
}

export default function Main(props) {
  const [allObservations, setAllObservations] = useState<Observations>(undefined)
  const [observations, setObservations] = useState<Observations>(undefined)
  const [errorMessage, setErrormessage] = useState(undefined)
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
      Analytics.setCurrentScreen('Main')
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

  const getWaterTempStation = () => closestStationWithObservationField(observations.station, 'watertemperature')
  const getPhenomenonStation = () => closestStationWithObservationField(observations.station, 'phenomenon')
  const getWindSpeedStation = () => closestStationWithObservationField(observations.station, 'windspeed')
  const getWindSpeedMax = () => closestStationWithObservationField(observations.station, 'windspeedmax')
  const getHumidity = () => closestStationWithObservationField(observations.station, 'relativehumidity')
  const getPrecipitations = () => closestStationWithObservationField(observations.station, 'precipitations')
  const getUVIndex = () => closestStationWithObservationField(observations.station, 'uvindex')

  const phenomenon = observations ? getPhenomenonText(getPhenomenonStation().phenomenon) : ''
  return (
    <View style={{ flex: 1 }}>
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
        {closestStation && (
          <View>
            <TouchableWithoutFeedback
              onPress={() => {
                setShowDataOrigin(!showDataOrigin)
              }}
            >
              <View style={styles.container}>
                <PhenomenonIcon
                  phenomenon={closestObservationField(observations.station, 'phenomenon') as string}
                  latitude={location.coords.latitude}
                  longitude={location.coords.longitude}
                />
                <View style={styles.temperatureWrap}>
                  <Text style={styles.temperature}>{closestStation.airtemperature}</Text>
                  <Text style={styles.degree}>°C</Text>
                </View>
                {realFeel !== null && <Text style={styles.realFeel}>Tajutav {realFeel}°C</Text>}

                <Text style={styles.phenomenon}>
                  {phenomenon} {showDataOrigin && <Text style={styles.smallText}>({getPhenomenonStation().name})</Text>}
                </Text>
                <View style={styles.smallContainer}>
                  <Text style={styles.smallText}>
                    {closestStation.name}, {addZeroBefore(latestUpdate.getHours())}:{addZeroBefore(latestUpdate.getMinutes())}
                  </Text>
                  <Text style={styles.smallText}>
                    vesi {getWaterTempStation().watertemperature}°C {showDataOrigin && <Text style={styles.smallText}>({getWaterTempStation().name})</Text>}
                  </Text>
                  <Text style={styles.smallText}>
                    tuul {getWindSpeedStation().windspeed} - {getWindSpeedMax().windspeedmax}m/s{' '}
                    <View
                      style={{
                        margin: 3,
                        width: 10,
                        height: 10,
                        transform: [
                          {
                            rotate: `${Number(getWindSpeedStation().winddirection)}deg`,
                          },
                        ],
                      }}
                    >
                      <ArrowUp width={7} height={7} style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                    {showDataOrigin && <Text style={styles.smallText}>({getWindSpeedStation().name})</Text>}
                  </Text>
                  <Text style={styles.smallerText}>
                    õhuniiskus {getHumidity().relativehumidity}% {showDataOrigin && <Text style={styles.smallerText}>({getHumidity().name})</Text>}
                  </Text>
                  <Text style={styles.smallerText}>
                    sademeid tunnis {getPrecipitations().precipitations}mm {showDataOrigin && <Text style={styles.smallerText}>({getPrecipitations().name})</Text>}
                  </Text>
                  <Text style={styles.smallerText}>
                    UV {getUVIndex().uvindex} {showDataOrigin && <Text style={styles.smallerText}>({getUVIndex().name})</Text>}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
            <Forecast latestUpdate={latestUpdate} />
          </View>
        )}
        <View
          style={{
            ...styles.container,
            marginTop: -10,
            height: width,
          }}
        >
          <Radar latestUpdate={latestUpdate} />
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
    marginTop: 10,
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
    height: height,
  },
  temperatureWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  temperature: {
    color: '#fff',
    fontSize: 80,
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    fontFamily: 'Inter_200ExtraLight',
  },
  degree: {
    paddingTop: 20,
    color: '#fff',
    fontSize: 30,
    marginLeft: 0,
  },
  smallContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  smallText: {
    color: '#fff',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  smallerText: {
    color: '#fff',
    fontSize: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  phenomenon: {
    color: '#fff',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    marginTop: -10,
    marginBottom: 10,
  },
  realFeel: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    marginTop: -15,
    marginBottom: 20,
  },
  ilmateenistus: {
    position: 'absolute',
    bottom: 2,
    right: 5,
    color: '#fff',
    fontSize: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    opacity: 0.6,
    zIndex: 1,
  },
})
