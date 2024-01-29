import AsyncStorage from '@react-native-async-storage/async-storage'
import { uniqueId, capitalize } from 'lodash'
import notifee, { EventType } from '@notifee/react-native'
import analytics from '@react-native-firebase/analytics'
import * as Notifications from 'expo-notifications'
import { AndroidNotificationVisibility } from 'expo-notifications'
import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import { closestHourlyStationWithObservationField, closestObservationField, closestStationWithObservationField, getDistance } from './distance'
import { getHourlyObservations, getObservations, HourlyObservation, Observations, Station } from '../services'
import { retrieveStoredLocation } from './locationAsyncStorage'
import { getPhenomenonText } from './phenomenonUtil'
import Feels from 'feels'
// @ts-ignore
import overcastMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast.png'
// @ts-ignore
import hailMeteocon from '@bybas/weather-icons/production/fill/png/256/extreme-hail.png'
// @ts-ignore
import clearDayMeteocon from '@bybas/weather-icons/production/fill/png/256/clear-day.png'
// @ts-ignore
import clearNightMeteocon from '@bybas/weather-icons/production/fill/png/256/clear-night.png'
// @ts-ignore
import fewCloudsDayMeteocon from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-day.png'
// @ts-ignore
import fewCloudsNightMeteocon from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-night.png'
// @ts-ignore
import lightRainMeteocon from '@bybas/weather-icons/production/fill/png/256/rain.png'
// @ts-ignore
import moderateRainMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast-rain.png'
// @ts-ignore
import strongRainMeteocon from '@bybas/weather-icons/production/fill/png/256/extreme-rain.png'
// @ts-ignore
import snowMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast-snow.png'
// @ts-ignore
import snowstormMeteocon from '@bybas/weather-icons/production/fill/png/256/wind-snow.png'
// @ts-ignore
import sleetMeteocon from '@bybas/weather-icons/production/fill/png/256/sleet.png'
// @ts-ignore
import glazeMeteocon from '@bybas/weather-icons/production/fill/png/256/snowflake.png'
// @ts-ignore
import fogMeteocon from '@bybas/weather-icons/production/fill/png/256/fog.png'
// @ts-ignore
import thunderMeteocon from '@bybas/weather-icons/production/fill/png/256/thunderstorms-overcast-rain.png'
// @ts-ignore
import thunderStormMeteocon from '@bybas/weather-icons/production/fill/png/256/thunderstorms-extreme-rain.png'
// @ts-ignore
import lightShowerDayMeteocon from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-day-rain.png'
// @ts-ignore
import lightShowerNightMeteocon from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-night-rain.png'
// @ts-ignore
import moderateShowerDayMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast-day-rain.png'
// @ts-ignore
import moderateShowerNightMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast-night-rain.png'
// @ts-ignore
import strongShowerDayMeteocon from '@bybas/weather-icons/production/fill/png/256/extreme-day-rain.png'
// @ts-ignore
import strongShowerNightMeteocon from '@bybas/weather-icons/production/fill/png/256/extreme-night-rain.png'
// @ts-ignore
import notAvailable from '@bybas/weather-icons/production/fill/png/256/not-available.png'

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

export async function showCurrentWeatherNotification(allObservations?: Observations, hourlyObservations?: HourlyObservation[]) {
  if (!allObservations) {
    allObservations = (await getObservations()).observations
  }
  if (!hourlyObservations) {
    hourlyObservations = await getHourlyObservations()
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
  const hourlyStationsWithDistance = hourlyObservations?.map((s) => {
    const stationLatLon = [Number(s.latitude), Number(s.longitude)]
    const distance = getDistance([location.coords.latitude, location.coords.longitude], stationLatLon)
    return {
      ...s,
      distance,
    }
  })

  let closestPhenomenonStation = closestHourlyStationWithObservationField(hourlyStationsWithDistance, 'pw15maEng')
  const closestPhenomenon = capitalize(closestPhenomenonStation.pw15maEng)
  const closestPhenomenonText = capitalize(closestPhenomenonStation.pw15maEst)
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
    title: closestPhenomenonText,
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

  if (phenomenonMapping.clear.includes(phenomenon)) return isDay ? clearDayMeteocon : clearNightMeteocon
  if (phenomenonMapping.fewClouds.includes(phenomenon)) return isDay ? fewCloudsDayMeteocon : fewCloudsNightMeteocon
  if (phenomenonMapping.overcast.includes(phenomenon)) return overcastMeteocon
  if (phenomenonMapping.snow.includes(phenomenon)) return snowMeteocon
  if (phenomenonMapping.snowStorm.includes(phenomenon)) return snowstormMeteocon
  if (phenomenonMapping.lightRain.includes(phenomenon)) return lightRainMeteocon
  if (phenomenonMapping.moderateRain.includes(phenomenon)) return moderateRainMeteocon
  if (phenomenonMapping.strongRain.includes(phenomenon)) return strongRainMeteocon
  if (phenomenonMapping.lightShower.includes(phenomenon)) return isDay ? lightShowerDayMeteocon : lightShowerNightMeteocon
  if (phenomenonMapping.moderateShower.includes(phenomenon)) return isDay ? moderateShowerDayMeteocon : moderateShowerNightMeteocon
  if (phenomenonMapping.strongShower.includes(phenomenon)) return isDay ? strongShowerDayMeteocon : strongShowerNightMeteocon
  if (phenomenonMapping.sleet.includes(phenomenon)) return sleetMeteocon
  if (phenomenonMapping.glaze.includes(phenomenon)) return glazeMeteocon
  if (phenomenonMapping.fog.includes(phenomenon)) return fogMeteocon
  if (phenomenonMapping.thunder.includes(phenomenon)) return thunderMeteocon
  if (phenomenonMapping.thunderStorm.includes(phenomenon)) return thunderStormMeteocon
  if (phenomenonMapping.hail.includes(phenomenon)) return hailMeteocon

  return notAvailable
}
