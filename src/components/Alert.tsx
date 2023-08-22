import { getWarningForLocation, Warning } from '../services'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import * as Location from 'expo-location'
import Background from './Background'
import Constants from 'expo-constants'
import { blockBackground, commonStyles } from '../utils/styles'
import * as WebBrowser from 'expo-web-browser'
import { LocationContext } from '../../LocationContext'
import LottieView from 'lottie-react-native'
import thunderStormLottie from '@bybas/weather-icons/production/fill/lottie/thunderstorms-extreme-rain.json'
import windAlertLottie from '@bybas/weather-icons/production/fill/lottie/wind-alert.json'
import useAsyncStorage from '../utils/useAsyncStorage'

const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height - (Constants.statusBarHeight + 50) //full height

export function Alert({ latestUpdate }: { latestUpdate: Date }) {
  const { location, locationName, locationRegion } =
    useContext<{
      location: Location.LocationObject
      locationName: string
      locationRegion: string
    }>(LocationContext)
  const [warning, setWarning] = useAsyncStorage<Warning>('warning', null)
  async function fetchWarnings() {
    const warning = await getWarningForLocation(locationRegion)
    console.log('warning', warning)
    setWarning(warning || null)
  }

  useEffect(() => {
    fetchWarnings()
  }, [locationRegion, latestUpdate])

  const alertIcon = useMemo(() => {
    if (!warning) return
    if (warning.content_est.includes('äike')) return thunderStormLottie
    if (warning.content_est.includes('tuul')) return windAlertLottie
  }, [warning])

  return (
    <>
      {warning && (
        <TouchableOpacity
          style={{
            display: 'flex',
            marginTop: 0,
            marginBottom: 10,
            borderRadius: 20,
            backgroundColor: 'rgba(0,0,0, .5)',
            marginLeft: 10,
            marginRight: 10,
            overflow: 'hidden',
            ...commonStyles.blockShadow,
          }}
          onPress={async () => {
            await WebBrowser.openBrowserAsync('https://www.ilmateenistus.ee/ilm/prognoosid/hoiatused/')
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: 0,
              bottom: -200,
              transform: [
                {
                  rotate: `${180}deg`,
                },
              ],
              height: height,
              width: width,
              zIndex: -1,
            }}
          >
            <Background location={location}>
              <Text></Text>
            </Background>
          </View>
          {/* <ScrollView scrollEnabled showsVerticalScrollIndicator style={{ maxHeight: 190, overflow: 'scroll' }}> */}
          <View style={{ flexDirection: 'row', backgroundColor: blockBackground, alignItems: 'center' }}>
            <View style={{ display: 'flex', flexDirection: 'column', padding: 10, paddingRight: 0, flexShrink: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: '#fff',
                  fontFamily: 'Inter_700Bold',
                }}
              >
                <Text
                  style={{
                    color: 'red',
                    fontSize: 15,
                    fontFamily: 'Inter_700Bold',
                  }}
                >
                  ⚠{' '}
                </Text>
                Hoiatus
              </Text>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 12,
                  paddingLeft: 18,
                  fontFamily: 'Inter_200ExtraLight',
                }}
              >
                {warning.content_est}
              </Text>
            </View>
            {alertIcon && (
              <View style={{ marginLeft: 'auto', paddingHorizontal: 10 }}>
                <LottieView autoPlay style={{ width: 50, height: 50, marginLeft: -10, paddingLeft: 10 }} source={alertIcon} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}
    </>
  )
}
