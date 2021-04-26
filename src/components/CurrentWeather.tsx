import React, { useContext, useState } from 'react'
import { StyleSheet, Text, View, Dimensions, TouchableWithoutFeedback } from 'react-native'
import Constants from 'expo-constants'
import { Station } from '../services'
import { LocationContext } from '../../LocationContext'
import Background from './Background'
import { PhenomenonIcon } from './PhenomenonIcon'
import { getPhenomenonText } from '../utils/phenomenonUtil'
import ArrowUp from '../icons/ArrowUp'
import Wind from '../icons/Wind'
import Water from '../icons/Water'
import UvIndex from '../icons/UvIndex'
import Humidity from '../icons/Humidity'
import { Forecast } from './Forecast'
import Precipitations from '../icons/Precipitations'

interface CurrentWeatherProps {
  closestStation: Station
  realFeel: number | null
  phenomenon: string
  windSpeed: string
  windSpeedMax: string
  windDirection: number
  waterTemperature: string
  waterStationName: string
  uv: string
  humidity: string
  latestUpdate: Date
  precipitations: string
}
const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height - (Constants.statusBarHeight + 50) //full height

function addZeroBefore(n) {
  return (n < 10 ? '0' : '') + n
}

export function CurrentWeather({
  closestStation,
  realFeel,
  phenomenon,
  windSpeed,
  windSpeedMax,
  windDirection,
  waterStationName,
  waterTemperature,
  uv,
  humidity,
  latestUpdate,
  precipitations,
}: CurrentWeatherProps) {
  const { location, locationName } = useContext(LocationContext)

  const [showOtherMeta, setShowOtherMeta] = useState<boolean>(false)

  const metaIconProps = {
    width: 25,
    height: 25,
    fill: '#fff',
    style: { marginRight: 10 },
  }
  return (
    <View style={styles.box}>
      <View style={styles.background}>
        <Background location={location}>
          <Text></Text>
        </Background>
      </View>
      <View style={styles.top}>
        <View style={styles.topMainContentWrap}>
          <View style={styles.temperatureWrap}>
            <Text style={styles.temperature}>{formatToSingleDigit(closestStation?.airtemperature)}</Text>
            <Text style={styles.degree}>°</Text>
            <Text style={styles.realFeel}>Tajutav {realFeel || '-'}°</Text>
          </View>
          <View style={styles.phenomenonWrap}>
            <PhenomenonIcon style={{ opacity: 1 }} width={110} height={110} phenomenon={phenomenon} latitude={location?.coords.latitude} longitude={location?.coords.longitude} />

            <Text style={styles.phenomenon}>{getPhenomenonText(phenomenon) || '-'}</Text>
          </View>
        </View>
      </View>
      <TouchableWithoutFeedback
        style={{ flex: 1 }}
        onPress={() => {
          setShowOtherMeta(!showOtherMeta)
        }}
      >
        <View style={styles.bottom}>
          <View style={styles.row}>
            <View style={styles.cellLeft}>
              <Wind {...metaIconProps} />
              <Text style={styles.metaText}>
                {formatToSingleDigit(windSpeed)}
                <Text style={styles.metaTextSmall}> </Text>-<Text style={styles.metaTextSmall}> </Text>
                {formatToSingleDigit(windSpeedMax)}
              </Text>
              <Text style={styles.metaTextSmall}>m/s</Text>
              <View
                style={{
                  margin: 8,
                  width: 15,
                  height: 15,
                  transform: [
                    {
                      rotate: `${windDirection}deg`,
                    },
                  ],
                }}
              >
                <ArrowUp width={15} height={15} style={{ transform: [{ rotate: '180deg' }] }} />
              </View>
            </View>
            <View style={styles.cellRight}>
              <Water {...metaIconProps} />
              <Text style={styles.metaText}>{formatToSingleDigit(waterTemperature)}°</Text>
              <Text style={styles.metaTextSmall}>{waterStationName || ''}</Text>
            </View>
          </View>
          <View style={styles.row}>
            {!showOtherMeta ? (
              <View style={styles.cellLeft}>
                <Precipitations {...metaIconProps} />
                <Text style={styles.metaText}>{precipitations}</Text>
                <Text style={styles.metaTextSmall}>mm/tunnis</Text>
              </View>
            ) : (
              <View style={styles.cellLeft}>
                <UvIndex {...metaIconProps} />
                <Text style={styles.metaText}>{uv}</Text>
              </View>
            )}
            <View style={styles.cellRight}>
              <Humidity {...metaIconProps} />
              <Text style={styles.metaText}>{humidity}%</Text>
            </View>
          </View>
          <View style={styles.rowForecast}>
            <Forecast latestUpdate={latestUpdate} />
          </View>
          <View style={styles.rowNarrow}>
            <Text style={styles.stationText}>
              {closestStation?.name}, {latestUpdate && addZeroBefore(latestUpdate.getHours()) + ':' + addZeroBefore(latestUpdate.getMinutes())}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

function formatToSingleDigit(value: string) {
  return isNaN(Number(value)) ? '-' : Math.round(Number(value))
}

const borderColor = 'rgba(0, 0, 0, 1)'

const styles = StyleSheet.create({
  box: {
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    width: width - 20,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 30,
    height: 355,
    overflow: 'hidden',
    backgroundColor: '#5C8BC2',
  },
  top: {
    height: 150,
    width: width - 20,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  topMainContentWrap: {
    paddingTop: 5,
    flex: 1,
    flexDirection: 'row',
  },
  background: {
    position: 'absolute',
    left: 0,
    top: -height + 355,
    transform: [
      {
        rotate: `${180}deg`,
      },
    ],
    height: height,
    width: width,
  },

  temperatureWrap: {
    paddingTop: 10,
    width: '50%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  temperature: {
    color: '#fff',
    fontSize: 90,
    fontFamily: 'Inter_200ExtraLight',
    marginBottom: 10,
    marginTop: -10,
    height: 130 - 30,
    letterSpacing: -5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  degree: {
    paddingTop: 10,
    color: '#fff',
    fontSize: 40,
    marginLeft: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  phenomenonWrap: {
    flex: 1,
    height: '100%',
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  phenomenon: {
    fontFamily: 'Inter_200ExtraLight',
    marginTop: 4,
    color: '#fff',
    fontSize: 14,
    flex: 1,
    flexBasis: '100%',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  bottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    flexDirection: 'column',
  },
  realFeel: {
    fontFamily: 'Inter_200ExtraLight',
    marginTop: 4,
    color: '#fff',
    fontSize: 14,
    flex: 1,
    flexBasis: '100%',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  row: {
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderColor: borderColor,
  },
  rowForecast: {
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 0.5,
    borderColor: borderColor,
  },
  rowNarrow: {
    height: 25,
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: borderColor,
  },
  cellLeft: {
    flex: 1,
    borderColor: borderColor,
    borderRightWidth: 0.5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  cellRight: {
    flex: 1,
    borderColor: borderColor,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  metaText: {
    fontSize: 25,
    color: '#fff',
    fontFamily: 'Inter_200ExtraLight',
  },
  metaTextSmall: {
    marginLeft: 4,
    marginRight: 8,
    paddingTop: 10,
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter_200ExtraLight',
  },
  stationText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Inter_200ExtraLight',
    textAlign: 'right',
    paddingRight: 20,
  },
})
