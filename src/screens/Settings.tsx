import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, ToastAndroid, ActivityIndicator } from 'react-native'
import _ from 'lodash'
import { ScrollView, Switch, TouchableNativeFeedback } from 'react-native-gesture-handler'
import * as Application from 'expo-application'
import Constants from 'expo-constants'
import { getFirestore } from '../utils/firebase'

export default function SettingsScreen() {
  const [isWarningNotificationEnabled, setIsWarningNotificationEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
    <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="always">
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
      <View style={{ ...styles.itemWrapper }}>
        <TouchableNativeFeedback style={styles.item}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.text}>Arendaja kontakt: viljark+ilm@gmail.com</Text>
            <Text style={styles.text}></Text>
            <Text style={styles.smallText}>Ilmainfo ning hoiatused: Riigi Ilmateenistus - www.ilmateenistus.ee</Text>
            <Text style={styles.smallText}>Icons made by fjstudio from www.flaticon.com</Text>
            <Text style={styles.smallText}>Icons made by Freepik from www.flaticon.com is licensed by CC 3.0</Text>
          </View>
        </TouchableNativeFeedback>
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
  smallText: {
    fontFamily: 'Inter_200ExtraLight',
    color: '#fff',
    fontSize: 10,
  },
})
