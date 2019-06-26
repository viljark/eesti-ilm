import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableHighlight } from 'react-native';
import HTMLParser from 'fast-html-parser';
import { useInterval } from '../useInterval';


const width = Dimensions.get('window').width; //full width
export function Radar(props: {latestUpdate: Date}) {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [delay, setDelay] = useState(null);

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


  useInterval(() => {
    if (index + 1 < images.length) {
      setIndex(index => index + 1)
    } else {
      setIndex(0);
    }
  }, delay);

  const handleClick = () => {
    if (delay === null) {
      setDelay(1000);
    } else {
      setDelay(null);
    }
  };

  return (
    <View style={styles.container}>
      {images.length > 0 && (
        <>
          <View>

              {images.map((image, i) => (
                  <TouchableHighlight onPress={handleClick} key={i} style={{opacity: i === index ? 1 : 0, position: 'absolute', left: 0, top: 0}}>
                    <Image source={{ uri: images[i].src }} style={{ width: width, height: width}} fadeDuration={0} />
                  </TouchableHighlight>
              ))}

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
    opacity: 0.7,
    fontSize: 10,
    textTransform: 'uppercase',
    position: 'absolute',
    left: 0,
    fontFamily: 'monospace',
    top: 0,
  }
});