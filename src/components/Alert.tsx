import { Warning } from '../services'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import * as Location from 'expo-location'
import Background from './Background'
import Constants from 'expo-constants'
import { blockBackground, commonStyles } from '../utils/styles'
import { ScrollView } from 'react-native-gesture-handler'

const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height - (Constants.statusBarHeight + 50) //full height

export function Alert({ alert, location }: { alert: Warning; location: Location.LocationObject }) {
  return (
    <>
      {alert && (
        <TouchableOpacity
          style={{
            display: 'flex',
            marginTop: 10,
            borderRadius: 15,
            backgroundColor: 'rgba(0,0,0, .5)',
            overflow: 'hidden',
            ...commonStyles.blockShadow,
          }}
          // onPress={async () => {
          //   await WebBrowser.openBrowserAsync('https://www.ilmateenistus.ee/ilm/prognoosid/hoiatused/')
          // }}
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
          <View style={{ display: 'flex', flexDirection: 'column', padding: 10, backgroundColor: blockBackground, flexShrink: 0 }}>
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
              {alert.content_est}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  )
}
