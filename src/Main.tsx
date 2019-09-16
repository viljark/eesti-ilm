import React, { useEffect, useState } from 'react';
import { AppStateStatus, ScrollView, StyleSheet, Text, View, AsyncStorage, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { getObservations, Observations, Station } from './services';
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'
import { closestObservationField, closestStationWithObservationField, getDistance } from './distance';
import { ErrorMessage } from './components/ErrorMessage';
import { getPhenomenonText } from './phenomenonUtil';
import Background from './components/Background';
import { PhenomenonIcon } from './components/PhenomenonIcon';
import { AppState, Dimensions, RefreshControl } from 'react-native';
import { Radar } from './components/Radar';
import { Forecast } from './components/Forecast';
import { Linking } from 'expo';

function addZeroBefore(n) {
  return (n < 10 ? '0' : '') + n;
}

export default function Main() {
  const [allObservations, setAllObservations] = useState<Observations>(undefined);
  const [observations, setObservations] = useState<Observations>(undefined);
  const [location, setLocation] = useState<Location.LocationData>(undefined);
  const [errorMessage, setErrormessage] = useState(undefined);
  const [closestStation, setClosestStation] = useState<Station>(undefined);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [latestUpdate, setLatestUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true);
  const [showDataOrigin, setShowDataOrigin] = useState<boolean>(false);

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    }
  }, []);

  function handleAppStateChange(nextAppState: AppStateStatus) {
    setAppState((oldAppState) => {
      if (oldAppState.match(/inactive|background/) && nextAppState === 'active') {
        setLatestUpdate(new Date());
      }
      return nextAppState
    });
  }

  async function storeLocation (location: Location.LocationData){
    try {
      await AsyncStorage.setItem('location', JSON.stringify(location));
      console.log('saved location', JSON.stringify(location));
    } catch (error) {
      // Error saving data
    }
  }

  async function retrieveStoredLocation (): Promise<Location.LocationData> {
    try {
      const location = await AsyncStorage.getItem('location');
      if (location !== null) {
        console.log('retrieved location', location);
        return JSON.parse(location);
      }
    } catch (error) {
      // Error saving data
    }
    return null;
  }

  useEffect(() => {
    getLocationAsync();
    fetchObservations();
  }, [latestUpdate]);

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

      let closest: Station = closestStationWithObservationField(stationsWithDistance, 'airtemperature');

      setClosestStation(closest);

      setObservations({
        ...observations,
        station: stationsWithDistance.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  }, [location, allObservations]);

  async function getLocationAsync() {
    const storedLocation = await retrieveStoredLocation();
    if (storedLocation) {
      setLocation(storedLocation);
    }
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      setErrormessage('Permission to access location was denied');
    }
    const location = await Location.getCurrentPositionAsync({});
    const newLocation = location && storedLocation && location.coords.longitude !== storedLocation.coords.longitude && location.coords.latitude !== storedLocation.coords.latitude;

    if ((location && !storedLocation) || newLocation) {
      setLocation(location);
      storeLocation(location)
    }
  }

  async function fetchObservations() {
    setIsRefreshing(true);
    const response = await getObservations();
    setIsRefreshing(false);
    setAllObservations(response.observations);
  }

  const getWaterTempStation = () => closestStationWithObservationField(observations.station, 'watertemperature');
  const getPhenomenonStation = () => closestStationWithObservationField(observations.station, 'phenomenon');
  const getWindSpeedStation = () => closestStationWithObservationField(observations.station, 'windspeed');

  const phenomenon = observations ? getPhenomenonText(getPhenomenonStation().phenomenon) : '';
  return (
    <Background location={location}>
      <Text style={styles.ilmateenistus} onPress={() => {
        Linking.openURL('https://www.ilmateenistus.ee')
      }}>Riigi Ilmateenistus - www.ilmateenistus.ee</Text>
      <ScrollView style={styles.scrollContainer} refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setLatestUpdate(new Date());
          }}/>
      }>

        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {closestStation && (

            <View>
              <TouchableWithoutFeedback  onPress={() => {
                setShowDataOrigin(!showDataOrigin);
              }}>
              <View style={styles.container}>
                <PhenomenonIcon phenomenon={closestObservationField(observations.station, 'phenomenon') as string} latitude={location.coords.latitude} longitude={location.coords.longitude}/>
                <View style={styles.temperatureWrap}>
                  <Text style={styles.temperature}>{closestStation.airtemperature}</Text>
                  <Text style={styles.degree}>°C</Text>
                </View>
                <Text style={styles.phenomenon}>{phenomenon} {showDataOrigin && <Text style={styles.smallText}>({getPhenomenonStation().name})</Text>}</Text>
                <View style={styles.smallContainer}>
                  <Text style={styles.smallText}>{closestStation.name}, {addZeroBefore(latestUpdate.getHours())}:{addZeroBefore(latestUpdate.getMinutes())}</Text>
                  <Text style={styles.smallText}>
                    vesi {getWaterTempStation().watertemperature}°C {showDataOrigin && <Text style={styles.smallText}>({getWaterTempStation().name})</Text>}

                  </Text>
                  <Text style={styles.smallText}>tuul {getWindSpeedStation().windspeed}m/s {showDataOrigin && <Text style={styles.smallText}>({getWindSpeedStation().name})</Text>}</Text>
                </View>
              </View>
              </TouchableWithoutFeedback>
              <Forecast latestUpdate={latestUpdate}/>
            </View>

        )}
        <View style={{
          ...styles.container,
          marginTop: -40,
          height: width,
        }}>
          <Radar latestUpdate={latestUpdate}/>
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
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  degree: {
    paddingTop: 20,
    color: '#fff',
    fontSize: 30,
    marginLeft: 0,

  },
  smallContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  smallText: {
    color: '#fff',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  phenomenon: {
    color: '#fff',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    marginTop: -10,
    marginBottom: 30,
  },
  ilmateenistus: {
    position: 'absolute',
    bottom: 2,
    right: 5,
    color: '#fff',
    fontSize: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    opacity: 0.6,
    zIndex: 1,
  }

});
