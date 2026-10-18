import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ForecastResponse, getForecast, normalizeForecastDays } from '../services'
import { PhenomenonIcon } from './PhenomenonIcon'
import { getDayName } from '../utils/formatters'
import useAsyncStorage from '../utils/useAsyncStorage'
import { useNavigation } from '@react-navigation/native'
import InfoIcon from '../icons/InfoIcon'

const width = Dimensions.get('window').width //full width

export function Forecast(props: { latestUpdate: Date }) {
  const nav = useNavigation<any>()
  const [forecast, setForecast] = useAsyncStorage<ForecastResponse>('forecast')
  const [forecastUpdated, setForecastUpdated] = useAsyncStorage<Date>('forecastUpdated', null)
  const [activeForecast, setActiveForecast] = useState<string>('day')

  useEffect(() => {
    if (!forecastUpdated || (forecastUpdated && new Date().getTime() - forecastUpdated.getTime() > 1000 * 60 * 30)) {
      loadForecast()
    }
  }, [props.latestUpdate, forecastUpdated])

  async function loadForecast() {
    try {
      const response = await getForecast()
      const days = normalizeForecastDays(response?.forecasts?.forecast)
      if (days.length > 0) {
        setForecast({ ...response, forecasts: { ...response.forecasts, forecast: days } })
      }
    } catch (e) {
      console.warn('Forecast fetch failed', e)
    }
    setForecastUpdated(new Date())
  }

  // Values cached by older builds may still hold the single-object shape, so
  // normalize on read as well as on write.
  const forecastDays = normalizeForecastDays(forecast?.forecasts?.forecast)

  const handleClick = () => {
    setActiveForecast(activeForecast === 'day' ? 'night' : 'day')
  }

  return (
    <>
      <View style={styles.row}>
        {forecastDays.map((f, i) => (
            <TouchableOpacity
              key={f.$.date}
              style={styles.forecast}
              onPress={() => {
                nav.navigate('DayForecastScreen', {
                  forecast: forecastDays,
                  index: i,
                })
              }}
            >
              <InfoIcon width={10} height={10} fill={'#fff'} style={styles.infoIcon} />
              <PhenomenonIcon
                phenomenon={f['night'].phenomenon}
                isDay={false}
                width={40}
                height={40}
                style={{
                  marginTop: 5,
                }}
                animated={false}
                theme="meteocon"
              />
              <Text style={styles.smallText}>
                {f['night'].tempmin} - {f['night'].tempmax}°
              </Text>
              <PhenomenonIcon
                phenomenon={f['day'].phenomenon}
                isDay={true}
                width={40}
                height={40}
                style={{
                  marginTop: 5,
                }}
                animated={false}
                theme="meteocon"
              />
              <Text style={styles.smallText}>
                {f['day'].tempmin} - {f['day'].tempmax}°
              </Text>
              <Text style={[styles.smallText, { fontSize: 11, marginTop: 5 }]}>{getDayName(f.$.date)}</Text>
            </TouchableOpacity>
          ))}
      </View>
      {!forecast && <ActivityIndicator size="small" color="#fff" />}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: width - 20,
    left: 0,
    display: 'flex',
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  forecast: {
    display: 'flex',
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,

    paddingVertical: 10,
  },
  smallText: {
    fontFamily: 'Inter_200ExtraLight',
    color: '#fff',
    opacity: 1,
    fontSize: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    marginTop: -5,
  },
  infoIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
})
