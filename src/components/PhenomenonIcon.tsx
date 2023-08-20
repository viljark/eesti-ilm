import React, { FunctionComponent, memo, useMemo } from 'react'
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
import { Dimensions, StyleProp, StyleSheet, StyleSheetProperties, ViewStyle } from 'react-native'
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
import thunderLottie from '@bybas/weather-icons/production/fill/lottie/thunderstorms-overcast-rain.json'
import thunderStormLottie from '@bybas/weather-icons/production/fill/lottie/thunderstorms-extreme-rain.json'

// mapping https://www.ilmateenistus.ee/teenused/ilmainfo/eesti-vaatlusandmed-xml/
const clear = ['Clear']
const fewClouds = ['Few clouds', 'Variable clouds', 'Cloudy with clear spells']
const overcast = ['Overcast', 'Cloudy']

const snow = ['Light snow shower', 'Moderate snow shower', 'Heavy snow shower', 'Light snowfall', 'Moderate snowfall', 'Heavy snowfall', 'Blowing snow', 'Drifting snow']
const snowStorm = ['Snowstorm']
const lightRain = ['Light shower', 'Light rain']
const moderateRain = ['Moderate shower', 'Moderate rain']
const strongRain = ['Heavy shower', 'Heavy rain']
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
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
  isDay?: boolean
  animated?: boolean
}

const height = Dimensions.get('window').height - 121 //full height

const PhenomenonIcon_: FunctionComponent<PhenomenonIconProps> = (props: PhenomenonIconProps) => {
  const size = Math.max(100, Math.min(height * 0.3, 140))
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
  const sunTimes = getTimes(props.date, props.latitude, props.longitude)
  const isDay = _.isBoolean(props.isDay) ? props.isDay : props.date.getTime() < sunTimes.sunset.getTime() && props.date.getTime() > sunTimes.sunrise.getTime()
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
    if (sleet.includes(props.phenomenon)) return sleetLottie
    if (glaze.includes(props.phenomenon)) return glazeLottie
    if (fog.includes(props.phenomenon)) return fogLottie
    if (thunder.includes(props.phenomenon)) return thunderLottie
    if (thunderStorm.includes(props.phenomenon)) return thunderStormLottie
    if (hail.includes(props.phenomenon)) return hailLottie
  }, [isDay, props.phenomenon])

  if (props.animated) {
    return <LottieIcon style={lottieStyle} path={lottiePath} />
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
      {sleet.includes(props.phenomenon) && <Sleet {...iconProps} />}
      {glaze.includes(props.phenomenon) && <Glaze {...iconProps} />}
      {fog.includes(props.phenomenon) && <Fog {...iconProps} />}
      {thunder.includes(props.phenomenon) && <Thunder {...iconProps} />}
      {thunderStorm.includes(props.phenomenon) && <ThunderStorm {...iconProps} />}
      {hail.includes(props.phenomenon) && <Hail {...iconProps} />}
    </>
  )
}

export const PhenomenonIcon = memo(PhenomenonIcon_)

PhenomenonIcon_.defaultProps = {
  date: new Date(),
}

const LottieIcon = memo(LottieIcon_)
function LottieIcon_({ style, path }: { path: any; style: StyleProp<ViewStyle> }) {
  return <LottieView autoPlay style={style} source={path} hardwareAccelerationAndroid={true} />
}
