import { Time } from '../services'
import React, { useMemo, useRef, useState } from 'react'
import { AreaChart, BarChart, LineChart, Grid } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import { Dimensions, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { PhenomenonIcon } from './PhenomenonIcon'
import { getDayName } from '../utils/formatters'
import { LocationObject } from 'expo-location'
import { Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg'
import _ from 'lodash'
import Background from './Background'
import Constants from 'expo-constants'
import { commonStyles } from '../utils/styles'
import { ScrollView } from 'react-native-gesture-handler'
import { Raindrop } from '../icons/Raindrop'
import { RaindropOutline } from '../icons/RaindropOutline'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

const dayLeftOffset = 8

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
  const dayRef = useRef<ScrollView>(null)
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

  const dayLocation =
    iconLocation &&
    detailedForecast &&
    iconLocation
      .map((l, i) => {
        if (new Date(detailedForecast[i]['@attributes'].from + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`).getHours() === 0) {
          return {
            name: getDayName(detailedForecast[i]['@attributes'].from),
            x: l.locationX,
          }
        }
        return null
      })
      .filter(Boolean)

  const scrollPos = useSharedValue(0)

  const staticDay1AnimatedStyle = useAnimatedStyle(() => {
    if (!dayLocation?.length) {
      return {}
    }
    return {
      display: scrollPos.value >= dayLocation[0].x - dayLeftOffset ? 'none' : 'flex',
      transform: [{ translateX: scrollPos.value > dayLocation[0].x - 100 ? -(scrollPos.value - dayLocation[0].x + 100) : 0 }],
    }
  }, [scrollPos, dayLocation])

  const staticDay2AnimatedStyle = useAnimatedStyle(() => {
    if (!dayLocation?.length) {
      return {}
    }
    return {
      display: scrollPos.value < dayLocation[0].x - dayLeftOffset || scrollPos.value >= dayLocation[1].x - dayLeftOffset ? 'none' : 'flex',
      transform: [{ translateX: scrollPos.value > dayLocation[1].x - 100 ? -(scrollPos.value - dayLocation[1].x + 100) : 0 }],
    }
  }, [scrollPos, dayLocation])

  const staticDay3AnimatedStyle = useAnimatedStyle(() => {
    if (!dayLocation?.length) {
      return {}
    }
    return {
      display: scrollPos.value < dayLocation[1].x - dayLeftOffset || scrollPos.value >= dayLocation[2].x - dayLeftOffset ? 'none' : 'flex',

      transform: [{ translateX: scrollPos.value > dayLocation[2].x - 100 ? -(scrollPos.value - dayLocation[2].x + 100) : 0 }],
    }
  }, [scrollPos, dayLocation])

  const staticDay4AnimatedStyle = useAnimatedStyle(() => {
    if (!dayLocation?.length) {
      return {}
    }
    return {
      display: scrollPos.value < dayLocation[2].x - dayLeftOffset || scrollPos.value >= dayLocation[3]?.x - dayLeftOffset ? 'none' : 'flex',
      transform: [{ translateX: scrollPos.value > dayLocation[3]?.x - 100 ? -(scrollPos.value - dayLocation[3]?.x + 100) : 0 }],
    }
  }, [scrollPos, dayLocation])

  const scrollingDay2AnimatedStyle = useAnimatedStyle(() => {
    if (!dayLocation?.length) {
      return {}
    }
    return {
      display: scrollPos.value > dayLocation[0].x - dayLeftOffset ? 'none' : 'flex',
    }
  }, [scrollPos, dayLocation])
  const scrollingDay3AnimatedStyle = useAnimatedStyle(() => {
    if (!dayLocation?.length) {
      return {}
    }
    return {
      display: scrollPos.value > dayLocation[1].x - dayLeftOffset ? 'none' : 'flex',
    }
  }, [scrollPos, dayLocation])

  const scrollingDay4AnimatedStyle = useAnimatedStyle(() => {
    if (!dayLocation?.length) {
      return {}
    }
    return {
      display: scrollPos.value > dayLocation[2].x - dayLeftOffset ? 'none' : 'flex',
    }
  }, [scrollPos, dayLocation])

  const scrollingDaysAnimatedStyles = useMemo(
    () => [scrollingDay2AnimatedStyle, scrollingDay3AnimatedStyle, scrollingDay4AnimatedStyle],
    [scrollingDay2AnimatedStyle, scrollingDay3AnimatedStyle, scrollingDay4AnimatedStyle]
  )

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
          {dayLocation?.length > 0 && (
            <View style={{ position: 'absolute', top: 4, height: 20, zIndex: 1 }}>
              <Animated.Text style={[staticDay1AnimatedStyle, styles.dayName]}>täna</Animated.Text>
              <Animated.Text style={[staticDay2AnimatedStyle, styles.dayName]}>{dayLocation[0]?.name}</Animated.Text>
              <Animated.Text style={[staticDay3AnimatedStyle, styles.dayName]}>{dayLocation[1]?.name}</Animated.Text>
              <Animated.Text style={[staticDay4AnimatedStyle, styles.dayName]}>{dayLocation[2]?.name}</Animated.Text>
            </View>
          )}
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
            persistentScrollbar={true}
            onScroll={(e) => {
              dayRef.current?.scrollTo({
                x: e.nativeEvent.contentOffset.x,
                y: e.nativeEvent.contentOffset.y,
                animated: false,
              })
              scrollPos.value = e.nativeEvent.contentOffset.x
            }}
            contentContainerStyle={{
              paddingTop: 25,
            }}
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
                style={{ height: 110, width: graphWidth, paddingBottom: 0, top: 60 }}
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
              {dayLocation?.map((dl, i) => (
                <>
                  <Animated.Text
                    key={i + 100}
                    style={[
                      scrollingDaysAnimatedStyles[i],
                      {
                        ...styles.dayName,
                        position: 'absolute',
                        left: dl.x,
                        top: 4,
                        marginLeft: 7,
                        flexGrow: 0,
                      },
                    ]}
                  >
                    {dl.name}
                  </Animated.Text>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: dl.x,
                      width: 2,
                      height: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  />
                </>
              ))}
              {iconLocation.map((icon, i) => (
                <View
                  key={i + 200}
                  style={{
                    position: 'absolute',
                    left: icon.locationX,
                    bottom: 0,
                    display: 'flex',
                    top: 25,
                    borderRightWidth: i % 2 !== 0 ? 0 : 0.5,

                    width: iconLocation[1].locationX - iconLocation[0].locationX,
                    // backgroundColor: i % 2 !== 0 || i % 3 !== 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderTopWidth: 0.5,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  {detailedForecast[i] && !!detailedForecast[i].phenomen['@attributes'].en && i % 2 === 0 && (
                    <PhenomenonIcon
                      latitude={location.coords.latitude}
                      longitude={location.coords.longitude}
                      key={i + detailedForecast[i].phenomen['@attributes'].en}
                      width={40}
                      height={40}
                      style={{
                        marginLeft: -19,
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
                          left: -10,
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
                        allowFontScaling={false}
                        style={{
                          fontSize: 7,
                          fontFamily: 'Inter_200Light',
                          color: '#fff',
                          bottom: 8,
                          lineHeight: 12,
                          position: 'absolute',
                          marginLeft: -6,
                          textAlign: 'center',
                          ...commonStyles.textShadow,
                        }}
                      >
                        {detailedForecast[i].precipitation['@attributes'].value}
                        {mmWithBreak}
                      </Text>
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
                        top: icon.locationY + 65,
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

const styles = StyleSheet.create({
  dayName: {
    color: '#000',
    marginLeft: 15,
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    paddingHorizontal: 8,
    paddingBottom: 1,
    borderRadius: 10,
    backgroundColor: 'rgb(255,255,255)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
})

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
