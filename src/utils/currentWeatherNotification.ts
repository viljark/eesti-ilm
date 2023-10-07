import AsyncStorage from '@react-native-async-storage/async-storage'
import { uniqueId, lowerCase } from 'lodash'
import notifee, { AndroidStyle, EventType } from '@notifee/react-native'
import analytics from '@react-native-firebase/analytics'
import * as Notifications from 'expo-notifications'
import { AndroidNotificationVisibility } from 'expo-notifications'
import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import { closestObservationField, closestStationWithObservationField, getDistance } from './distance'
import { getObservations, Observations, Station } from '../services'
import { retrieveStoredLocation } from './locationAsyncStorage'
import { getPhenomenonText } from './phenomenonUtil'
import Feels from 'feels'
// @ts-ignore
import overcastLottie from '@bybas/weather-icons/production/fill/png/256/overcast.png'
// @ts-ignore
import hailLottie from '@bybas/weather-icons/production/fill/png/256/extreme-hail.png'
// @ts-ignore
import clearDayLottie from '@bybas/weather-icons/production/fill/png/256/clear-day.png'
// @ts-ignore
import clearNightLottie from '@bybas/weather-icons/production/fill/png/256/clear-night.png'
// @ts-ignore
import fewCloudsDayLottie from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-day.png'
// @ts-ignore
import fewCloudsNightLottie from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-night.png'
// @ts-ignore
import lightRainLottie from '@bybas/weather-icons/production/fill/png/256/rain.png'
// @ts-ignore
import moderateRainLottie from '@bybas/weather-icons/production/fill/png/256/overcast-rain.png'
// @ts-ignore
import strongRainLottie from '@bybas/weather-icons/production/fill/png/256/extreme-rain.png'
// @ts-ignore
import snowLottie from '@bybas/weather-icons/production/fill/png/256/overcast-snow.png'
// @ts-ignore
import snowstormLottie from '@bybas/weather-icons/production/fill/png/256/wind-snow.png'
// @ts-ignore
import sleetLottie from '@bybas/weather-icons/production/fill/png/256/sleet.png'
// @ts-ignore
import glazeLottie from '@bybas/weather-icons/production/fill/png/256/snowflake.png'
// @ts-ignore
import fogLottie from '@bybas/weather-icons/production/fill/png/256/fog.png'
// @ts-ignore
import thunderLottie from '@bybas/weather-icons/production/fill/png/256/thunderstorms-overcast-rain.png'
// @ts-ignore
import thunderStormLottie from '@bybas/weather-icons/production/fill/png/256/thunderstorms-extreme-rain.png'

import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { useMemo } from 'react'
import { phenomenonMapping } from '../components/PhenomenonIcon'
import { getTimes } from 'suncalc'

