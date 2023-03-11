import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, ToastAndroid, ActivityIndicator, Linking } from 'react-native'
import { ScrollView, Switch, TouchableNativeFeedback } from 'react-native-gesture-handler'
import * as Application from 'expo-application'
import { getFirestore } from '../utils/firebase'
import useAsyncStorage from '../utils/useAsyncStorage'
import { useBetween } from 'use-between'

const useSettings = () => {
  const [isDarkMap, setIsDarkMap] = useAsyncStorage<boolean>('darkMap')

  return {
    isDarkMap,
    setIsDarkMap,
  }
}

export const useSharedSettings = () => useBetween(useSettings)
export default function SettingsScreen() {
  const [isWarningNotificationEnabled, setIsWarningNotificationEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isDarkMap, setIsDarkMap } = useSharedSettings()
  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const userSnapshot = await getFirestore().collection('users').doc(Application.androidId).get()
        const user = userSnapshot.data()

        if (typeof user?.isWarningNotificationEnabled !== 'boolean') {
          getFirestore().collection('users').doc(Application.androidId).set({ isWarningNotificationEnabled: true }, { merge: true })
          setIsWarningNotificationEnabled(true)
        } else {
          setIsWarningNotificationEnabled(user?.isWarningNotificationEnabled || false)
        }
      } catch (e) {
        console.error(e)
      }
      setIsLoading(false)
    })()
  }, [])

  async function toggleIsWarningNotificationEnabled(value: boolean) {
    setIsWarningNotificationEnabled(value)
    ToastAndroid.show(value ? 'Teavitused sees' : 'Teavitused väljas', ToastAndroid.SHORT)
    await getFirestore().collection('users').doc(Application.androidId).set({ isWarningNotificationEnabled: value }, { merge: true })
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="always">
      <View style={styles.itemWrapper}>
        <TouchableNativeFeedback
          style={styles.item}
          onPress={() => {
            toggleIsWarningNotificationEnabled(!isWarningNotificationEnabled)
          }}
        >
          <Text style={styles.switchText}>Teavitused hoiatustest minu maakonnas (torm, äike, tuisk)</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 'auto' }} />
          ) : (
            <Switch
              trackColor={{ false: '#767577', true: '#50eb75' }}
              thumbColor={isWarningNotificationEnabled ? '#f4f3f4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleIsWarningNotificationEnabled}
              value={isWarningNotificationEnabled}
              style={{ marginLeft: 'auto' }}
            />
          )}
        </TouchableNativeFeedback>
      </View>
      <View style={styles.itemWrapper}>
        <TouchableNativeFeedback
          style={styles.item}
          onPress={() => {
            setIsDarkMap(!isDarkMap)
          }}
        >
          <Text style={styles.switchText}>Tume sademete kaart</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#50eb75' }}
            thumbColor={isDarkMap ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => {
              setIsDarkMap(!isDarkMap)
            }}
            value={isDarkMap}
            style={{ marginLeft: 'auto' }}
          />
        </TouchableNativeFeedback>
      </View>
      <View style={{ ...styles.itemWrapper }}>
        <TouchableNativeFeedback
          style={styles.item}
          onPress={() => {
            Linking.openURL('mailto:viljark+ilm@gmail.com')
          }}
        >
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.text}>Arendaja kontakt: viljark+ilm@gmail.com</Text>
            <Text style={styles.text}></Text>
            <Text style={styles.smallText}>Ilmainfo ning hoiatused: Riigi Ilmateenistus - www.ilmateenistus.ee</Text>
            <Text style={styles.text}></Text>
            <Text style={styles.smallText}>Icons made by fjstudio from www.flaticon.com</Text>
            <Text style={styles.smallText}>Icons made by Freepik from www.flaticon.com is licensed by CC 3.0</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
      <View style={styles.bottomButtons}>
        <View style={{ ...styles.buttonsWrapper, alignSelf: 'center', marginTop: 'auto' }}>
          <TouchableNativeFeedback
            style={styles.itemButton}
            onPress={async () => {
              await Linking.openURL('https://play.google.com/store/apps/details?id=ee.viljark.eestiilm&showAllReviews=true')
            }}
          >
            <Text style={styles.buttonText}>🌟 Jäta tagasisidet</Text>
          </TouchableNativeFeedback>
        </View>
        <View style={{ ...styles.buttonsWrapper }}>
          <TouchableNativeFeedback
            style={styles.itemButton}
            onPress={async () => {
              await Linking.openURL('https://play.google.com/store/apps/developer?id=Viljar+K%C3%A4rgenberg')
            }}
          >
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.buttonText}>⚡️ Minu teised äppid</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
    flexDirection: 'column',
    position: 'relative',
  },
  itemWrapper: {
    overflow: 'hidden',
    borderRadius: 15,
    marginBottom: 10,
  },
  item: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    padding: 10,
    overflow: 'hidden',
  },
  bottomButtons: {
    alignSelf: 'center',
    marginTop: 'auto',
  },
  buttonsWrapper: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 10,
  },
  itemButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    padding: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    flexShrink: 0,
  },
  switchText: {
    fontFamily: 'Inter_200ExtraLight',
    color: '#fff',
    fontSize: 12,
    width: '75%',
  },
  text: {
    fontFamily: 'Inter_200ExtraLight',
    color: '#fff',
    fontSize: 12,
  },
  buttonText: {
    fontFamily: 'Inter_300Light',
    color: '#ffffff',
    fontSize: 14,
  },
  smallText: {
    fontFamily: 'Inter_200ExtraLight',
    color: '#fff',
    fontSize: 10,
  },
})
