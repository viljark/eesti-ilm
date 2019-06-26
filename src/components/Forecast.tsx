import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ForecastResponse, getForecast } from '../services';
import { PhenomenonIcon } from './PhenomenonIcon';

const width = Dimensions.get('window').width; //full width
const monthNames = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];

export function Forecast(props: { latestUpdate: Date }) {

  const [forecast, setForecast] = useState<ForecastResponse>();
  const [activeForecast, setActiveForecast] = useState<string>('day');

  useEffect(() => {
    loadForecast();
  }, [props.latestUpdate]);

  async function loadForecast() {
    const response = await getForecast();
    setForecast(response);
  }

  function formatDate(input: string) {
    const date = new Date(input);
    return date.getDate() + '. ' + (monthNames[date.getMonth()]);
  }

  const handleClick = () => {
    setActiveForecast(activeForecast === 'day' ? 'night' : 'day');
  };

  return (
    <TouchableOpacity onPress={handleClick} style={{
      ...styles.container,
      backgroundColor: activeForecast === 'day' ? 'transparent' : 'rgba(0,0,0,0.4)'
    }}>
        {forecast && forecast.forecasts.forecast.map((f) => (
          <View key={f.$.date} style={styles.forecast}>
            <Text style={styles.smallText}>{formatDate(f.$.date)}</Text>
            <PhenomenonIcon phenomenon={f[activeForecast].phenomenon} isDay={activeForecast === 'day'} width={30} height={30} style={{
              marginTop: 0,
              marginBottom: 0,
            }}/>
            <Text style={styles.smallText}>{f[activeForecast].tempmin} - {f[activeForecast].tempmax}°C</Text>
          </View>

        ))}
        {!forecast && (
          <ActivityIndicator size="small" color="#fff"/>
        )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width,
    height: 60,
    position: 'absolute',
    bottom: 95,
    left: 0,
    display: 'flex',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  forecast: {
    width: (width / 4) - 10,
    marginRight: 5,
    marginLeft: 5,
    display: 'flex',
    alignItems: 'center',
  },
  smallText: {
    color: '#fff',
    opacity: 1,
    fontSize: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  }
});
