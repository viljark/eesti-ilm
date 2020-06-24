import React, { useEffect, useState } from 'react';
import AppContainer from './AppContainer';
import * as Location from 'expo-location'
import { AsyncStorage, Dimensions } from 'react-native';
import * as Permissions from 'expo-permissions';
import { LocationContext } from './LocationContext';
import Background from './src/components/Background';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { ScrollView } from "react-native-gesture-handler";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height - 71; //full height

export default function App() {

  const [location, setLocation] = useState<Location.LocationData>(undefined);
  const [locationName, setLocationName] = useState<string>();
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
  }, []);

  async function getLocationAsync() {
    const storedLocation = await retrieveStoredLocation();
    if (storedLocation) {
      setLocation(storedLocation);
    }
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      // setErrormessage('Permission to access location was denied');
    }
    const location = await Location.getCurrentPositionAsync({});
    const geoLocation = await Location.reverseGeocodeAsync({
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    const locationName = geoLocation && geoLocation.length && (geoLocation[0].city || geoLocation[0].region);
    setLocationName(locationName);
    console.log('geoLocation', locationName);
    const newLocation = location && storedLocation && location.coords.longitude !== storedLocation.coords.longitude && location.coords.latitude !== storedLocation.coords.latitude;

    if ((location && !storedLocation) || newLocation) {
      setLocation(location);
      storeLocation(location)
    }
  }
  return <LocationContext.Provider value={{location, locationName}}>
    <Background location={location}>
      <ExpoLinearGradient
        style={{
          display: 'flex',
          height: height,
          position: 'absolute',
          bottom: 0,
          width,
        }}
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.5)',]}
        start={[0, 0]}
        locations={[1 / 100, 50 / 100, 1]}
      >
      </ExpoLinearGradient>
      <AppContainer/>
    </Background>

  </LocationContext.Provider>;
}

