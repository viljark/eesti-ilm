import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getObservations, Observations, Station } from './services';
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'
import { closestObservationField, getDistance } from './distance';
import { ErrorMessage } from './components/ErrorMessage';
import { getPhenomenonText } from './phenomenonUtil';
import Background from './components/Background';
import { PhenomenonIcon } from './components/PhenomenonIcon';
import { Dimensions } from "react-native";
import { Radar } from './components/Radar';



export default function Main() {

  const [allObservations, setAllObservations] = useState<Observations>(undefined);
  const [observations, setObservations] = useState<Observations>(undefined);
  const [location, setLocation] = useState<Location.LocationData>(undefined);
  const [errorMessage, setErrormessage] = useState(undefined);
  const [closestStation, setClosestStation] = useState<Station>(undefined);

  useEffect(() => {
    getLocationAsync();
    fetchObservations();
  }, []);

  useEffect(() => {
    if (allObservations && location) {

      const stationsWithDistance = allObservations.station.map((s) => {
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
  }, [location, allObservations]);

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
    setAllObservations(response.observations);
  }

  const phenomenon = observations ? getPhenomenonText(closestObservationField(observations.station, 'phenomenon') as string) : '';
  return (
      <Background location={location}>
        <ScrollView style={styles.scrollContainer}>

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          {closestStation && (
            <View style={styles.container}>
              <Text style={{color: '#fff', opacity: 0.7}}>{phenomenon}</Text>
              <PhenomenonIcon phenomenon={closestObservationField(observations.station, 'phenomenon') as string} latitude={location.coords.latitude} longitude={location.coords.longitude}/>
              <View style={styles.temperatureWrap}>
                <Text style={styles.temperature}>{closestStation.airtemperature}</Text>
                <Text style={styles.degree}>°C</Text>
              </View>

              <Text style={styles.smallText}>{closestStation.name}</Text>
              <Text style={styles.smallText}>vesi {closestObservationField(observations.station, 'watertemperature')}°C</Text>
              <Text style={styles.smallText}>tuul {closestObservationField(observations.station, 'windspeed')}m/s</Text>
            </View>
          )}
          <View style={{
            ...styles.container,
            marginTop: -40,
          }}>
            <Radar/>
          </View>
        </ScrollView>
      </Background>
  );
}

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    alignSelf: 'stretch',
  },
  container: {
    marginTop: 40,
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
    height: height,
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
    marginLeft: 0,

  },
  smallText: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 12,
  }

});
