import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { getFirestore } from './firebase'
import { retrieveStoredLocation } from './locationAsyncStorage'

export const registerForPushNotificationsAsync = async () => {
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      console.error('Failed to get push token for push notification!')
      return
    }
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data
      if (token) {
        const storedLocationObject = await retrieveStoredLocation()
        getFirestore()
          .collection('users')
          .doc(Constants.deviceId)
          .set({ pushToken: token, id: Constants.deviceId, updatedAt: new Date(), locationRegion: storedLocationObject?.locationRegion || '' }, { merge: true })
        console.log('token', token)
      } else {
        console.error('no token')
      }
    } catch (e) {
      console.error(e)
    }
  } else {
    console.log('Must use physical device for Push Notifications')
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }
}
