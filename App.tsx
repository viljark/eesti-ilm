import 'react-native-gesture-handler'
import React, { useEffect, useState } from 'react'
import AppContainer from './AppContainer'
import * as Location from 'expo-location'
import { Alert, AppState, AppStateStatus, SafeAreaView, StyleSheet, View } from 'react-native'
import { LocationContext } from './LocationContext'
import Background from './src/components/Background'
import { useFonts, Inter_700Bold, Inter_300Light, Inter_200ExtraLight } from '@expo-google-fonts/inter'

import { Autocomplete } from 'react-native-dropdown-autocomplete'
import { getLocationByName } from './src/services'
import * as Sentry from 'sentry-expo'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { retrieveStoredLocation, storeLocationData } from './src/utils/locationAsyncStorage'
import { registerForPushNotificationsAsync } from './src/utils/registerNotifications'
import Pin from './src/icons/Pin'
import { LogBox } from 'react-native'
import useAsyncStorage from './src/utils/useAsyncStorage'

LogBox.ignoreAllLogs()
Sentry.init({
  dsn: 'https://af51d092fe394c5b832520eb8e494f93@o512763.ingest.sentry.io/5613608',
  enableInExpoDevelopment: true,
  debug: false, // Sentry will try to print out useful debugging information if something goes wrong with sending an event. Set this to `false` in production.
})

