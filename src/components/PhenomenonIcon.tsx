import React from 'react';
import { getPosition, getTimes } from 'suncalc';
import ClearDay from '../icons/ClearDay';
import ClearNight from '../icons/ClearNight';
import Overcast from '../icons/Overcast';
import VariableCloudsDay from '../icons/VariableCloudsDay';
import VariableCloudsNight from '../icons/VariableCloudsNight';
import Snow from '../icons/Snow';
import LightRain from '../icons/LightRain';
import StrongRain from '../icons/StrongRain';
import Sleet from '../icons/Sleet';
import Glaze from '../icons/Glaze';
import Fog from '../icons/Fog';
import Thunder from '../icons/Thunder';
import ThunderStorm from '../icons/ThunderStorm';
import Hail from '../icons/Hail';

// mapping https://www.ilmateenistus.ee/teenused/ilmainfo/eesti-vaatlusandmed-xml/
const clear = ['Clear'];
const fewClouds = ['Few clouds', 'Variable clouds'];
const overcast = ['Cloudy with clear spells', 'Overcast'];

const snow = ['Light snow shower', 'Moderate snow shower', 'Heavy snow shower', 'Light snowfall', 'Moderate snowfall', 'Heavy snowfall', 'Blowing snow', 'Drifting snow'];
const lightRain = ['Light shower', 'Light rain'];
const strongRain = ['Moderate shower', 'Heavy shower', 'Moderate rain', 'Heavy rain'];
const sleet = ['Light sleet', 'Moderate sleet'];
const glaze = ['Glaze'];
const fog = ['Mist', 'Fog'];
const thunder = ['Thunder'];
const thunderStorm = ['Thunderstorm'];
const hail = ['Hail'];

export function PhenomenonIcon(props: {phenomenon: string, latitude: number, longitude: number}) {
  const iconProps = {
    width: 200,
    height: 200,
    fill: '#fff',
    style: {
      opacity: 0.8,
    }
  };

  const sunTimes = getTimes(new Date(), props.latitude, props.longitude);
  const isDay = new Date().getTime() < sunTimes.sunset.getTime();

  return (
    <>
      {clear.includes(props.phenomenon) && (
        isDay ? <ClearDay {...iconProps}/> : <ClearNight {...iconProps}/>
      )}
      {fewClouds.includes(props.phenomenon) && (
        isDay ? <VariableCloudsDay {...iconProps}/> : <VariableCloudsNight {...iconProps}/>
      )}
      {overcast.includes(props.phenomenon) && (
        <Overcast {...iconProps}/>
      )}
      {snow.includes(props.phenomenon) && (
        <Snow {...iconProps}/>
      )}
      {lightRain.includes(props.phenomenon) && (
        <LightRain {...iconProps}/>
      )}
      {strongRain.includes(props.phenomenon) && (
        <StrongRain {...iconProps}/>
      )}
      {sleet.includes(props.phenomenon) && (
        <Sleet {...iconProps}/>
      )}
      {glaze.includes(props.phenomenon) && (
        <Glaze {...iconProps}/>
      )}
      {fog.includes(props.phenomenon) && (
        <Fog {...iconProps}/>
      )}
      {thunder.includes(props.phenomenon) && (
        <Thunder {...iconProps}/>
      )}
      {thunderStorm.includes(props.phenomenon) && (
        <ThunderStorm {...iconProps}/>
      )}
      {hail.includes(props.phenomenon) && (
        <Hail {...iconProps}/>
      )}

    </>
  );
}
