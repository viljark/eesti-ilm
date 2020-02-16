import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableHighlight } from 'react-native';
import HTMLParser from 'fast-html-parser';


const width = Dimensions.get('window').width; //full width
export function Radar(props: {latestUpdate: Date}) {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch('https://www.ilmateenistus.ee/ilm/ilmavaatlused/radaripildid/komposiitpilt/').then((r) => r.text()).then((r) => {
      const root = HTMLParser.parse(r);
      const imageElements = root.querySelectorAll('.radar-image');
      const images = imageElements.map((i) => {
        return ({
          src: i.attributes.src,
          date: new Date(Number(i.attributes['data-datetime']) * 1000).toLocaleString(),
        })
      });

      setImages(images);
      setIndex(images.length - 1);
    })
  }, [props.latestUpdate]);

  const changeFrame = (amount: number) => {
    if (index + amount >= images.length) {
      setIndex(0);
      return
    }

    if (index + amount < 0) {
      setIndex(images.length - 1);
      return;
    }
    setIndex(index => index + amount)
  };


  const handleClick = (e) => {
    const midScreen = width / 2;
    if (e.nativeEvent.locationX > midScreen) {
      changeFrame(1);
    } else {
      changeFrame(-1);
    }
  };

  return (
    <View style={styles.container}>
      {images.length > 0 && (
        <>
          <View style={{ width: width, height: width}}>
              {images.map((image, i) => (
                  <TouchableHighlight onPress={handleClick} key={i} style={{opacity: i === index ? 1 : 0, position: 'absolute', left: 0, top: 0}}>
                    <Image source={{ uri: images[i].src }} style={{ width: width, height: width}} fadeDuration={0} />
                  </TouchableHighlight>
              ))}

            <View style={{...styles.progress, width: ((index + 1) / images.length) * width}}/>
            <Text style={styles.smallText}>{images[index].date}</Text>
          </View>
        </>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  smallText: {
    color: '#fff',
    opacity: 1,
    fontSize: 10,
    textTransform: 'uppercase',
    position: 'absolute',
    left: 0,
    fontFamily: 'monospace',
    top: 4,
  },
  progress: {
    position: 'absolute',
    backgroundColor: "#fff",
    opacity: 0.6,
    left: 0,
    top: 0,
    height: 4,
    width: width,
  }
});