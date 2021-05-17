import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { Expo, ExpoPushMessage } from 'expo-server-sdk'
const convert = require('xml-js')
import axios from 'axios'

export interface Warning {
  timestamp: { _text: string }
  area_est: { _text: string }
  area_eng: { _text: string }
  content_est: { _text: string }
  content_eng: { _text: string }
}

interface Warnings {
  warning: Warning[] | Warning
}

interface WarningsResponse {
  warnings: Warnings
}

interface UserWarning {
  pushToken: string
  warning: Warning
}

let expo = new Expo()

admin.initializeApp()

const firestore = admin.firestore()

exports.checkAlerts = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  const warningsResponse = await getWarnings()
  const warning = warningsResponse?.warnings?.warning
  let timestamp
  await firestore.collection('serverState').doc('lastCheckAt').set({ timestamp: new Date() })
  if (warning) {
    if (Array.isArray(warning)) {
      timestamp = warning[0]?.timestamp._text
    } else {
      timestamp = warning.timestamp._text
    }
  }

  const lastWarningTimestampResponse = await firestore.collection('serverState').doc('lastWarningTimestamp').get()

  const lastTimestamp = lastWarningTimestampResponse.data()?.timestamp

  if (lastTimestamp && timestamp && Number(lastTimestamp) >= Number(timestamp)) {
    console.log('no warning data available')
    return
  }

  if (timestamp) {
    await firestore.collection('serverState').doc('lastWarningTimestamp').set({ timestamp: timestamp })
  }

  const userWarnings: UserWarning[] = []
  firestore
    .collection('users')
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        const userData = doc.data()
        const warning = getWarningForLocation(userData.locationRegion, warningsResponse)
        if (warning) {
          userWarnings.push({
            pushToken: userData.pushToken,
            warning: warning,
          })
        }
      })
      sendMessages(userWarnings)
    })
  return null
})

async function sendMessages(userWarnings: UserWarning[]) {
  // Create the messages that you want to send to clients
  let messages: ExpoPushMessage[] = []
  for (let userWarning of userWarnings) {
    if (!Expo.isExpoPushToken(userWarning.pushToken)) {
      console.error(`Push token ${userWarning.pushToken} is not a valid Expo push token`)
      continue
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: userWarning.pushToken,
      sound: 'default',
      title: `Ilmahoiatus - ${userWarning.warning.area_est._text}`,
      body: userWarning.warning?.content_est?._text,
    })
  }
  let chunks = expo.chunkPushNotifications(messages)
  for (let chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk)
      console.log('sent chunk')
    } catch (error) {
      console.error(error)
    }
  }
}

async function getWarnings(): Promise<WarningsResponse> {
  let response
  try {
    response = await axios({
      method: 'get',
      url: 'https://www.ilmateenistus.ee/ilma_andmed/xml/hoiatus.php',
      responseType: 'text',
    })
  } catch (e) {
    if (e.response) {
      response = e.response
    }
  }

  return JSON.parse(convert.xml2json(response.data, { compact: true, spaces: 4 }))
}

function getWarningForLocation(locationRegion: string | undefined, warningsResponse: WarningsResponse): Warning | undefined {
  if (!locationRegion) return
  let warning = warningsResponse?.warnings?.warning
  let locationWarning
  if (warning) {
    if (Array.isArray(warning)) {
      locationWarning = warning.find((w) => {
        return w.area_eng?._text.includes(locationRegion) || w.area_est?._text.includes(locationRegion)
      })
    } else {
      if (warning.area_eng._text.includes(locationRegion) || warning.area_est._text.includes(locationRegion)) {
        locationWarning = warning
      }
    }

    return locationWarning
  }
  return undefined
}
