import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ForecastResponse, getForecast } from '../services'
import { PhenomenonIcon } from './PhenomenonIcon'
import { getDayName } from '../utils/formatters'
import useAsyncStorage from '../utils/useAsyncStorage'

const width = Dimensions.get('window').width //full width

export function Forecast(props: { latestUpdate: Date }) {
  const [forecast, setForecast] = useAsyncStorage<ForecastResponse>('forecast')
  const [forecastUpdated, setForecastUpdated] = useAsyncStorage<Date>('forecastUpdated', null)
  const [activeForecast, setActiveForecast] = useState<string>('day')
  useEffect(() => {
    if (!forecastUpdated || (forecastUpdated && new Date().getTime() - forecastUpdated.getTime() > 1000 * 60 * 30)) {
      loadForecast()
    }
  }, [props.latestUpdate, forecastUpdated])

  async function loadForecast() {
    const response = await getForecast()
    setForecast(response)
    setForecastUpdated(new Date())
  }

  const handleClick = () => {
    setActiveForecast(activeForecast === 'day' ? 'night' : 'day')
  }

  return (
    <TouchableOpacity
      onPress={handleClick}
      style={{
        ...styles.container,
        backgroundColor: activeForecast === 'day' ? 'transparent' : 'rgba(0,0,0,0.4)',
      }}
    >
      {forecast &&
        forecast.forecasts.forecast.map((f) => (
          <View key={f.$.date} style={styles.forecast}>
            <Text style={styles.smallText}>{getDayName(f.$.date)}</Text>

            <PhenomenonIcon
              phenomenon={f[activeForecast].phenomenon}
              isDay={activeForecast === 'day'}
              width={40}
              height={40}
              style={{
                marginTop: 5,
              }}
              animated={false}
              theme="meteocon"
            />
            <Text style={styles.smallText}>
              {f[activeForecast].tempmin} - {f[activeForecast].tempmax}°
            </Text>
          </View>
        ))}
      {!forecast && <ActivityIndicator size="small" color="#fff" />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: width - 20,
    height: 80,
    left: 0,
    display: 'flex',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecast: {
    width: width / 4 - 10,
    marginRight: 5,
    marginLeft: 5,
    display: 'flex',
    alignItems: 'center',
  },
  smallText: {
    fontFamily: 'Inter_200ExtraLight',
    color: '#fff',
    opacity: 1,
    fontSize: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
})
