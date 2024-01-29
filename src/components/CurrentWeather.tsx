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
  phenomenonText: string
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
  phenomenonText,
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

  const isDay = sunTimes ? new Date().getTime() < sunTimes.sunset.getTime() && new Date().getTime() > sunTimes.sunrise.getTime() : true
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

  const dayAwareTextStyles = [{ color: isDay ? 'rgba(0, 0, 0, 0.5)' : '#fff' }, !isDay && commonStyles.textShadow]

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
            <View style={styles.temperatureMain}>
              <Text allowFontScaling={false} style={styles.temperature}>
                {formatToSingleDigit(closestStation?.airtemperature)}
              </Text>
              <Text allowFontScaling={false} style={styles.degree}>
                °
              </Text>
            </View>
            <Text style={[styles.realFeel, ...dayAwareTextStyles]}>Tajutav {realFeel || '-'}°</Text>
          </View>
          <View style={styles.phenomenonWrap}>
            <View style={{ width: 110, height: 110 }}>
              <PhenomenonIcon
                style={styles.phenomenonIcon}
                width={160}
                height={160}
                phenomenon={phenomenon}
                latitude={location?.coords.latitude}
                longitude={location?.coords.longitude}
                isDay={isDay}
                animated={true}
                theme="meteocon"
              />
            </View>

            <Text style={[styles.phenomenon, ...dayAwareTextStyles]}>{phenomenonText || '-'}</Text>
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

const borderColor = 'rgba(0, 0, 0, 0.5)'

const styles = StyleSheet.create({
  box: {
    marginTop: 0,
    width: width - 20,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 30,
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
    top: -height + 535,
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
    flexDirection: 'column',
    alignItems: 'center',
  },
  temperatureMain: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
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
    fontFamily: 'Inter_200Light',
    marginTop: 4,
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 1,
  },
  phenomenonIcon: { opacity: 1, position: 'absolute', left: -12, top: -10 },
  bottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    flexDirection: 'column',
  },
  realFeel: {
    fontFamily: 'Inter_200Light',
    marginTop: 0,
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 2,
  },
  row: {
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderColor: borderColor,
  },
  rowForecast: {
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
