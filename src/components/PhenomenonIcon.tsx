import React, { FunctionComponent, memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { getTimes } from 'suncalc'
import { Dimensions, StyleProp, ViewStyle, View } from 'react-native'
import { Image } from 'expo-image'
import _ from 'lodash'
import LottieView from 'lottie-react-native'
import overcastLottie from '@bybas/weather-icons/production/fill/lottie/overcast.json'
import hailLottie from '@bybas/weather-icons/production/fill/lottie/extreme-hail.json'
import clearDayLottie from '@bybas/weather-icons/production/fill/lottie/clear-day.json'
import clearNightLottie from '@bybas/weather-icons/production/fill/lottie/clear-night.json'
import fewCloudsDayLottie from '@bybas/weather-icons/production/fill/lottie/partly-cloudy-day.json'
import fewCloudsNightLottie from '@bybas/weather-icons/production/fill/lottie/partly-cloudy-night.json'
import lightRainLottie from '@bybas/weather-icons/production/fill/lottie/rain.json'
import moderateRainLottie from '@bybas/weather-icons/production/fill/lottie/overcast-rain.json'
import strongRainLottie from '@bybas/weather-icons/production/fill/lottie/extreme-rain.json'
import snowLottie from '@bybas/weather-icons/production/fill/lottie/overcast-snow.json'
import snowstormLottie from '@bybas/weather-icons/production/fill/lottie/wind-snow.json'
import sleetLottie from '@bybas/weather-icons/production/fill/lottie/sleet.json'
import glazeLottie from '@bybas/weather-icons/production/fill/lottie/snowflake.json'
import fogLottie from '@bybas/weather-icons/production/fill/lottie/fog.json'
import thunderLottie from '@bybas/weather-icons/production/fill/lottie/thunderstorms-overcast.json'
import thunderStormLottie from '@bybas/weather-icons/production/fill/lottie/thunderstorms-extreme-rain.json'
import lightShowerDayLottie from '@bybas/weather-icons/production/fill/lottie/partly-cloudy-day-rain.json'
import lightShowerNightLottie from '@bybas/weather-icons/production/fill/lottie/partly-cloudy-night-rain.json'
import moderateShowerDayLottie from '@bybas/weather-icons/production/fill/lottie/overcast-day-rain.json'
import moderateShowerNightLottie from '@bybas/weather-icons/production/fill/lottie/overcast-night-rain.json'
import strongShowerDayLottie from '@bybas/weather-icons/production/fill/lottie/extreme-day-rain.json'
import strongShowerNightLottie from '@bybas/weather-icons/production/fill/lottie/extreme-night-rain.json'

// @ts-ignore
import overcastMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast.png'
// @ts-ignore
import hailMeteocon from '@bybas/weather-icons/production/fill/png/256/extreme-hail.png'
// @ts-ignore
import clearDayMeteocon from '@bybas/weather-icons/production/fill/png/256/clear-day.png'
// @ts-ignore
import clearNightMeteocon from '@bybas/weather-icons/production/fill/png/256/clear-night.png'
// @ts-ignore
import fewCloudsDayMeteocon from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-day.png'
// @ts-ignore
import fewCloudsNightMeteocon from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-night.png'
// @ts-ignore
import lightRainMeteocon from '@bybas/weather-icons/production/fill/png/256/rain.png'
// @ts-ignore
import moderateRainMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast-rain.png'
// @ts-ignore
import strongRainMeteocon from '@bybas/weather-icons/production/fill/png/256/extreme-rain.png'
// @ts-ignore
import snowMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast-snow.png'
// @ts-ignore
import snowstormMeteocon from '@bybas/weather-icons/production/fill/png/256/wind-snow.png'
// @ts-ignore
import sleetMeteocon from '@bybas/weather-icons/production/fill/png/256/sleet.png'
// @ts-ignore
import glazeMeteocon from '@bybas/weather-icons/production/fill/png/256/snowflake.png'
// @ts-ignore
import fogMeteocon from '@bybas/weather-icons/production/fill/png/256/fog.png'
// @ts-ignore
import thunderMeteocon from '@bybas/weather-icons/production/fill/png/256/thunderstorms-overcast.png'
// @ts-ignore
import thunderStormMeteocon from '@bybas/weather-icons/production/fill/png/256/thunderstorms-extreme-rain.png'
// @ts-ignore
import lightShowerDayMeteocon from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-day-rain.png'
// @ts-ignore
import lightShowerNightMeteocon from '@bybas/weather-icons/production/fill/png/256/partly-cloudy-night-rain.png'
// @ts-ignore
import moderateShowerDayMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast-day-rain.png'
// @ts-ignore
import moderateShowerNightMeteocon from '@bybas/weather-icons/production/fill/png/256/overcast-night-rain.png'
// @ts-ignore
import strongShowerDayMeteocon from '@bybas/weather-icons/production/fill/png/256/extreme-day-rain.png'
// @ts-ignore
import strongShowerNightMeteocon from '@bybas/weather-icons/production/fill/png/256/extreme-night-rain.png'
// @ts-ignore
import notAvailableMeteocon from '@bybas/weather-icons/production/fill/png/256/not-available.png'

import { useAssets } from 'expo-asset'
import { useIsFocused } from '@react-navigation/native'
import { useAppState } from '../utils/useAppState'
import { useDynamicAssets } from '../utils/useDynamicAsset'

// mapping https://www.ilmateenistus.ee/teenused/ilmainfo/eesti-vaatlusandmed-xml/
const clear = ['Clear']
const fewClouds = ['Few clouds', 'Variable clouds', 'Cloudy with clear spells']
const overcast = ['Overcast', 'Cloudy']
const snow = ['Light snow shower', 'Moderate snow shower', 'Heavy snow shower', 'Light snowfall', 'Moderate snowfall', 'Heavy snowfall', 'Blowing snow', 'Drifting snow']
const snowStorm = ['Snowstorm']
const lightRain = ['Light rain']
const lightShower = ['Light shower']
const moderateRain = ['Moderate rain', 'Rain']
const moderateShower = ['Moderate shower']
const strongRain = ['Heavy rain']
const strongShower = ['Heavy shower']
const sleet = ['Light sleet', 'Moderate sleet']
const glaze = ['Glaze', 'Risk of glaze']
const fog = ['Mist', 'Fog']
const thunder = ['Thunder']
const thunderStorm = ['Thunderstorm']
const hail = ['Hail']

const mapping = {
  clear: ['Clear', 'Sunny', 'Clear skies'],
  fewClouds: ['Few clouds', 'Variable clouds', 'Cloudy with clear spells', 'Partly cloudy'],
  overcast: ['Overcast', 'Cloudy', 'Cloudy'],
  snow: [
    'Light snow shower',
    'Moderate snow shower',
    'Heavy snow shower',
    'Light snowfall',
    'Moderate snowfall',
    'Heavy snowfall',
    'Blowing snow',
    'Drifting snow',
    'Snow showers',
    'Moderate or heavy snow shower',
    'Moderate snow shower',
    'Heavy snow shower',
    'Light snow',
    'Moderate snow',
    'Heavy snow',
    'Snow',
  ],
  snowStorm: ['Snowstorm', 'Snowstorm'],
  lightRain: ['Light rain', 'Light rain shower', 'Light rain shower with thunderstorm in past hour', 'Light shower', 'Drizzle', 'Drizzle and rain', 'Light rain'],
  moderateRain: [
    'Moderate rain',
    'Rain',
    'Moderate rain shower',
    'Moderate shower',
    'Moderate rain',
    'Precipitation',
    'Nearby precipitation',
    'Distant precipitation',
    'Light or moderate precipitation',
    'Raining',
  ],
  strongRain: ['Heavy rain', 'Heavy rain shower', 'Heavy shower', 'Heavy rain', 'Heavy precipitation'],
  sleet: ['Light sleet', 'Moderate sleet', 'Light rain with snow', 'Rain and snow', 'Light sleet', 'Moderate sleet', 'Freezing drizzle', 'Freezing rain', 'Freezing Rain'],
  glaze: ['Glaze', 'Risk of glaze', 'Risk of glaze'],
  fog: ['Mist', 'Fog', 'Fog', 'Mist', 'Shallow fog'],
  thunder: ['Thunder', 'Thunder'],
  thunderStorm: ['Thunderstorm', 'Thunderstorm'],
  hail: ['Hail'],
  withoutPhenomena: ['Without phenomena'],
  diamondDust: ['Diamond dust'],
  funnelClouds: ['Funnel clouds'],
  duststorm: ['Duststorm'],
  sandstorm: ['Dust or sand storm within sight but not at station', 'Dust or sand raised by wind'],
  smoke: ['Smoke'],
  haze: ['Haze'],
  fogDepositingRime: ['Fog depositing rime'],
  lightning: ['Lightning'],
  thunderstorms: [
    'Thunderstorms',
    'Thunderstorm without precipitation',
    'Light thunderstorm with shower',
    'Light or moderate thunderstorm with hail',
    'Heavy thunderstorm with shower',
    'Heavy thunderstorm with hail',
    'Heavy thunderstorm with duststorm',
  ],
  snowdrift: ['Snowdrift', 'Drifting snow'],
  icePellets: ['Ice pellets', 'Ice crystals'],
  snowfall: ['Light snowfall', 'Moderate snowfall', 'Heavy snowfall'],
  snowGrains: ['Snow grains'],
  widespreadDust: ['Widespread dust in suspension not raised by wind'],
  wellDevelopedDust: ['Well developed dust or sand whirls'],
  squalls: ['Squalls'],
}

export const phenomenonMapping = {
  clear,
  fewClouds,
  overcast,
  snow,
  snowStorm,
  lightRain,
  lightShower,
  moderateRain,
  moderateShower,
  strongRain,
  strongShower,
  sleet,
  glaze,
  fog,
  thunder,
  thunderStorm,
  hail,
  ...mapping,
}

interface PhenomenonIconProps {
  date?: Date
  phenomenon: string
  latitude?: number
  longitude?: number
  width?: number
  height?: number
  style?: StyleProp<any>
  children?: React.ReactNode
  isDay?: boolean
  animated?: boolean
  theme: 'meteocon'
  onLoad?: () => void
}

const height = Dimensions.get('window').height - 121 //full height

const PhenomenonIcon_: FunctionComponent<PhenomenonIconProps> = (props: PhenomenonIconProps) => {
  const size = Math.max(100, Math.min(height * 0.3, 140))
  const date = props.date || new Date()
  const sunTimes = getTimes(date, props.latitude, props.longitude)
  const isDay = _.isBoolean(props.isDay) ? props.isDay : date.getTime() < sunTimes.sunset.getTime() && date.getTime() > sunTimes.sunrise.getTime()
  const lottieStyle = useMemo(
    () => [
      {
        width: props.width || size,
        height: props.height || size,
      },
      [
        props.style || {
          opacity: 1,
          marginTop: 10,
          marginBottom: 10,
        },
      ],
    ],
    [props.width, props.height, size, props.style]
  )

  const lottiePath = useMemo(() => {
    if (phenomenonMapping.clear.includes(props.phenomenon)) return isDay ? clearDayLottie : clearNightLottie
    if (phenomenonMapping.fewClouds.includes(props.phenomenon)) return isDay ? fewCloudsDayLottie : fewCloudsNightLottie
    if (phenomenonMapping.overcast.includes(props.phenomenon)) return overcastLottie
    if (phenomenonMapping.snow.includes(props.phenomenon)) return snowLottie
    if (phenomenonMapping.snowStorm.includes(props.phenomenon)) return snowstormLottie
    if (phenomenonMapping.lightRain.includes(props.phenomenon)) return lightRainLottie
    if (phenomenonMapping.moderateRain.includes(props.phenomenon)) return moderateRainLottie
    if (phenomenonMapping.strongRain.includes(props.phenomenon)) return strongRainLottie
    if (phenomenonMapping.lightShower.includes(props.phenomenon)) return isDay ? lightShowerDayLottie : lightShowerNightLottie
    if (phenomenonMapping.moderateShower.includes(props.phenomenon)) return isDay ? moderateShowerDayLottie : moderateShowerNightLottie
    if (phenomenonMapping.strongShower.includes(props.phenomenon)) return isDay ? strongShowerDayLottie : strongShowerNightLottie
    if (phenomenonMapping.sleet.includes(props.phenomenon)) return sleetLottie
    if (phenomenonMapping.glaze.includes(props.phenomenon)) return glazeLottie
    if (phenomenonMapping.fog.includes(props.phenomenon)) return fogLottie
    if (phenomenonMapping.thunder.includes(props.phenomenon)) return thunderLottie
    if (phenomenonMapping.thunderStorm.includes(props.phenomenon)) return thunderStormLottie
    if (phenomenonMapping.hail.includes(props.phenomenon)) return hailLottie
  }, [isDay, props.phenomenon])

  const meteoconIcon = useMemo(() => {
    if (phenomenonMapping.clear.includes(props.phenomenon)) return isDay ? clearDayMeteocon : clearNightMeteocon
    if (phenomenonMapping.fewClouds.includes(props.phenomenon)) return isDay ? fewCloudsDayMeteocon : fewCloudsNightMeteocon
    if (phenomenonMapping.overcast.includes(props.phenomenon)) return overcastMeteocon
    if (phenomenonMapping.snow.includes(props.phenomenon)) return snowMeteocon
    if (phenomenonMapping.snowStorm.includes(props.phenomenon)) return snowstormMeteocon
    if (phenomenonMapping.lightRain.includes(props.phenomenon)) return lightRainMeteocon
    if (phenomenonMapping.moderateRain.includes(props.phenomenon)) return moderateRainMeteocon
    if (phenomenonMapping.strongRain.includes(props.phenomenon)) return strongRainMeteocon
    if (phenomenonMapping.lightShower.includes(props.phenomenon)) return isDay ? lightShowerDayMeteocon : lightShowerNightMeteocon
    if (phenomenonMapping.moderateShower.includes(props.phenomenon)) return isDay ? moderateShowerDayMeteocon : moderateShowerNightMeteocon
    if (phenomenonMapping.strongShower.includes(props.phenomenon)) return isDay ? strongShowerDayMeteocon : strongShowerNightMeteocon
    if (phenomenonMapping.sleet.includes(props.phenomenon)) return sleetMeteocon
    if (phenomenonMapping.glaze.includes(props.phenomenon)) return glazeMeteocon
    if (phenomenonMapping.fog.includes(props.phenomenon)) return fogMeteocon
    if (phenomenonMapping.thunder.includes(props.phenomenon)) return thunderMeteocon
    if (phenomenonMapping.thunderStorm.includes(props.phenomenon)) return thunderStormMeteocon
    if (phenomenonMapping.hail.includes(props.phenomenon)) return hailMeteocon
    return notAvailableMeteocon
  }, [isDay, props.phenomenon])
  const [assets] = useDynamicAssets(meteoconIcon || clearDayMeteocon)

  if (props.animated) {
    return <LottieIcon style={lottieStyle} path={lottiePath} />
  }

  const w = props.width || size
  const h = props.height || size
  const wOffset = w / 3.4
  const hOffset = h / 3.4

  return (
    <View style={[props.style, { width: w, height: h }]}>
      {!!assets?.[0]?.localUri && (
        <Image
          onLoad={props.onLoad}
          key={meteoconIcon}
          source={{ uri: assets?.[0]?.localUri }}
          style={{
            position: 'absolute',
            left: -wOffset / 1.7,
            top: -hOffset,
            width: w + wOffset,
            height: h + hOffset,
          }}
        />
      )}
    </View>
  )
}

export const PhenomenonIcon = PhenomenonIcon_

export const LottieIcon = memo(LottieIcon_)
function LottieIcon_({ style, path }: { path: any; style: StyleProp<ViewStyle> }) {
  const ref = useRef<LottieView>(null)
  const isScreenFocused = useIsFocused()

  useEffect(() => {
    if (isScreenFocused) {
      ref.current?.play()
    } else {
      ref.current?.pause()
    }
  }, [ref.current, isScreenFocused])

  const play = useCallback(() => {
    ref.current?.play()
  }, [ref.current])

  const pause = useCallback(() => {
    ref.current?.pause()
  }, [ref.current])

  useAppState(play, pause)

  return <LottieView ref={ref} autoPlay={true} style={style} source={path} />
}
