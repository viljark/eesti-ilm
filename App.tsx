import React, { useEffect, useState } from 'react'
import AppContainer from './AppContainer'
import * as Location from 'expo-location'
import { Alert, AppState, AppStateStatus, AsyncStorage, SafeAreaView, StyleSheet } from 'react-native'
import { LocationContext } from './LocationContext'
import Background from './src/components/Background'
import * as Analytics from 'expo-firebase-analytics'
import { useFonts, Inter_700Bold, Inter_300Light, Inter_200ExtraLight } from '@expo-google-fonts/inter'

import { Autocomplete } from 'react-native-dropdown-autocomplete'
import { getLocationByName } from './src/services'
import * as Sentry from 'sentry-expo'
import Constants from 'expo-constants'

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

  async function storeLocationData(locationDataArgs: { location: Location.LocationObject; locationName: string; locationRegion: string }) {
    try {
      await AsyncStorage.setItem('location', JSON.stringify(locationDataArgs))
      console.log('saved location', JSON.stringify(locationDataArgs))
    } catch (error) {
      // Error saving data
    }
  }

  async function retrieveStoredLocation(): Promise<{
    location: Location.LocationObject
    locationRegion: string
    locationName: string
  }> {
    try {
      const locationObject = await AsyncStorage.getItem('location')
      if (locationObject !== null) {
        console.log('retrieved location', locationObject)
        return JSON.parse(locationObject)
      }
    } catch (error) {
      return null
    }
    return null
  }

  useEffect(() => {
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
      console.log('set setLocationData from cache ', JSON.stringify(storedLocationObject))
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
          locationRegion: 'Tartumaa',
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

  // Get the current screen from the navigation state
  function getActiveRouteName(navigationState) {
    if (!navigationState) return null
    const route = navigationState.routes[navigationState.index]
    // Parse the nested navigators
    if (route.routes) return getActiveRouteName(route)
    return route.routeName
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
    <LocationContext.Provider value={{ location, locationName, locationRegion }}>
      <Background location={location}>
        <SafeAreaView style={styles.autocompleteContainer}>
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
              const locationRegion = label.split(', ')[1]
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
            placeholderColor={'rgba(0, 0, 0, 1)'}
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
        </SafeAreaView>
        {fontsLoaded && (
          <AppContainer
            onNavigationStateChange={(prevState, currentState) => {
              const currentScreen = getActiveRouteName(currentState)
              const prevScreen = getActiveRouteName(prevState)
              if (prevScreen !== currentScreen) {
                try {
                  Analytics.setCurrentScreen(currentScreen)
                } catch (e) {
                  console.warn('analytics error', e)
                }
                // Update Firebase with the name of your screen
              }
            }}
          />
        )}
      </Background>
    </LocationContext.Provider>
  )
}

const styles = StyleSheet.create({
  autocompleteContainer: {
    marginTop: 0,
    paddingTop: 0,
    width: '100%',
    paddingHorizontal: 8,
    flex: 1,
    flexGrow: 1,
    left: 0,
    position: 'absolute',
    top: Constants.statusBarHeight + 3,
    zIndex: 2,
  },
  input: {
    color: 'black',
    width: '100%',
    borderColor: 'white',
    paddingLeft: 10,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 3,
    fontSize: 14,
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
