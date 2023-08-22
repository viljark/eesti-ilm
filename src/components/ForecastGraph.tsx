import { Time } from '../services'
import React, { useState } from 'react'
import { AreaChart, BarChart, LineChart, Grid } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import { Dimensions, Text, View, ViewStyle, Animated } from 'react-native'
import { PhenomenonIcon } from './PhenomenonIcon'
import { getDayName } from '../utils/formatters'
import { LocationObject } from 'expo-location'
import { Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg'
import _ from 'lodash'
import Background from './Background'
import Constants from 'expo-constants'
import { commonStyles } from '../utils/styles'
import { HorizontalScrollView } from './HorizontalScrollView'
import { ScrollView } from 'react-native-gesture-handler'
import { Raindrop } from '../icons/Raindrop'
import { RaindropOutline } from '../icons/RaindropOutline'

interface ForecastGraphProps {
  detailedForecast: Time[]
  graphRef: React.MutableRefObject<null>
  graphWidth: number
  minTemp
  location: LocationObject
  style?: ViewStyle
}

const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height - (Constants.statusBarHeight + 50) //full height
const mmWithBreak = '\nmm'
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

  const raindropHeight = 20
  return (
    <>
      {detailedForecast && (
        <View
          style={{
            marginTop: 10,
            marginBottom: 10,
            position: 'relative',
            overflow: 'hidden',
            marginHorizontal: 10,
            borderRadius: 30,
            ...style,
            ...commonStyles.blockShadow,
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
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

          <ScrollView
            ref={graphRef}
            horizontal={true}
            style={[
              {
                backgroundColor: '#rgba(0,0,0,0.5)',
                display: 'flex',
                position: 'relative',
              },
            ]}
          >
            <>
              <AreaChart
                style={{ height: 120, width: graphWidth, paddingBottom: 0, top: 70 }}
                data={detailedForecast.map((f) => Number(f.temperature['@attributes'].value))}
                contentInset={{ top: 30, bottom: 5, left: 20, right: 20 }}
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
                  {detailedForecast[i] && !!detailedForecast[i].phenomen['@attributes'].en && i % 2 === 0 && (
                    <PhenomenonIcon
                      latitude={location.coords.latitude}
                      longitude={location.coords.longitude}
                      key={i}
                      width={30}
                      height={30}
                      style={{
                        marginLeft: -14,
                        position: 'absolute',
                        top: 35,
                      }}
                      date={new Date(detailedForecast[i]['@attributes'].from + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`)}
                      phenomenon={detailedForecast[i].phenomen['@attributes'].en}
                      theme="meteocon"
                    />
                  )}
                  {detailedForecast[i] && Number(detailedForecast[i].precipitation['@attributes'].value) !== 0 && (
                    <>
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 18,
                          left: -8,
                          height: raindropHeight,
                          width: raindropHeight,
                        }}
                      >
                        <View
                          style={{
                            position: 'relative',
                            height: Math.min(raindropHeight, (Number(detailedForecast[i].precipitation['@attributes'].value) / 3) * raindropHeight),
                            overflow: 'hidden',
                            top: raindropHeight - Math.min(raindropHeight, (Number(detailedForecast[i].precipitation['@attributes'].value) / 3) * raindropHeight),
                          }}
                        >
                          <Raindrop width={raindropHeight} height={raindropHeight} style={{ position: 'absolute', bottom: 0 }} />
                        </View>
                        <RaindropOutline width={raindropHeight} height={raindropHeight} style={{ position: 'absolute' }} />
                      </View>
                      <Text
                        style={{
                          fontSize: 7,
                          fontFamily: 'Inter_200Light',
                          color: '#fff',
                          bottom: 8,
                          lineHeight: 12,
                          position: 'absolute',
                          marginLeft: -4,
                          textAlign: 'center',
                          ...commonStyles.textShadow,
                        }}
                      >
                        {detailedForecast[i].precipitation['@attributes'].value}
                        {mmWithBreak}
                      </Text>
                    </>
                  )}
                  {detailedForecast[i] &&
                    !!detailedForecast[i]['@attributes'].from &&
                    new Date(detailedForecast[i]['@attributes'].from + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`).getHours() === 0 && (
                      <>
                        <Text
                          key={i + 100}
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            height: 20,
                            left: 10,
                            color: 'rgba(255, 255, 255, 0.8)',
                            marginLeft: -2,
                            fontSize: 12,
                            fontFamily: 'Inter_200Light',
                            ...commonStyles.textShadow,
                          }}
                        >
                          {getDayName(detailedForecast[i]['@attributes'].from)}
                        </Text>
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            width: 2,
                            height: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          }}
                        />
                      </>
                    )}
                  {detailedForecast[i] && !!detailedForecast[i]['@attributes'].from && i % 2 === 0 && (
                    <Text
                      key={i + 100}
                      style={{
                        position: 'absolute',
                        top: 5,
                        left: -14,
                        width: 35,
                        color: '#fff',
                        fontSize: 12,
                        fontFamily: 'Inter_200Light',
                        ...commonStyles.textShadow,
                      }}
                    >
                      {new Date(detailedForecast[i]['@attributes'].from + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`).getHours() > 9
                        ? new Date(detailedForecast[i]['@attributes'].from + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`).getHours()
                        : '0' + new Date(detailedForecast[i]['@attributes'].from + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`).getHours()}
                      :00
                    </Text>
                  )}
                </View>
              ))}

              {iconLocation.map(
                (icon, i) =>
                  detailedForecast[i] &&
                  !!detailedForecast[i].temperature['@attributes'].value &&
                  i % 2 === 0 && (
                    <View
                      key={i}
                      style={{
                        position: 'absolute',
                        top: icon.locationY + 45,
                        left: icon.locationX + -6,
                        display: 'flex',
                        flexDirection: 'row',
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 12,
                          textShadowColor: 'rgba(0, 0, 0, 0.3)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 5,
                          fontFamily: 'Inter_200Light',
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
                        °
                      </Text>
                    </View>
                  )
              )}
            </>
          </ScrollView>
        </View>
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
      <Stop offset={'50%'} stopColor={'rgb(0,0,0)'} stopOpacity={0.2} />
      <Stop offset={'0%'} stopColor={'rgb(0,0,0)'} stopOpacity={0.3} />
    </LinearGradient>
  </Defs>
)
const Line = (props?: any) => <Path key={'line'} d={props.line} stroke={'#00b0ff'} strokeWidth={3} strokeOpacity={1} strokeLinecap={'round'} fill={'none'} />
