import React, { useEffect, useState } from "react";
import AppContainer from "./AppContainer";
import * as Location from "expo-location";
import {
  AppState,
  AppStateStatus,
  AsyncStorage,
  Dimensions,
  Text,
} from "react-native";
import * as Permissions from "expo-permissions";
import { LocationContext } from "./LocationContext";
import Background from "./src/components/Background";
import {
  useFonts,
  Inter_700Bold,
  Inter_300Light,
  Inter_200ExtraLight,
} from "@expo-google-fonts/inter";

export default function App() {
  const [location, setLocation] = useState<Location.LocationData>(undefined);
  const [locationName, setLocationName] = useState<string>();
  const [locationRegion, setLocationRegion] = useState<string>();
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);
  let [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_200ExtraLight,
    Inter_700Bold,
  });

  function handleAppStateChange(nextAppState: AppStateStatus) {
    setAppState((oldAppState) => {
      if (
        oldAppState.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        getLocationAsync();
      }
      return nextAppState;
    });
  }
  async function storeLocation(location: Location.LocationData) {
    try {
      await AsyncStorage.setItem("location", JSON.stringify(location));
      console.log("saved location", JSON.stringify(location));
    } catch (error) {
      // Error saving data
    }
  }

  async function retrieveStoredLocation(): Promise<Location.LocationData> {
    try {
      const location = await AsyncStorage.getItem("location");
      if (location !== null) {
        console.log("retrieved location", location);
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
    if (status !== "granted") {
      // setErrormessage('Permission to access location was denied');
    }
    const location = await Location.getCurrentPositionAsync({});
    const geoLocation = await Location.reverseGeocodeAsync({
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    const locationName =
      geoLocation &&
      geoLocation.length &&
      (geoLocation[0].city || geoLocation[0].region);
    const locationRegion =
      geoLocation && geoLocation.length && geoLocation[0].region;
    setLocationName(locationName);
    setLocationRegion(locationRegion);
    console.log("geoLocation", locationName);
    const newLocation =
      location &&
      storedLocation &&
      location.coords.longitude !== storedLocation.coords.longitude &&
      location.coords.latitude !== storedLocation.coords.latitude;

    if ((location && !storedLocation) || newLocation) {
      setLocation(location);
      storeLocation(location);
    }
  }
  return (
    <LocationContext.Provider
      value={{ location, locationName, locationRegion }}
    >
      <Background location={location}>
        <AppContainer />
      </Background>
    </LocationContext.Provider>
  );
}