export default function App() {
  const [locationData, setLocationData] = useState<{
    location: Location.LocationObject
    locationName: string
    locationRegion: string
  }>({
    location: undefined,
    locationRegion: '',
    locationName: '',
  })
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState)
  const [isHighPerformance, setIsHighPerformance] = useAsyncStorage<boolean>('isHighPerformance', true)

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)
    return () => {
      AppState.removeEventListener('change', handleAppStateChange)
    }
  }, [])
  let [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_200ExtraLight,
    Inter_700Bold,
  })

  function handleAppStateChange(nextAppState: AppStateStatus) {
    setAppState((oldAppState) => {
      if (oldAppState.match(/inactive|background/) && nextAppState === 'active') {
        getLocationAsync()
      }
      return nextAppState
    })
  }

  useEffect(() => {
    registerForPushNotificationsAsync()
    loadPermissionStatus()
  }, [])

  async function loadPermissionStatus() {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync()
    console.log('canAskAgain', canAskAgain)
    if (status !== 'granted' && canAskAgain) {
      await Location.requestForegroundPermissionsAsync()
    }
    getLocationAsync()
  }
  async function getLocationAsync() {
    const storedLocationObject = await retrieveStoredLocation()
    if (storedLocationObject) {
      setLocationData(storedLocationObject)
    }
    const providerStatus = await Location.getProviderStatusAsync()
    let status
    console.log('providerStatus.locationServicesEnabled', providerStatus.locationServicesEnabled)
    if (providerStatus.locationServicesEnabled) {
      const locationPermissionResult = await Location.getForegroundPermissionsAsync()
      status = locationPermissionResult.status
    } else {
      status = 'location-services-disabled'
    }

    console.log('permission', status)
    if (status !== 'granted') {
      if (!storedLocationObject?.location) {
        console.log('writing default location')
        const defaultLocationData = {
          location: {
            timestamp: new Date().getTime(),
            coords: {
              altitude: 0,
              heading: 0,
              altitudeAccuracy: 2.09,
              latitude: 58.3,
              speed: 0,
              longitude: 26.6,
              accuracy: 21,
            },
          },
          locationName: 'Tartu',
          locationRegion: 'Tartu maakond',
        }
        setLocationData(defaultLocationData)
        storeLocationData(defaultLocationData)
      }
    } else {
      const location = await Location.getCurrentPositionAsync({})
      const geoLocation = await Location.reverseGeocodeAsync({
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      })
      const locationName = geoLocation && geoLocation.length && (geoLocation[0].city || geoLocation[0].region)
      const locationRegion = geoLocation && geoLocation.length && geoLocation[0].region
      const storedLocation = storedLocationObject?.location
      const newLocation = location && storedLocation && location.coords.longitude !== storedLocation.coords.longitude && location.coords.latitude !== storedLocation.coords.latitude

      if ((location && !storedLocation) || newLocation) {
        setLocationData({ location, locationRegion, locationName })
        storeLocationData({ location, locationRegion, locationName })
      }
    }
  }

  async function getData(query) {
    console.log('getData', query)
    if (!query) {
      return Promise.resolve([])
    }
    return await getLocationByName(query)
  }

  const { location, locationName, locationRegion } = locationData

  const placeholder = []
  if (locationName) {
    placeholder.push(locationName)
  }
  if (locationRegion) {
    placeholder.push(locationRegion)
  }

  console.log('placeholder:', JSON.stringify(placeholder))
  console.log('locationData:', JSON.stringify(locationData))

  return (
    <LocationContext.Provider value={{ location, locationName, locationRegion, isHighPerformance, setIsHighPerformance }}>
      <Background location={location}>
        <SafeAreaView style={styles.autocompleteContainer}>
          {fontsLoaded && (
            <>
              <Pin width={20} height={20} fill="#fff" style={styles.pin} />
              <Autocomplete
                key={placeholder.join(', ')}
                inputStyle={styles.input}
                resetOnSelect={true}
                handleSelectItem={(item) => {
                  const label = item.label.trim()

                  const location = {
                    coords: {
                      latitude: Number(item.koordinaat.split(';')[0]),
                      longitude: Number(item.koordinaat.split(';')[1]),
                      accuracy: null,
                      altitude: null,
                      altitudeAccuracy: null,
                      heading: null,
                      speed: null,
                    },
                    timestamp: new Date().getTime(),
                  }
                  const locationName = label.split(', ')[0]
                  const locationRegion = label.split(', ').reverse()[0]
                  setLocationData({
                    location,
                    locationName,
                    locationRegion,
                  })
                  storeLocationData({
                    location,
                    locationName,
                    locationRegion,
                  })
                }}
                separatorStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                }}
                placeholder={placeholder.join(', ')}
                placeholderColor={'#fff'}
                fetchData={getData}
                valueExtractor={(item) => item.label?.trim()}
                scrollStyle={styles.scrollStyle}
                highLightColor={'#1ce'}
                noDataText={'Ei leidnud asukohta'}
                noDataTextStyle={{
                  paddingVertical: 10,
                }}
                containerStyle={styles.containerStyle}
                pickerStyle={styles.pickerStyle}
                listFooterStyle={styles.listFooterStyle}
              />
            </>
          )}
        </SafeAreaView>
        <View style={{ paddingTop: 60 + Constants.statusBarHeight, flex: 1, backgroundColor: 'transparent' }}>{fontsLoaded && <AppContainer />}</View>
      </Background>
    </LocationContext.Provider>
  )
}

const styles = StyleSheet.create({
  autocompleteContainer: {
    paddingTop: Constants.statusBarHeight + 10,
    width: '100%',
    paddingHorizontal: 8,
    flex: 1,
    flexGrow: 1,
    left: 0,
    position: 'absolute',
    top: 0,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pin: {
    position: 'absolute',
    left: 10,
    top: Constants.statusBarHeight + 25,
    opacity: 0.9,
  },
  input: {
    color: '#fff',
    width: '100%',
    borderColor: 'white',
    borderWidth: 0,
    paddingLeft: 30,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'rgba(255,255,255,0)',
    borderRadius: 0,
    fontSize: 18,
    fontFamily: 'Inter_200ExtraLight',
  },
  scrollStyle: {
    marginBottom: 0,
    borderWidth: 0,
  },
  containerStyle: {
    marginLeft: 0,
    left: 0,
    paddingLeft: 0,
    paddingBottom: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 0,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  pickerStyle: {
    top: 10,
    marginLeft: 0,
    left: 1,
    borderWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  listFooterStyle: {
    height: 0,
    display: 'none',
  },
})