const BACKGROUND_FETCH_TASK = 'background-fetch'

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now()

  console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`)
  await showCurrentWeatherNotification()
  // Be sure to return the successful result type!
  return BackgroundFetch.BackgroundFetchResult.NewData
})

export async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  })
}

export async function unregisterBackgroundFetchAsync() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK)
  if (!isRegistered) {
    return
  }
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
}

export async function registerNotificationChannel() {
  return Notifications.setNotificationChannelAsync('currentWeather3', {
    name: 'Hetkeilm',
    importance: Notifications.AndroidImportance.LOW,
    enableVibrate: false,
    sound: undefined,
    enableLights: false,
    showBadge: false,
    lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
  })
}

export function alertNoPermissions() {
  Alert.alert('Teavitused on keelatud', 'Luba teavitused süsteemi seadetest', [
    {
      text: 'Ava seaded',
      onPress: () => {
        Linking.openSettings()
      },
    },
    {
      text: 'Sulge',
    },
  ])
}

export async function getNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  let token
  if (finalStatus === 'granted') {
    token = (await Notifications.getExpoPushTokenAsync()).data
  }
  return { status: finalStatus, token }
}

notifee.onForegroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'update') {
    notifee.hideNotificationDrawer()
    await showCurrentWeatherNotification()
    await analytics().logEvent('notification_action_update')
  }
})

notifee.onBackgroundEvent(async (event) => {
  if (event.type === EventType.ACTION_PRESS && event.detail.pressAction.id === 'update') {
    await showCurrentWeatherNotification()
    await analytics().logEvent('notification_action_update')
  }
  return Promise.resolve()
})

export async function showCurrentWeatherNotification(allObservations?: Observations) {
  if (!allObservations) {
    allObservations = (await getObservations()).observations
  }
  const storedLocationObject = await retrieveStoredLocation()
  const location = storedLocationObject?.location

  if (!location || !allObservations.station) {
    return
  }

  const stationsWithDistance = allObservations.station?.map((s) => {
    const stationLatLon = [Number(s.latitude), Number(s.longitude)]
    const distance = getDistance([location.coords.latitude, location.coords.longitude], stationLatLon)
    return {
      ...s,
      distance,
    }
  })

  let closestPhenomenon = closestObservationField(stationsWithDistance, 'phenomenon')
  let closestTemperature = closestObservationField(stationsWithDistance, 'airtemperature')
  let closestWaterTemperature = closestObservationField(stationsWithDistance, 'watertemperature')
  let closestHumidity = closestObservationField(stationsWithDistance, 'relativehumidity')
  let closestWindSpeed = closestObservationField(stationsWithDistance, 'windspeed')
  let closestUvIndex = closestObservationField(stationsWithDistance, 'uvindex')
  let closestPrecipitations = closestObservationField(stationsWithDistance, 'precipitations')
  let airPressure = closestObservationField(stationsWithDistance, 'airpressure')

  const config = {
    temp: Number(closestTemperature),
    humidity: Number(closestHumidity),
    speed: Number(closestWindSpeed),
  }
  const realFeel = closestTemperature && closestHumidity && closestWindSpeed ? Math.round(new Feels(config).like()) : '-'

  const optionMap = {
    temperature: '🌡️' + Math.round(+closestTemperature) + '°',
    waterTemperature: '🌊 ' + Math.round(+closestWaterTemperature) + '°',
    realFeel: '🌡️' + String(realFeel) + '°',
    windSpeed: '💨 ' + Math.round(+closestWindSpeed) + ' m/s',
    humidity: '🌁 ' + closestHumidity + '%',
    precipitations: '🌧️ ' + closestPrecipitations + ' mm',
    uvIndex: '☀️ ' + (closestUvIndex ? Math.round(+closestUvIndex) : '-'),
  }

  const body = [optionMap.temperature, optionMap.windSpeed, optionMap.uvIndex, optionMap.waterTemperature, optionMap.precipitations]

  await showPushNotification({
    title: getPhenomenonText(closestPhenomenon),
    body: body.join(' | '),
    color: undefined,
    temperature: String(Math.round(+closestTemperature)),
    phenomenon: closestPhenomenon,
    location: storedLocationObject.locationName,
  })
}

async function showPushNotification({ title, body, color, temperature, phenomenon, location }) {
  let id = (await AsyncStorage.getItem('notificationId')) || null
  if (!id) {
    id = uniqueId('notification')
    await AsyncStorage.setItem('notificationId', id)
  }
  const largeIcon = await getIcon(phenomenon)
  await notifee.displayNotification({
    id,
    title: title,
    body,
    subtitle: location,
    android: {
      largeIcon,
      smallIcon: 'ic_stat_' + temperature.replace('-', '_'),
      channelId: 'currentWeather3',
      color: color,
      timestamp: Date.now(),
      showTimestamp: true,
      ongoing: true,
      autoCancel: false,
      pressAction: {
        id: 'default',
      },
      actions: [
        {
          title: 'Uuenda andmeid',
          pressAction: {
            id: 'update',
          },
        },
      ],
    },
  })
}

async function getIcon(phenomenon: string) {
  const { location } = await retrieveStoredLocation()

  const sunTimes = location ? getTimes(new Date(), location.coords.latitude, location.coords.longitude) : null

  const isDay = sunTimes ? new Date().getTime() < sunTimes.sunset.getTime() && new Date().getTime() > sunTimes.sunrise.getTime() : true

  if (phenomenonMapping.clear.includes(phenomenon)) return isDay ? clearDayLottie : clearNightLottie
  if (phenomenonMapping.fewClouds.includes(phenomenon)) return isDay ? fewCloudsDayLottie : fewCloudsNightLottie
  if (phenomenonMapping.overcast.includes(phenomenon)) return overcastLottie
  if (phenomenonMapping.snow.includes(phenomenon)) return snowLottie
  if (phenomenonMapping.snowStorm.includes(phenomenon)) return snowstormLottie
  if (phenomenonMapping.lightRain.includes(phenomenon)) return lightRainLottie
  if (phenomenonMapping.moderateRain.includes(phenomenon)) return moderateRainLottie
  if (phenomenonMapping.strongRain.includes(phenomenon)) return strongRainLottie
  if (phenomenonMapping.sleet.includes(phenomenon)) return sleetLottie
  if (phenomenonMapping.glaze.includes(phenomenon)) return glazeLottie
  if (phenomenonMapping.fog.includes(phenomenon)) return fogLottie
  if (phenomenonMapping.thunder.includes(phenomenon)) return thunderLottie
  if (phenomenonMapping.thunderStorm.includes(phenomenon)) return thunderStormLottie
  if (phenomenonMapping.hail.includes(phenomenon)) return hailLottie
}
