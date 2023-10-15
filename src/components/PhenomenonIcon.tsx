import React, { FunctionComponent, memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { getPosition, getTimes } from 'suncalc'
import ClearDay from '../icons/ClearDay'
import ClearNight from '../icons/ClearNight'
import Overcast from '../icons/Overcast'
import VariableCloudsDay from '../icons/VariableCloudsDay'
import VariableCloudsNight from '../icons/VariableCloudsNight'
import Snow from '../icons/Snow'
import LightRain from '../icons/LightRain'
import StrongRain from '../icons/StrongRain'
import Sleet from '../icons/Sleet'
import Glaze from '../icons/Glaze'
import Fog from '../icons/Fog'
import Thunder from '../icons/Thunder'
import ThunderStorm from '../icons/ThunderStorm'
import Hail from '../icons/Hail'
import { Dimensions, StyleProp, ViewStyle, View } from 'react-native'
import { Image } from 'expo-image'
import _ from 'lodash'
import SnowStorm from '../icons/SnowStorm'
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
const moderateRain = ['Moderate rain']
const moderateShower = ['Moderate shower']
const strongRain = ['Heavy rain']
const strongShower = ['Heavy shower']
const sleet = ['Light sleet', 'Moderate sleet']
const glaze = ['Glaze', 'Risk of glaze']
const fog = ['Mist', 'Fog']
const thunder = ['Thunder']
const thunderStorm = ['Thunderstorm']
const hail = ['Hail']

export const phenomenonMapping = {
  clear,
  fewClouds,
  overcast,
  snow,
  snowStorm,
  lightRain,
  moderateRain,
  strongRain,
  sleet,
  glaze,
  fog,
  thunder,
  thunderStorm,
  hail,
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
  theme?: 'meteocon' | 'default'
  onLoad?: () => void
}

const height = Dimensions.get('window').height - 121 //full height

const PhenomenonIcon_: FunctionComponent<PhenomenonIconProps> = (props: PhenomenonIconProps) => {
  const size = Math.max(100, Math.min(height * 0.3, 140))
  const date = props.date || new Date()
  const iconProps = {
    width: props.width || size,
    height: props.height || size,
    fill: '#fff',
    style: props.style || {
      opacity: 1,
      marginTop: 10,
      marginBottom: 10,
    },
  }
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
    if (clear.includes(props.phenomenon)) return isDay ? clearDayLottie : clearNightLottie
    if (fewClouds.includes(props.phenomenon)) return isDay ? fewCloudsDayLottie : fewCloudsNightLottie
    if (overcast.includes(props.phenomenon)) return overcastLottie
    if (snow.includes(props.phenomenon)) return snowLottie
    if (snowStorm.includes(props.phenomenon)) return snowstormLottie
    if (lightRain.includes(props.phenomenon)) return lightRainLottie
    if (moderateRain.includes(props.phenomenon)) return moderateRainLottie
    if (strongRain.includes(props.phenomenon)) return strongRainLottie
    if (lightShower.includes(props.phenomenon)) return isDay ? lightShowerDayLottie : lightShowerNightLottie
    if (moderateShower.includes(props.phenomenon)) return isDay ? moderateShowerDayLottie : moderateShowerNightLottie
    if (strongShower.includes(props.phenomenon)) return isDay ? strongShowerDayLottie : strongShowerNightLottie
    if (sleet.includes(props.phenomenon)) return sleetLottie
    if (glaze.includes(props.phenomenon)) return glazeLottie
    if (fog.includes(props.phenomenon)) return fogLottie
    if (thunder.includes(props.phenomenon)) return thunderLottie
    if (thunderStorm.includes(props.phenomenon)) return thunderStormLottie
    if (hail.includes(props.phenomenon)) return hailLottie
  }, [isDay, props.phenomenon])

  const meteoconIcon = useMemo(() => {
    if (clear.includes(props.phenomenon)) return isDay ? clearDayMeteocon : clearNightMeteocon
    if (fewClouds.includes(props.phenomenon)) return isDay ? fewCloudsDayMeteocon : fewCloudsNightMeteocon
    if (overcast.includes(props.phenomenon)) return overcastMeteocon
    if (snow.includes(props.phenomenon)) return snowMeteocon
    if (snowStorm.includes(props.phenomenon)) return snowstormMeteocon
    if (lightRain.includes(props.phenomenon)) return lightRainMeteocon
    if (moderateRain.includes(props.phenomenon)) return moderateRainMeteocon
    if (strongRain.includes(props.phenomenon)) return strongRainMeteocon
    if (lightShower.includes(props.phenomenon)) return isDay ? lightShowerDayMeteocon : lightShowerNightMeteocon
    if (moderateShower.includes(props.phenomenon)) return isDay ? moderateShowerDayMeteocon : moderateShowerNightMeteocon
    if (strongShower.includes(props.phenomenon)) return isDay ? strongShowerDayMeteocon : strongShowerNightMeteocon
    if (sleet.includes(props.phenomenon)) return sleetMeteocon
    if (glaze.includes(props.phenomenon)) return glazeMeteocon
    if (fog.includes(props.phenomenon)) return fogMeteocon
    if (thunder.includes(props.phenomenon)) return thunderMeteocon
    if (thunderStorm.includes(props.phenomenon)) return thunderStormMeteocon
    if (hail.includes(props.phenomenon)) return hailMeteocon
  }, [isDay, props.phenomenon])
  const [assets] = useDynamicAssets(meteoconIcon || clearDayMeteocon)
  if (props.animated) {
    return <LottieIcon style={lottieStyle} path={lottiePath} />
  }
  const w = props.width || size
  const h = props.height || size
  const wOffset = w / 3.4
  const hOffset = h / 3.4
  if (props.theme === 'meteocon') {
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

  return (
    <>
      {clear.includes(props.phenomenon) && (isDay ? <ClearDay {...iconProps} /> : <ClearNight {...iconProps} />)}
      {fewClouds.includes(props.phenomenon) && (isDay ? <VariableCloudsDay {...iconProps} /> : <VariableCloudsNight {...iconProps} />)}
      {overcast.includes(props.phenomenon) && <Overcast {...iconProps} />}
      {snow.includes(props.phenomenon) && <Snow {...iconProps} />}
      {snowStorm.includes(props.phenomenon) && <SnowStorm {...iconProps} />}
      {lightRain.includes(props.phenomenon) && <LightRain {...iconProps} />}
      {moderateRain.includes(props.phenomenon) && <StrongRain {...iconProps} />}
      {strongRain.includes(props.phenomenon) && <StrongRain {...iconProps} />}
      {lightShower.includes(props.phenomenon) && <LightRain {...iconProps} />}
      {moderateShower.includes(props.phenomenon) && <StrongRain {...iconProps} />}
      {strongShower.includes(props.phenomenon) && <StrongRain {...iconProps} />}
      {sleet.includes(props.phenomenon) && <Sleet {...iconProps} />}
      {glaze.includes(props.phenomenon) && <Glaze {...iconProps} />}
      {fog.includes(props.phenomenon) && <Fog {...iconProps} />}
      {thunder.includes(props.phenomenon) && <Thunder {...iconProps} />}
      {thunderStorm.includes(props.phenomenon) && <ThunderStorm {...iconProps} />}
      {hail.includes(props.phenomenon) && <Hail {...iconProps} />}
    </>
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
