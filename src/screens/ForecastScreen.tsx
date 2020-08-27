import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Keyboard,
} from "react-native";
import Autocomplete from "react-native-autocomplete-input";
import {
  getDetailedForecast,
  getLocationByName,
  getWarnings,
  Time,
  Warning,
} from "../services";
import _ from "lodash";
import { LocationContext } from "../../LocationContext";
import * as Location from "expo-location";
import { ScrollView } from "react-native-gesture-handler";
import { Alert } from "../components/Alert";
import { ForecastGraph } from "../components/ForecastGraph";
import { ForecastHourlyList } from "../components/ForecastHourlyList";

const width = Dimensions.get("window").width; //full width
const height = Dimensions.get("window").height - 71; //full height

export default function ForecastScreen() {
  const [query, setQuery] = useState(undefined);
  const [data, setData] = useState([]);

  const [coordinates, setCoordinates] = useState("");
  const { location, locationName, locationRegion } = useContext<{
    location: Location.LocationData;
    locationName: string;
    locationRegion: string;
  }>(LocationContext);
  const [latestUpdate, setLatestUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true);
  const [inInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [detailedForecast, setDetailedForecast] = useState<Time[]>(undefined);
  const [warning, setWarning] = useState<Warning>(null);

  async function getData(query) {
    if (!query) {
      setData([]);
      return;
    }
    const response = await getLocationByName(query);
    setData(response.data || []);
  }

  async function getInitialData(query) {
    if (!query) return;
    const response = await getLocationByName(query);
    const result = response.data;
    const coords = result && result.length && result[0].koordinaat;
    setCoordinates(coords);
  }

  async function fetchWarnings() {
    if (!locationRegion) return;
    const warnings = await getWarnings();
    const warning = warnings?.warnings?.warning?.find((warning) => {
      return (
        warning.area_eng.includes(locationRegion) ||
        warning.area_est.includes(locationRegion)
      );
    });
    setWarning(warning);
  }

  async function getForecast(coordinates) {
    setIsRefreshing(true);
    const response = await getDetailedForecast(coordinates);
    setDetailedForecast(response.forecast.tabular.time);
    setIsRefreshing(false);
  }

  const debounceGetData = useRef<Function>();

  useEffect(() => {
    debounceGetData.current = _.debounce(getData, 500);
  }, []);

  useEffect(() => {
    if (!coordinates) {
      return;
    }
    getForecast(coordinates);
  }, [coordinates]);

  useEffect(() => {
    debounceGetData.current(query);
  }, [query]);

  useEffect(() => {
    getInitialData(locationName);
  }, [locationName, latestUpdate]);

  useEffect(() => {
    fetchWarnings();
  }, [locationRegion, latestUpdate]);

  const minTemp =
    detailedForecast &&
    _.min(
      detailedForecast.map((f) => Number(f.temperature["@attributes"].value))
    );

  const graphRef = useRef(null);
  const graphWidth = width * 4.5;
  return (
    <ScrollView
      style={styles.scrollContainer}
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled={true}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setLatestUpdate(new Date());
          }}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.autocompleteContainer}>
          <Autocomplete
            hideResults={!inInputFocused}
            defaultValue={query === undefined ? locationName : query}
            data={data}
            onFocus={() => {
              setQuery("");
              setIsInputFocused(true);
            }}
            onBlur={() => {
              setIsInputFocused(false);
            }}
            style={styles.autocomplete}
            onChangeText={(text) => setQuery(text)}
            inputContainerStyle={{
              borderWidth: 0,
            }}
            listStyle={{
              margin: 0,
              marginTop: -3,
              paddingTop: 5,
              borderWidth: 0,
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setQuery(item.label);
                  setCoordinates(item.koordinaat);
                }}
                key={index}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 5,
                  borderTopColor: "#f1f1f1",
                  borderTopWidth: 1,
                }}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={styles.forecastHourlyListWrapper}>
          <Alert alert={warning} />
          <ForecastHourlyList
            graphWidth={graphWidth}
            graphRef={graphRef}
            detailedForecast={detailedForecast}
            latestUpdate={latestUpdate}
            location={location}
          />
        </View>

        <ForecastGraph
          detailedForecast={detailedForecast}
          graphRef={graphRef}
          graphWidth={graphWidth}
          minTemp={minTemp}
          location={location}
          style={{
            zIndex: 10,
            height: "35%",
          }}
        />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    flexGrow: 1,
    height,
  },
  container: {
    flex: 1,
    paddingTop: 30,
    height,
  },
  autocompleteContainer: {
    flex: 1,
    flexGrow: 1,
    left: 10,
    position: "absolute",
    right: 10,
    top: 13,
    zIndex: 2,
  },
  autocomplete: {
    paddingLeft: 10,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 3,
  },
  forecastHourlyListWrapper: {
    position: "relative",
    paddingTop: 20,
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: 10,
    flexBasis: "65%",
  },
});
