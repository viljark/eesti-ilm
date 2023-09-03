import 'react-native-gesture-handler'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AppContainer from './AppContainer'
import * as Location from 'expo-location'
import { AppState, AppStateStatus, Keyboard, SafeAreaView, StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import { LocationContext } from './LocationContext'
import Background from './src/components/Background'
import { useFonts, Inter_700Bold, Inter_300Light, Inter_200ExtraLight, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter'
import _ from 'lodash'

import { getLocationByName } from './src/services'
import * as Sentry from 'sentry-expo'
import Constants from 'expo-constants'
import { retrieveStoredLocation, storeLocationData } from './src/utils/locationAsyncStorage'
import { registerForPushNotificationsAsync } from './src/utils/registerNotifications'
import Pin from './src/icons/Pin'
import { LogBox } from 'react-native'
import useAsyncStorage from './src/utils/useAsyncStorage'
import Autocomplete from 'react-native-autocomplete-input'
import { LocationAccuracy } from 'expo-location/src/Location.types'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { registerBackgroundFetchAsync } from './src/utils/currentWeatherNotification'
// axios.interceptors.request.use((request) => {
//   console.log('Starting Request', JSON.stringify(request.url, null, 2))
//   return request
// })

LogBox.ignoreAllLogs()
Sentry.init({
  dsn: 'https://af51d092fe394c5b832520eb8e494f93@o512763.ingest.sentry.io/5613608',
  enableInExpoDevelopment: true,
  debug: false, // Sentry will try to print out useful debugging information if something goes wrong with sending an event. Set this to `false` in production.
})
registerBackgroundFetchAsync()
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
  const [autocompleteData, setAutocompleteData] = useState([])
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState)
  const [isHighPerformance, setIsHighPerformance] = useAsyncStorage<boolean>('isHighPerformance', true)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      subscription.remove()
    }
  }, [])
  let [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
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
    if (status !== 'granted' && canAskAgain) {
      await Location.requestForegroundPermissionsAsync()
    }
    getLocationAsync()
  }

  async function getLocationAsync() {
    console.log('getLocation')
    const storedLocationObject = await retrieveStoredLocation()
    if (storedLocationObject) {
      setLocationData(storedLocationObject)
    }
    const providerStatus = await Location.getProviderStatusAsync()
    let status
    if (providerStatus.locationServicesEnabled) {
      const locationPermissionResult = await Location.getForegroundPermissionsAsync()
      status = locationPermissionResult.status
    } else {
      status = 'location-services-disabled'
    }
    console.log('status', status)
    if (status !== 'granted') {
      if (!storedLocationObject?.location) {
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
      let location = await Location.getCurrentPositionAsync({ accuracy: LocationAccuracy.Balanced })
      location.coords = {
        longitude: Number(location.coords.longitude.toFixed(2)),
        latitude: Number(location.coords.latitude.toFixed(2)),
        accuracy: null,
        heading: null,
        speed: null,
        altitudeAccuracy: null,
        altitude: null,
      }
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
    if (!query) {
      return Promise.resolve([])
    }
    return await getLocationByName(query)
  }

  const loadData = useCallback(async (query) => {
    const data = await getData(query)
    setAutocompleteData(data)
  }, [])

  const loadDataDebounced = useMemo(() => _.debounce(loadData, 300), [loadData])

  const { location, locationName, locationRegion } = locationData

  const placeholder = []
  if (locationName) {
    placeholder.push(locationName)
  }
  if (locationRegion) {
    placeholder.push(locationRegion)
  }

  const renderListItem = useCallback(
    ({ item, index }) => (
      <TouchableOpacity
        onPress={() => {
          setAutocompleteData([])
          const location = {
            coords: {
              latitude: Number(item.coordinates.split(';')[0]),
              longitude: Number(item.coordinates.split(';')[1]),
              accuracy: null,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: new Date().getTime(),
          }
          const locationName = item.settlement.trim()
          const locationRegion = item.county
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
        key={index}
        style={styles.listItem}
      >
        <Text style={styles.resultText}>{[item.settlement?.trim(), item.county?.trim()].join(', ')}</Text>
      </TouchableOpacity>
    ),
    [setAutocompleteData, setLocationData]
  )
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocationContext.Provider value={{ location, locationName, locationRegion }}>
        <Background location={location}>
          <SafeAreaView style={styles.autocompleteContainer}>
            {fontsLoaded && (
              <>
                <Pin width={20} height={20} fill="#fff" style={styles.pin} />
                <Autocomplete
                  renderItem={() => null}
                  data={autocompleteData}
                  onChangeText={loadDataDebounced}
                  listContainerStyle={{ borderRadius: 10, overflow: 'hidden', maxHeight: '70%', backgroundColor: '#fff' }}
                  flatListProps={{
                    keyboardShouldPersistTaps: 'always',
                    keyExtractor: (_, idx) => String(idx),
                    renderItem: renderListItem,
                  }}
                  key={placeholder.join(', ')}
                  style={styles.input}
                  placeholder={placeholder.join(', ')}
                  placeholderTextColor={'#fff'}
                  selectionColor="#fff"
                  containerStyle={styles.containerStyle}
                  inputContainerStyle={styles.inputContainer}
                />
              </>
            )}
          </SafeAreaView>
          <View
            style={{
              paddingTop: 60 + Constants.statusBarHeight,
              flex: 1,
              backgroundColor: 'transparent',
            }}
          >
            {fontsLoaded && <AppContainer />}
          </View>
        </Background>
      </LocationContext.Provider>
    </GestureHandlerRootView>
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
    paddingBottom: 11,
    backgroundColor: 'rgba(255,255,255,0)',
    borderRadius: 0,
    fontSize: 18,
    fontFamily: 'Inter_200ExtraLight',
  },
  inputContainer: {
    borderWidth: 0,
    marginBottom: 0,
    marginTop: 6,
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
  resultText: {
    fontFamily: 'Inter_300Light',
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopColor: '#f1f1f1',
    borderTopWidth: 1,
  },
})
