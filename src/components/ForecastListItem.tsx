import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Time } from "../services";
import { PhenomenonIcon } from "./PhenomenonIcon";
import { formatHours } from "../utils/formatters";
import { Location } from "expo";
import { RaindropOutline } from "../icons/RaindropOutline";
import { Raindrop } from "../icons/Raindrop";
import ArrowUp from "../icons/ArrowUp";

const width = Dimensions.get("window").width; //full width

export function ForecastListItem({
  time,
  location,
}: {
  latestUpdate: Date;
  time: Time;
  location: Location.LocationData;
}) {
  const date = new Date(
    time["@attributes"].from +
      `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`
  );
  const raindropHeight = 20;
  return (
    <View style={styles.item}>
      {/*<Text style={{ ...styles.text, ...styles.day }}>{getDay(date)}</Text>*/}
      <View style={styles.itemContainer}>
        <View style={styles.time}>
          <Text style={{ ...styles.text, ...styles.hours }}>
            {formatHours(date)}
          </Text>
          <Text style={{ ...styles.text, ...styles.minutes }}>00</Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <Text
            style={{
              ...styles.text,
              ...styles.temperature,
            }}
          >
            {Math.round(Number(time.temperature["@attributes"].value))}
          </Text>
          <Text
            style={{
              ...styles.text,
              fontSize: 10,
              fontFamily: "Inter_200ExtraLight",
              marginTop: 3,
            }}
          >
            ℃
          </Text>
        </View>
        <View
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                ...styles.text,
                fontSize: 10,
              }}
            >
              {time.windSpeed["@attributes"].mps} m/s
            </Text>
            <View
              style={{
                marginLeft: 3,

                transform: [
                  {
                    rotate: `${Number(
                      time.windDirection["@attributes"].deg
                    )}deg`,
                  },
                ],
              }}
            >
              <ArrowUp
                width={10}
                height={10}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </View>
          </View>
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 50,
            }}
          >
            <View
              style={{
                width: raindropHeight,
              }}
            >
              {Number(time.precipitation["@attributes"].value) !== 0 && (
                <View
                  style={{
                    position: "relative",
                    height: raindropHeight,
                  }}
                >
                  <View
                    style={{
                      position: "relative",
                      height: Math.min(
                        raindropHeight,
                        (Number(time.precipitation["@attributes"].value) / 3) *
                          raindropHeight
                      ),
                      overflow: "hidden",
                      top:
                        raindropHeight -
                        Math.min(
                          raindropHeight,
                          (Number(time.precipitation["@attributes"].value) /
                            3) *
                            raindropHeight
                        ),
                    }}
                  >
                    <Raindrop
                      width={raindropHeight}
                      height={raindropHeight}
                      style={{ position: "absolute", bottom: 0 }}
                    />
                  </View>
                  <RaindropOutline
                    width={raindropHeight}
                    height={raindropHeight}
                    style={{ position: "absolute" }}
                  />
                </View>
              )}
            </View>
            {Number(time.precipitation["@attributes"].value) !== 0 && (
              <Text
                style={{
                  ...styles.text,
                  ...styles.precipitation,
                  marginTop: 2,
                }}
              >
                {time.precipitation["@attributes"].value} mm
              </Text>
            )}
          </View>
          <View
            style={{
              width: 30,
              height: 30,
              marginRight: 8,
            }}
          >
            <PhenomenonIcon
              latitude={location.coords.latitude}
              longitude={location.coords.longitude}
              width={30}
              height={30}
              style={{
                width: 30,
                height: 30,
              }}
              date={date}
              phenomenon={time.phenomen["@attributes"].en}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 3,
    flexGrow: 1,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0, .1)",
    borderColor: "rgba(0,0,0, .3)",
    borderWidth: 0.5,
    marginTop: 4,
    height: 48,
  },
  itemContainer: {
    flexGrow: 1,
    flexDirection: "row",
    alignContent: "flex-end",
  },
  text: {
    fontFamily: "Inter_300Light",
    color: "#fff",
    fontSize: 12,
    fontWeight: "100",
  },
  day: {
    fontSize: 10,
    marginLeft: 20,
  },
  time: {
    marginRight: 12,
    marginLeft: 4,
  },
  hours: {
    fontSize: 16,
    fontWeight: "bold",
  },
  minutes: {
    fontSize: 15,
    marginTop: -2,
    opacity: 0.4,
  },
  temperature: {
    fontSize: 38,
    lineHeight: 34,
    paddingTop: 9,
    height: 34,
    fontFamily: "Inter_200ExtraLight",
  },
  precipitation: {
    fontSize: 8,
  },
});
