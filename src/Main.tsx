import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getObservations, Observations, Station } from './services';
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'
import { closestObservationField, getDistance } from './distance';
import { ErrorMessage } from './components/ErrorMessage';
import CloudSunIcon from './icons/CloudSunIcon';
import { getPhenomenonText } from './phenomenonUtil';
import Background from './components/Background';
import { PhenomenonIcon } from './components/PhenomenonIcon';


export default function Main() {

  const [observations, setObservations] = useState<Observations>(undefined);
  const [location, setLocation] = useState<Location.LocationData>(undefined);
  const [errorMessage, setErrormessage] = useState(undefined);
  const [closestStation, setClosestStation] = useState<Station>(undefined);

  useEffect(() => {
    fetchObservations();
  }, []);

  useEffect(() => {
    if (observations && location) {

      const stationsWithDistance = observations.station.map((s) => {
        const stationLatLon = [Number(s.latitude), Number(s.longitude)];
        const distance = getDistance([location.coords.latitude, location.coords.longitude], stationLatLon);
        return {
          ...s,
          distance,
        }
      });

      let closest: Station = undefined;
      stationsWithDistance.forEach((s) => {
        if (!closest) {
          closest = s
        } else if (closest.distance > s.distance) {
          closest = s;
        }
      });

      setClosestStation(closest);
      console.log(closest);
      setObservations({
        ...observations,
        station: stationsWithDistance.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  }, [location]);

  async function getLocationAsync() {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      setErrormessage('Permission to access location was denied');
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  }

  async function fetchObservations() {
    const response = await getObservations();
    setObservations(response.observations);
    getLocationAsync();
  }
  const phenomenon = observations ? getPhenomenonText(closestObservationField(observations.station, 'phenomenon') as string) : '';
  return (
      <Background location={location}>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {closestStation && (
          <View style={styles.container}>
            <Text style={{color: '#fff', opacity: 0.7}}>{phenomenon}</Text>
            <PhenomenonIcon phenomenon={closestObservationField(observations.station, 'phenomenon') as string} latitude={location.coords.latitude} longitude={location.coords.longitude}/>
            <View style={styles.temperatureWrap}>
              <Text style={styles.temperature}>{closestStation.airtemperature}  </Text>
              <Text style={styles.degree}>°C</Text>
            </View>

            <Text style={styles.location}>{closestStation.name}</Text>
            <Text>vesi {closestObservationField(observations.station, 'watertemperature')}°C</Text>
            <Text>{closestObservationField(observations.station, 'windspeed')}m/s</Text>
          </View>
        )}
      </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  temperatureWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  temperature: {
    color: '#fff',
    fontSize: 80,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 10,
  },
  degree: {
    paddingTop: 20,
    color: '#fff',
    fontSize: 30,
    marginLeft: -30,
  },
  location: {
    color: '#fff',
    opacity: 0.5,
    fontSize: 10,
  }

});
