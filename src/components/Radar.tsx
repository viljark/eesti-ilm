import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableHighlight,
  Slider,
} from "react-native";
import HTMLParser from "fast-html-parser";
import { LocationContext } from "../../LocationContext";

const width = Dimensions.get("window").width; //full width
export function Radar(props: { latestUpdate: Date }) {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const { location, locationName } = useContext(LocationContext);

  useEffect(() => {
    fetch(
      "https://www.ilmateenistus.ee/ilm/ilmavaatlused/radaripildid/komposiitpilt/"
    )
      .then((r) => r.text())
      .then((r) => {
        const root = HTMLParser.parse(r);
        const imageElements = root.querySelectorAll(".radar-image");
        const images = imageElements.map((i) => {
          return {
            src: i.attributes.src,
            date: new Date(
              Number(i.attributes["data-datetime"]) * 1000
            ).toLocaleString(),
          };
        });

        setImages(images);
        setIndex(images.length - 1);
      });
  }, [props.latestUpdate]);

  const changeFrame = (amount: number) => {
    if (index + amount >= images.length) {
      setIndex(0);
      return;
    }

    if (index + amount < 0) {
      setIndex(images.length - 1);
      return;
    }
    setIndex((index) => index + amount);
  };

  const handleSliderMove = (e) => {
    setIndex(e);
  };

  function convertGeoToPixel(
    latitude,
    longitude,
    mapWidth, // in pixels
    mapHeight, // in pixels
    mapLngLeft, // in degrees. the longitude of the left side of the map (i.e. the longitude of whatever is depicted on the left-most part of the map image)
    mapLngRight, // in degrees. the longitude of the right side of the map
    mapLatBottom
  ) {
    // in degrees.  the latitude of the bottom of the map
    const mapLatBottomRad = (mapLatBottom * Math.PI) / 180;
    const latitudeRad = (latitude * Math.PI) / 180;
    const mapLngDelta = mapLngRight - mapLngLeft;

    const worldMapWidth = ((mapWidth / mapLngDelta) * 360) / (2 * Math.PI);
    const mapOffsetY =
      (worldMapWidth / 2) *
      Math.log(
        (1 + Math.sin(mapLatBottomRad)) / (1 - Math.sin(mapLatBottomRad))
      );

    const x = (longitude - mapLngLeft) * (mapWidth / mapLngDelta);
    const y =
      mapHeight -
      ((worldMapWidth / 2) *
        Math.log((1 + Math.sin(latitudeRad)) / (1 - Math.sin(latitudeRad))) -
        mapOffsetY);

    return { x, y }; // the pixel x,y value of this point on the map image
  }

  let x = 0;
  let y = 0;

  if (location?.coords?.latitude && location?.coords?.longitude) {
    const myLocation = convertGeoToPixel(
      location.coords.latitude,
      location.coords.longitude,
      width,
      width,
      20.353331,
      29.773211,
      56.485432
    );
    x = myLocation.x;
    y = myLocation.y;
  }

  const date = images?.[index]?.date
    ?.split(" ")
    .reverse()[1]
    ?.split(":")
    .slice(0, 2)
    .join(":");
  return (
    <View style={styles.container}>
      {images.length > 0 && (
        <>
          <View style={{ width: width, height: width }}>
            {images.map((image, i) => (
              <TouchableHighlight
                key={i}
                style={{
                  opacity: i === index ? 1 : 0,
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
              >
                <Image
                  source={{ uri: images[i].src }}
                  style={{ width: width, height: width }}
                  fadeDuration={0}
                />
              </TouchableHighlight>
            ))}

            <Slider
              value={index}
              maximumValue={images.length - 1}
              step={1}
              minimumTrackTintColor={"#fff"}
              maximumTrackTintColor={"#fff"}
              thumbTintColor={"#fff"}
              style={styles.progress}
              onValueChange={handleSliderMove}
            />

            <Text style={styles.smallText}>{date}</Text>
            <View style={{ ...styles.marker, left: x, top: y }}></View>
          </View>
          <Slider
            value={index}
            maximumValue={images.length - 1}
            step={1}
            minimumTrackTintColor={"#fff"}
            maximumTrackTintColor={"#fff"}
            thumbTintColor={"#fff"}
            style={styles.slider}
            onValueChange={handleSliderMove}
          />
          {/*<Image style={styles.guide} source={{ uri:'http://www.ilmateenistus.ee/wp-content/themes/emhi2013/images/radar_legend.png' }} />*/}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignSelf: "stretch",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  smallText: {
    color: "#fff",
    opacity: 1,
    fontSize: 22,
    textTransform: "uppercase",
    position: "absolute",
    left: 14,
    fontFamily: "monospace",
    top: 20,
  },
  progress: {
    position: "absolute",
    opacity: 1,
    left: 0,
    top: 10,
    height: 15,
    width: width,
  },
  guide: {
    position: "absolute",
    width: width,
    height: 40,
    zIndex: 2,
    bottom: 0,
  },
  slider: {
    position: "absolute",
    width: width,
    height: width,
    zIndex: 2,
    top: 0,
    opacity: 0,
  },
  marker: {
    position: "absolute",
    width: 3.5,
    height: 3.5,
    backgroundColor: "#ff0000",
    borderColor: "#000",
    borderWidth: 0.5,
    borderRadius: 4,
    transform: [{ translateY: -1 }, { translateX: -1 }],
  },
});
