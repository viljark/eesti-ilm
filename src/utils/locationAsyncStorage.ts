import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'

export async function storeLocationData(locationDataArgs: { location: Location.LocationObject; locationName: string; locationRegion: string }) {
  try {
    await AsyncStorage.setItem('location', JSON.stringify(locationDataArgs))
    console.log('saved location', JSON.stringify(locationDataArgs))
  } catch (error) {
    // Error saving data
  }
}

export async function retrieveStoredLocation(): Promise<{
  location: Location.LocationObject
  locationRegion: string
  locationName: string
}> {
  return new Promise((resolve, reject) => {
    try {
      AsyncStorage.getItem('location', (e, locationObject) => {
        if (locationObject !== null) {
          console.log('retrieved location', locationObject)
          resolve(JSON.parse(locationObject))
        }
        resolve(null)
      })
    } catch (error) {
      return resolve(null)
    }
  })
}
