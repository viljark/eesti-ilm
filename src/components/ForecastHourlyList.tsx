import React, { useEffect, useState } from "react";
import { Time } from "../services";
import { ScrollView } from "react-native-gesture-handler";
import { getUserLocalDate } from "../utils/dateUtil";
import { StyleSheet, Text, View } from "react-native";
import { getDayName } from "../utils/formatters";
import { ForecastListItem } from "./ForecastListItem";
import { LocationData } from "expo-location";

interface ForecastHourlyListProps {
  graphWidth: number;
  graphRef: React.MutableRefObject<any>;
  detailedForecast: Time[];
  latestUpdate: Date;
  location: LocationData;
}

export function ForecastHourlyList({
  graphWidth,
  graphRef,
  detailedForecast,
  latestUpdate,
  location,
}: ForecastHourlyListProps) {
  const [stickyIndexes, setStickyIndexes] = useState<number[]>([]);

  useEffect(() => {
    const indexes = [];
    detailedForecast?.forEach((time, index) => {
      if (
        getUserLocalDate(time["@attributes"].from).getHours() === 0 ||
        index === 0
      ) {
        indexes.push(index + indexes.length);
      }
    });
    setStickyIndexes(indexes);
  }, [detailedForecast]);

  return (
    <ScrollView
      stickyHeaderIndices={stickyIndexes}
      onScroll={(e) => {
        const scrollAmount =
          (graphWidth / e.nativeEvent.contentSize.height) *
          e.nativeEvent.contentOffset.y;
        if (graphRef.current !== null) {
          graphRef.current.scrollTo({
            y: 0,
            x: scrollAmount,
          });
        }
      }}
      style={{
        display: "flex",
        flexGrow: 1,
        marginTop: 10,
      }}
    >
      {detailedForecast &&
        detailedForecast.map((time, index) => [
          (getUserLocalDate(time["@attributes"].from).getHours() === 0 ||
            index === 0) && (
            <View style={styles.dayNameWrapper}>
              <Text style={styles.dayName}>
                {getDayName(time["@attributes"].from)}
              </Text>
            </View>
          ),
          <ForecastListItem
            key={`${time["@attributes"].from}`}
            time={time}
            latestUpdate={latestUpdate}
            location={location}
          />,
        ])}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  dayNameWrapper: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 5,
  },
  dayName: {
    marginTop: 2,
    color: "#fff",
    borderRadius: 10,
    backgroundColor: "rgba(51, 51, 51, .7)",
    borderColor: "rgba(0,0,0,0.5)",
    borderWidth: 0.5,
    paddingHorizontal: 8,
    fontSize: 12,
    fontFamily: "Inter_300Light",
  },
});
