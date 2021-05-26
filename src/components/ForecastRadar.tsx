import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, View, Image, Dimensions, TouchableHighlight, Slider, ActivityIndicator } from 'react-native'
import HTMLParser from 'fast-html-parser'
import { LocationContext } from '../../LocationContext'
import { dayNames, getFormattedDateTime } from '../utils/formatters'
import useAsyncStorage from '../utils/useAsyncStorage'

const width = Dimensions.get('window').width - 20 //full width
export function ForecastRadar(props: { latestUpdate: Date }) {
  const [images, setImages] = useAsyncStorage<{ src: string; date: Date }[]>('forecastImages')
  const [index, setIndex] = useState(0)
  const { location, locationName } = useContext(LocationContext)

  useEffect(() => {
    try {
      fetch('https://m.ilmateenistus.ee/m/mudelprognoos/sademed/')
        .then((r) => r.text())
        .then((r) => {
          const root = HTMLParser.parse(r)
          const imageElements = root.querySelectorAll('.radar-map .slider')
          const images = imageElements
            .map((i) => {
              const dateTime = i.attributes.src.match(/sadu_([\s\S]*?).\png/s)[1]
              const [datePart, timePart] = dateTime.split('_')
              const [hourPart, hoursAddedPart] = timePart.split('+')
              const date = new Date()
              date.setFullYear(Number(datePart.slice(0, 4)), Number(datePart.slice(4, 6)) - 1, Number(datePart.slice(6, 8)))
              date.setHours(Number(hourPart) + new Date().getTimezoneOffset() / -60)
              date.setMinutes(0)
              date.setTime(date.getTime() + Number(hoursAddedPart) * 1000 * 60 * 60)
              return {
                src: i.attributes.src,
                date: date,
              }
            })
            .filter((image) => image.date.getTime() > new Date().getTime())
          setImages(images)
          setIndex(0)
          // preFetchImages()
        })
    } catch (e) {
      console.error(e)
    }
  }, [props.latestUpdate])

  // const preFetchImages = async () => {
  //   for (const image of images) {
  //     await Image.prefetch(image.src)
  //   }
  // }

  const changeFrame = (amount: number) => {
    if (index + amount >= images.length) {
      setIndex(0)
      return
    }

    if (index + amount < 0) {
      setIndex(images.length - 1)
      return
    }
    setIndex((index) => index + amount)
  }

  const handleSliderMove = (e) => {
    setIndex(e)
  }

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
    const mapLatBottomRad = (mapLatBottom * Math.PI) / 180
    const latitudeRad = (latitude * Math.PI) / 180
    const mapLngDelta = mapLngRight - mapLngLeft

    const worldMapWidth = ((mapWidth / mapLngDelta) * 360) / (2 * Math.PI)
    const mapOffsetY = (worldMapWidth / 2) * Math.log((1 + Math.sin(mapLatBottomRad)) / (1 - Math.sin(mapLatBottomRad)))

    const x = (longitude - mapLngLeft) * (mapWidth / mapLngDelta)
    const y = mapHeight - ((worldMapWidth / 2) * Math.log((1 + Math.sin(latitudeRad)) / (1 - Math.sin(latitudeRad))) - mapOffsetY)

    return { x, y } // the pixel x,y value of this point on the map image
  }

  let x = 0
  let y = 0

  if (location?.coords?.latitude && location?.coords?.longitude) {
    const myLocation = convertGeoToPixel(location.coords.latitude, location.coords.longitude, width, width, 19.6617, 30.03533, 56.05117)
    x = myLocation.x
    y = myLocation.y
  }
  // account for the reverse image order by taking using reverse index
  const date = images?.[index]?.date
  const dateString = dayNames[date?.getDay() || 0].slice(0, 1) + ' ' + getFormattedDateTime(date?.getTime())
  return (
    <View style={styles.container}>
      {images?.length > 0 && (
        <>
          <View style={{ width: width, height: width, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator style={{ zIndex: 0 }} size="small" color="#fff" />
            {images.map((image, i) => (
              <TouchableHighlight
                key={i}
                style={{
                  // account for the reverse image order by taking using reverse index
                  opacity: i === index ? 1 : 0,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }}
              >
                <Image source={{ uri: images[i].src }} style={{ width: width, height: width }} fadeDuration={300} />
              </TouchableHighlight>
            ))}
            <Image source={require('../assets/legend.png')} style={{ position: 'absolute', bottom: 0, width: '100%', height: 60 }} fadeDuration={100} />
            <Slider
              value={index}
              maximumValue={images.length - 1}
              step={1}
              minimumTrackTintColor={'#000'}
              maximumTrackTintColor={'#000'}
              thumbTintColor={'#000'}
              style={styles.progress}
              onValueChange={handleSliderMove}
            />

            <Text style={styles.smallText}>{dateString}</Text>
            <View style={{ ...styles.marker, left: x, top: y }}></View>
          </View>
          <Slider
            value={index}
            maximumValue={images.length - 1}
            step={1}
            minimumTrackTintColor={'#000'}
            maximumTrackTintColor={'#000'}
            thumbTintColor={'#000'}
            style={styles.slider}
            onValueChange={handleSliderMove}
          />
          {/*<Image style={styles.guide} source={{ uri:'http://www.ilmateenistus.ee/wp-content/themes/emhi2013/images/radar_legend.png' }} />*/}
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
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    margin: 10,
    marginTop: 0,
    overflow: 'hidden',
    width: width,
    height: width,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  smallText: {
    color: '#000',
    opacity: 1,
    fontSize: 22,
    textTransform: 'uppercase',
    position: 'absolute',
    left: 14,
    fontFamily: 'monospace',
    top: 20,
  },
  progress: {
    position: 'absolute',
    opacity: 1,
    left: 0,
    top: 10,
    height: 15,
    width: width,
  },
  guide: {
    position: 'absolute',
    width: width,
    height: 40,
    zIndex: 2,
    bottom: 0,
  },
  slider: {
    position: 'absolute',
    width: width,
    height: width,
    zIndex: 2,
    top: 0,
    opacity: 0,
  },
  marker: {
    position: 'absolute',
    width: 3.5,
    height: 3.5,
    backgroundColor: '#ff0000',
    borderColor: '#000',
    borderWidth: 0.5,
    borderRadius: 4,
    transform: [{ translateY: -1 }, { translateX: -1 }],
  },
})
