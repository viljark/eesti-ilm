import React from 'react';
import { getPosition } from 'suncalc';
import ClearDay from '../icons/ClearDay';
import ClearNight from '../icons/ClearNight';
import { StyleSheet, Text, View } from 'react-native';

export function PhenomenonIcon(props: {phenomenon: string, latitude: number, longitude: number}) {
  const iconProps = {
    width: 200,
    height: 200,
    fill: '#fff',
    style: {
      opacity: 0.8,
    }
  };

  const sunPosition = getPosition(new Date(), props.latitude, props.longitude);
  const isDay = sunPosition.azimuth >= 0;

  return (
    <>
      {props.phenomenon === 'Clear' && (
        isDay ? <ClearDay {...iconProps}/> : <ClearNight {...iconProps}/>
      )}

    </>
  );
}