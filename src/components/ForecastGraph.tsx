import { Time } from '../services'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { AreaChart, BarChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import { Text, View, ViewStyle } from 'react-native'
import { PhenomenonIcon } from './PhenomenonIcon'
import { getDayName } from '../utils/formatters'
import { LocationObject } from 'expo-location'
import { Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg'
import _ from 'lodash'

interface ForecastGraphProps {
  detailedForecast: Time[]
  graphRef: React.MutableRefObject<null>
  graphWidth: number
  minTemp
  location: LocationObject
  style?: ViewStyle
}

export function ForecastGraph({ detailedForecast, graphRef, graphWidth, minTemp, location, style }: ForecastGraphProps) {
  const [iconLocation, setIconLocation] = useState<
    Array<{
      index: number
      locationX: number
      locationY: number
    }>
  >([])

  const Decorator = (props?: any) => {
    const decoratorLocations = []
    const decorators = props.data.map((value, index) => {
      decoratorLocations.push({
        index,
        locationX: props.x(index),
        locationY: props.y(value),
      })
      return null
    })

    if (!_.isEqual(decoratorLocations, iconLocation)) {
      setIconLocation(decoratorLocations)
    }
    return decorators
  }
  return (
    <>
      {detailedForecast && (
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          shouldActivateOnStart={true}
          ref={graphRef}
          style={{
            display: 'flex',
            position: 'relative',
            ...style,
          }}
        >
          <AreaChart
            style={{ height: '100%', width: graphWidth, paddingBottom: 20 }}
            data={detailedForecast.map((f) => Number(f.temperature['@attributes'].value))}
            contentInset={{ top: 30, bottom: 5 }}
            curve={shape.curveNatural}
            svg={{ fill: 'url(#gradient)' }}
            start={minTemp - 0.5}
            yMin={minTemp - 2}
          >
            <Decorator />
            <Gradient />
            <Line />
          </AreaChart>
          {iconLocation.map((icon, i) => (
            <View
              key={i + 200}
              style={{
                position: 'absolute',
                left: icon.locationX,
                bottom: 0,
                display: 'flex',
                height: '100%',
              }}
            >
              {detailedForecast[i] && !!detailedForecast[i].phenomen['@attributes'].en && (
                <PhenomenonIcon
                  latitude={location.coords.latitude}
                  longitude={location.coords.longitude}
                  key={i}
                  width={30}
                  height={30}
                  style={{
                    marginLeft: 0,
                    position: 'absolute',
                    bottom: 30,
                  }}
                  date={new Date(detailedForecast[i]['@attributes'].from + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`)}
                  phenomenon={detailedForecast[i].phenomen['@attributes'].en}
                />
              )}
              {detailedForecast[i] &&
                !!detailedForecast[i]['@attributes'].from &&
                new Date(detailedForecast[i]['@attributes'].from + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`).getHours() === 0 && (
                  <>
                    <Text
                      key={i + 100}
                      style={{
                        position: 'absolute',
                        top: 0,
                        height: 20,
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginLeft: -2,
                        fontSize: 12,
                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 5,
                      }}
                    >
                      {getDayName(detailedForecast[i]['@attributes'].from)}
                    </Text>
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        width: 0.5,
                        height: '90%',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      }}
                    />
                  </>
                )}
              {detailedForecast[i] && !!detailedForecast[i]['@attributes'].from && i % 2 === 0 && (
                <Text
                  key={i + 100}
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    width: 35,
                    color: '#fff',
                    fontSize: 10,
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 5,
                    fontFamily: 'Inter_700Bold',
                  }}
                >
                  {new Date(detailedForecast[i]['@attributes'].from + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`).getHours()}
                  :00
                </Text>
              )}
            </View>
          ))}
          <BarChart
            style={{
              height: 100,
              width: graphWidth,
              zIndex: 1,
              position: 'absolute',
              left: 0,
              bottom: 20,
            }}
            data={detailedForecast.map((f) => Number(f.precipitation['@attributes'].value))}
            contentInset={{ top: 5 }}
            yMax={7.6} // heavy rain
            yMin={0}
            svg={{ fill: '#204bff' }}
          >
            <PrecipitationDecorator />
          </BarChart>

          {iconLocation.map(
            (icon, i) =>
              detailedForecast[i] &&
              !!detailedForecast[i].temperature['@attributes'].value &&
              i % 2 === 0 && (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    top: icon.locationY - 25,
                    left: icon.locationX,
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 14,
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 5,
                      fontFamily: 'Inter_700Bold',
                    }}
                  >
                    {Number(detailedForecast[i].temperature['@attributes'].value).toFixed(0)}
                  </Text>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 10,
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 5,
                      fontFamily: 'Inter_300Light',
                    }}
                  >
                    ℃
                  </Text>
                </View>
              )
          )}
        </ScrollView>
      )}
    </>
  )
}

const PrecipitationDecorator = (props?: any) => {
  const decorators = props.data.map((value, index) => {
    return value === 0 ? null : (
      <G key={index}>
        <SvgText fill="#fff" fontSize="6" x={props.x(index) + 5} y={props.y(value) - 1} textAnchor="middle">
          {value} mm
        </SvgText>
      </G>
    )
  })

  return decorators
}

const Gradient = (props?: any) => (
  <Defs key={props.index}>
    <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
      <Stop offset={'100%'} stopColor={'#325571'} stopOpacity={0} />
      <Stop offset={'50%'} stopColor={'#12d8fa'} stopOpacity={0.5} />
      <Stop offset={'0%'} stopColor={'#a6ffcb'} stopOpacity={1} />
    </LinearGradient>
  </Defs>
)
const Line = (props?: any) => <Path key={'line'} d={props.line} stroke={'#a6ffcb'} fill={'none'} />
