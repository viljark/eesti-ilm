import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import * as Location from 'expo-location'
import { getFirestore } from './firebase'
import * as Application from 'expo-application'

export async function storeLocationData(locationDataArgs: { location: Location.LocationObject; locationName: string; locationRegion: string }) {
  try {
    await AsyncStorage.setItem('location', JSON.stringify(locationDataArgs))
    getFirestore().collection('users').doc(Application.androidId).set({ locationRegion: locationDataArgs.locationRegion, updatedAt: new Date() }, { merge: true })
    // console.log('saved location', JSON.stringify(locationDataArgs))
  } catch (error) {
    // Error saving data
    console.error(error)
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
          // console.log('retrieved location', locationObject)
          resolve(JSON.parse(locationObject))
        }
        resolve(null)
      })
    } catch (error) {
      return resolve(null)
    }
  })
}
