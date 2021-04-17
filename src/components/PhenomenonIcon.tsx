import React, { FunctionComponent } from 'react'
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
import { Dimensions, StyleProp, StyleSheetProperties, ViewStyle } from 'react-native'
import _ from 'lodash'

// mapping https://www.ilmateenistus.ee/teenused/ilmainfo/eesti-vaatlusandmed-xml/
const clear = ['Clear']
const fewClouds = ['Few clouds', 'Variable clouds']
const overcast = ['Cloudy with clear spells', 'Overcast', 'Cloudy']

const snow = ['Light snow shower', 'Moderate snow shower', 'Heavy snow shower', 'Light snowfall', 'Moderate snowfall', 'Heavy snowfall', 'Blowing snow', 'Drifting snow']
const lightRain = ['Light shower', 'Light rain']
const strongRain = ['Moderate shower', 'Heavy shower', 'Moderate rain', 'Heavy rain']
const sleet = ['Light sleet', 'Moderate sleet']
const glaze = ['Glaze']
const fog = ['Mist', 'Fog']
const thunder = ['Thunder']
const thunderStorm = ['Thunderstorm']
const hail = ['Hail']

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
}

const height = Dimensions.get('window').height - 121 //full height

export const PhenomenonIcon: FunctionComponent<PhenomenonIconProps> = (props: PhenomenonIconProps) => {
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

  return (
    <>
      {clear.includes(props.phenomenon) && (isDay ? <ClearDay {...iconProps} /> : <ClearNight {...iconProps} />)}
      {fewClouds.includes(props.phenomenon) && (isDay ? <VariableCloudsDay {...iconProps} /> : <VariableCloudsNight {...iconProps} />)}
      {overcast.includes(props.phenomenon) && <Overcast {...iconProps} />}
      {snow.includes(props.phenomenon) && <Snow {...iconProps} />}
      {lightRain.includes(props.phenomenon) && <LightRain {...iconProps} />}
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

PhenomenonIcon.defaultProps = {
  date: new Date(),
}
