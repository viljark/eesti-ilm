import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, Text, Dimensions, useWindowDimensions, TouchableOpacity } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useRoute } from '@react-navigation/native'
import { Forecast, Observations, Time } from '../services'
import { getDayName } from '../utils/formatters'
import useAsyncStorage from '../utils/useAsyncStorage'
import * as Location from 'expo-location'
import { LocationContext } from '../../LocationContext'
import { ForecastGraph } from '../components/ForecastGraph'
import _ from 'lodash'
import { isSameDay } from 'date-fns'
import { getUserLocalDate } from '../utils/dateUtil'
import ForecastMap from '../components/ForecastMap'
import { ScrollView } from 'react-native-gesture-handler'
import Animated, { useAnimatedRef, useAnimatedStyle, useEvent, useHandler, useSharedValue } from 'react-native-reanimated'
import Background from '../components/Background'
import { PhenomenonIcon } from '../components/PhenomenonIcon'
import { commonStyles } from '../utils/styles'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)
export const DayForecastScreen = () => {
  const route = useRoute<any>()
  const [detailedForecast, setDetailedForecast] = useAsyncStorage<Time[]>('detailedForecast')
  const { width } = useWindowDimensions()
  const forecasts: Forecast[] = route.params.forecast
  const minTemp = detailedForecast && _.min(detailedForecast.map((f) => Number(f.temperature['@attributes'].value)))
  const [allObservations] = useAsyncStorage<Observations>('allObservations')
  const scrollOffset = useSharedValue(route.params.index)
  const { location, locationName, locationRegion } =
    useContext<{
      location: Location.LocationObject
      locationName: string
      locationRegion: string
    }>(LocationContext)
  const graphRef = useAnimatedRef()

  const [visiblePages, setVisiblePages] = useState<number[]>([route.params.index])

  useEffect(() => {
    const order = []
    const index = route.params.index
    for (let i = index + 1; i < 4; i++) {
      order.push(i)
    }
    for (let i = index - 1; i > -1; i--) {
      order.push(i)
    }

    order.forEach((order, index) => {
      setTimeout(() => {
        setVisiblePages((pages) => [...pages, order])
      }, (index + 1) * 250)
    })
  }, [])

  const getForecastForDay = useCallback(
    (day: any) => {
      return detailedForecast?.filter((f) => isSameDay(day, getUserLocalDate(f['@attributes'].from))) || []
    },
    [detailedForecast]
  )

  const forecastMapPerDay = useMemo(() => {
    const result: Record<any, Time[]> = {}
    forecasts.forEach((f) => {
      result[f.$.date] = getForecastForDay(getUserLocalDate(f.$.date))
    })

    return result
  }, [getForecastForDay, forecasts])

  const graphWidth = width * 3
  const graphSection = graphWidth / 24

  const DOT_SIZE = 8
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: (DOT_SIZE + 2 * (DOT_SIZE - 2)) * scrollOffset.value }],
    }
  }, [scrollOffset])

  const pageScrollHandler = usePageScrollHandler(
    {
      onPageScroll: (e) => {
        'worklet'
        scrollOffset.value = e.offset + e.position
      },
    },
    []
  )

  return (
    <Background location={location}>
      <View style={{ flex: 1 }}>
        <View style={{ width: '100%', height: DOT_SIZE, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', position: 'absolute', top: 15, zIndex: 2 }}>
          <View style={{ flexDirection: 'row' }}>
            <Animated.View
              style={[
                indicatorStyle,
                {
                  position: 'absolute',
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  backgroundColor: '#fff',
                  borderWidth: 0.5,
                  borderColor: '#fff',
                  borderRadius: DOT_SIZE * 2,
                  marginHorizontal: DOT_SIZE - 2,
                },
              ]}
            />
            {forecasts.map((forecast, i) => (
              <View
                key={forecast.$.date}
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderWidth: 0.5,
                  borderColor: '#fff',
                  borderRadius: DOT_SIZE * 2,
                  marginHorizontal: DOT_SIZE - 2,
                }}
              />
            ))}
          </View>
        </View>
        <AnimatedPagerView style={styles.pagerView} initialPage={route.params.index} onPageScroll={pageScrollHandler}>
          {forecasts.map((forecast, i) => {
            if (!visiblePages.includes(i)) {
              return <View key={i} />
            }
            return (
              <ScrollView key={i} contentContainerStyle={{ paddingTop: 15, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                <Text allowFontScaling={false} style={styles.heading}>
                  {getDayName(forecast.$.date)}
                </Text>

                {forecastMapPerDay[forecast.$.date]?.length > 0 && (
                  <ForecastGraph
                    detailedForecast={forecastMapPerDay[forecast.$.date]}
                    graphRef={graphRef}
                    graphWidth={Math.max(graphSection * forecastMapPerDay[forecast.$.date]?.length, width - 40)}
                    minTemp={minTemp}
                    location={location}
                    hourInterval={1}
                    style={{
                      zIndex: 10,
                      height: 175,
                    }}
                  />
                )}
                <Text style={styles.heading2}>Öö</Text>
                <View style={styles.view1}>
                  <View style={styles.gradientWrapper1}>
                    <Background location={location}>
                      <Text />
                    </Background>
                  </View>
                  <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <View>
                      <View style={{ paddingVertical: 10, paddingLeft: 20, alignItems: 'center', flex: 0 }}>
                        <PhenomenonIcon animated height={90} width={90} phenomenon={forecast['night'].phenomenon} theme="meteocon" isDay={false} />
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={styles.temp}>{forecast['night'].tempmin} - </Text>
                          <Text style={styles.temp}>{forecast['night'].tempmax}°</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.view2}>
                      <Text style={styles.text}>{forecast['night'].text}</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    {i === 0 && <ForecastMap forecast={forecast} stations={allObservations?.station || []} mode={'night'} />}
                  </View>
                </View>
                <Text style={styles.heading2}>Päev</Text>
                <View style={styles.view1}>
                  <View style={[styles.gradientWrapper2, { height: 600 }]}>
                    <Background location={location}>
                      <Text />
                    </Background>
                  </View>

                  <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View>
                      <View style={{ paddingVertical: 10, paddingLeft: 20, alignItems: 'center', flex: 0 }}>
                        <PhenomenonIcon animated height={90} width={90} phenomenon={forecast['day'].phenomenon} theme="meteocon" isDay={true} />
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={styles.temp}>{forecast['day'].tempmin} - </Text>
                          <Text style={styles.temp}>{forecast['day'].tempmax}°</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.view2}>
                      <Text style={styles.text}>{forecast['day'].text}</Text>
                    </View>
                  </View>
                  <View>{i === 0 && <ForecastMap forecast={forecast} stations={allObservations?.station || []} mode={'day'} />}</View>
                </View>
              </ScrollView>
            )
          })}
        </AnimatedPagerView>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  view1: {
    borderRadius: 30,
    margin: 10,
    flexShrink: 0,
    flexGrow: 0,
    flex: 0,
    overflow: 'hidden',
    ...commonStyles.blockShadow,
  },
  gradientWrapper1: {
    position: 'absolute',
    left: 0,
    bottom: -0,
    transform: [
      {
        rotate: `${180}deg`,
      },
    ],
    height: 800,
    width: '100%',
  },
  gradientWrapper2: {
    position: 'absolute',
    left: 0,
    top: -200,
    transform: [
      {
        rotate: `${180}deg`,
      },
    ],
    height: 300,
    width: '100%',
  },
  view2: {
    padding: 20,
    flexShrink: 1,
    flexGrow: 0,
    flex: 0,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  heading: {
    fontFamily: 'Inter_200ExtraLight',
    color: '#ffffff',
    fontSize: 48,
    marginLeft: 10,
    marginTop: 20,
    marginBottom: 20,
    ...commonStyles.textShadow,
  },
  heading2: {
    fontFamily: 'Inter_200ExtraLight',
    color: '#ffffff',
    fontSize: 28,
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    ...commonStyles.textShadow,
  },
  temp: {
    fontFamily: 'Inter_200ExtraLight',
    color: '#ffffff',
    fontSize: 20,
  },
  text: {
    fontFamily: 'Inter_300Light',
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 18,
  },
})

function usePageScrollHandler(handlers: any, dependencies: any) {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies)
  const subscribeForEvents = ['onPageScroll']

  return useEvent(
    (event: any) => {
      'worklet'
      const { onPageScroll } = handlers
      if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
        onPageScroll(event, context)
      }
    },
    subscribeForEvents,
    doDependenciesDiffer
  )
}
