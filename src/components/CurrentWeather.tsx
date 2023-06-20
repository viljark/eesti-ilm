import React, { useContext, useEffect, useState } from 'react'
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
import { commonStyles } from '../utils/styles'
import { getFormattedDateTime, getFormattedTime } from '../utils/formatters'
import Sunrise from '../icons/Sunrise'
import Sunset from '../icons/Sunset'
import { getTimes, GetTimesResult } from 'suncalc'
import Barometer from '../icons/Barometer'
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
  precipitations: string
  latestUpdate: Date
  observationsReceivedAt: number
  airpressure: string
}
const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height - (Constants.statusBarHeight + 50) //full height

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
  observationsReceivedAt,
  airpressure,
}: CurrentWeatherProps) {
  const { location, locationName } = useContext(LocationContext)

  const [showOtherMeta, setShowOtherMeta] = useState<boolean>(false)
  const [sunTimes, setSunTimes] = useState<GetTimesResult>(null)

  const metaIconProps = {
    width: 25,
    height: 25,
    fill: '#fff',
    style: { marginRight: 10 },
  }

  useEffect(() => {
    const sunTimes = location ? getTimes(new Date(), location.coords.latitude, location.coords.longitude) : null
    setSunTimes(sunTimes)
  }, [location, latestUpdate])

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
            <Text allowFontScaling={false} style={styles.temperature}>
              {formatToSingleDigit(closestStation?.airtemperature)}
            </Text>
            <Text allowFontScaling={false} style={styles.degree}>
              °
            </Text>
            <Text style={styles.realFeel}>Tajutav {realFeel || '-'}°</Text>
          </View>
          <View style={styles.phenomenonWrap}>
            <PhenomenonIcon
              style={{ opacity: 1 }}
              width={110}
              height={110}
              phenomenon={phenomenon}
              latitude={location?.coords.latitude}
              longitude={location?.coords.longitude}
              date={observationsReceivedAt ? new Date(observationsReceivedAt) : new Date()}
            />

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
              <Text allowFontScaling={false} style={styles.metaText}>
                {formatToSingleDigit(windSpeed)}
                <Text allowFontScaling={false} style={styles.metaTextSmall}>
                  {' '}
                </Text>
                -<Text style={styles.metaTextSmall}> </Text>
                {formatToSingleDigit(windSpeedMax)}
              </Text>
              <Text allowFontScaling={false} style={styles.metaTextSmall}>
                m/s
              </Text>
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
              <Text allowFontScaling={false} style={styles.metaText}>
                {formatToSingleDigit(waterTemperature)}°
              </Text>
              <Text allowFontScaling={false} style={styles.metaTextExtraSmall}>
                {waterStationName || ''}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cellLeft}>
              <Precipitations {...metaIconProps} />
              <Text allowFontScaling={false} style={styles.metaText}>
                {precipitations}
              </Text>
              <Text allowFontScaling={false} style={styles.metaTextSmall}>
                mm/tunnis
              </Text>
            </View>
            <View style={styles.cellRight}>
              <Humidity {...metaIconProps} />
              <Text allowFontScaling={false} style={styles.metaText}>
                {humidity}%
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cellLeft}>
              <UvIndex {...metaIconProps} />
              <Text allowFontScaling={false} style={styles.metaText}>
                {uv}
              </Text>
            </View>
            <View style={styles.cellRight}>
              <Barometer {...metaIconProps} />

              <Text allowFontScaling={false} style={styles.metaText}>
                {airpressure}
              </Text>
              <Text allowFontScaling={false} style={styles.metaTextSmall}>
                hPa
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cellLeft}>
              <Sunrise {...metaIconProps} />
              <Text allowFontScaling={false} style={styles.metaText}>
                {sunTimes ? getFormattedTime(sunTimes.sunrise.getTime()) : '-'}
              </Text>
            </View>
            <View style={styles.cellRight}>
              <Sunset {...metaIconProps} />
              <Text allowFontScaling={false} style={styles.metaText}>
                {sunTimes ? getFormattedTime(sunTimes.sunset.getTime()) : '-'}
              </Text>
            </View>
          </View>
          <View style={styles.rowForecast}>
            <Forecast latestUpdate={latestUpdate} />
          </View>
          <View style={styles.rowNarrow}>
            <Text allowFontScaling={false} style={styles.stationText}>
              {closestStation?.name} - {observationsReceivedAt && getFormattedDateTime(observationsReceivedAt)}
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
    marginTop: 0,
    width: width - 20,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 30,
    height: 455,
    overflow: 'hidden',
    backgroundColor: '#5C8BC2',
    marginBottom: 20,
    ...commonStyles.blockShadow,
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
    top: -height + 455,
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
    height: 130 - 26,
    letterSpacing: -5,
    ...commonStyles.textShadow,
  },
  degree: {
    paddingTop: 10,
    color: '#fff',
    fontSize: 40,
    marginLeft: 0,
    ...commonStyles.textShadow,
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
    ...commonStyles.textShadow,
  },

  bottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    flexDirection: 'column',
  },
  realFeel: {
    fontFamily: 'Inter_200ExtraLight',
    marginTop: 0,
    color: '#fff',
    fontSize: 14,
    flex: 1,
    flexBasis: '100%',
    textAlign: 'center',
    ...commonStyles.textShadow,
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
  metaTextExtraSmall: {
    marginLeft: 4,
    marginRight: 8,
    paddingTop: 10,
    fontSize: 10,
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
