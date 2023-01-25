import * as React from 'react'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import MapView, { MAP_TYPES, Marker, UrlTile, WMSTile } from 'react-native-maps'
import { LocationContext } from '../../LocationContext'
import * as FileSystem from 'expo-file-system'

import { useAssets } from 'expo-asset'
import Slider from '@react-native-community/slider'
import { getFormattedTime } from '../utils/formatters'
import HTMLParser from 'fast-html-parser'
import Constants from 'expo-constants'

const roundDownTo = (roundTo) => (x) => Math.floor(x / roundTo) * roundTo
const roundDownTo10Minutes = roundDownTo(1000 * 60 * 10)
const width = Dimensions.get('window').width - 20 //full width

const tileCacheDir = FileSystem.cacheDirectory + 'mapbox/'

export default function PrecipitationRadar({ latestUpdate }: { latestUpdate: Date }): JSX.Element {
  const sliderSteps = 18
  const originalSteps = 36
  const [startDate, setStartDate] = useState(roundDownTo10Minutes(new Date()) - 5 * 60 * 1000 * sliderSteps)
  const { location } = useContext(LocationContext)
  const [assets, assetLoadingError] = useAssets([require('../assets/pin2.png')])
  const [sliderIndex, setSliderIndex] = useState(sliderSteps)

  // TODO
  const thunderUrl = `https://www.ilmateenistus.ee/gsavalik/geoserver/keskkonnainfo/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=keskkonnainfo%3Apikne&STYLES=pikne_yld&CQL_FILTER=loomise_aeg%20between%20%272023-01-20%2022%3A24%3A59%27%20and%20%272023-01-20%2022%3A30%3A00%27&SRS=EPSG%3A3857&BBOX={minX},{minY},{maxX},{maxY}&WIDTH={width}&HEIGHT={height}`
  const mapBox = `https://api.mapbox.com/styles/v1/viljark/cldc4wv26000d01nmjyljtssb/tiles/512/{z}/{x}/{y}@2x?access_token=${process.env.MAPBOX_TOKEN}`
  const maaamet = 'https://tiles.maaamet.ee/tm/tms/1.0.0/hallkaart@GMC/{z}/{x}/{y}.jpg&ASUTUS=MAAAMET&KESKKOND=EXAMPLES'

  const tiles = mapBox

  // @ts-ignore
  const flip = tiles === maaamet

  useEffect(() => {
    fetch('https://www.ilmateenistus.ee/ilm/ilmavaatlused/radar/#layers/precipitation')
      .then((r) => r.text())
      .then((r) => {
        const root = HTMLParser.parse(r)
        const slider = root.querySelector('#radar-slider')
        let start = slider.attributes['data-start']
        start = start ? Number(start) * 1000 : roundDownTo10Minutes(new Date()) - 5 * 60 * 1000 * sliderSteps

        setStartDate(start)
      })
  }, [latestUpdate, setStartDate, sliderSteps])

  const getRadarUrl = useCallback(
    (isoDate: string) => {
      return `https://ilmgsprelive.envir.ee/geoserver/ilm/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=ilm:cmp_cap&TILED=true&exceptions=application/vnd.ogc.se_inimage&TIME=${isoDate}&SRS=EPSG%3A3857&BBOX={minX},{minY},{maxX},{maxY}&WIDTH={width}&HEIGHT={height}&t=${latestUpdate.getTime()}`
    },
    [latestUpdate]
  )

  const timestamps = useMemo(() => {
    const dates = []
    for (let i = 1; i <= sliderSteps; i++) {
      const offset = originalSteps - sliderSteps
      dates.push(startDate + (i + offset) * 5 * 60 * 1000)
    }
    return dates
  }, [startDate, sliderSteps])

  const radarTileUrlsReversed = useMemo(() => {
    return timestamps.reverse().map((timestamp) => getRadarUrl(new Date(timestamp).toISOString()))
  }, [timestamps])

  return (
    <View style={styles.container}>
      <Text style={styles.smallText}>{getFormattedTime(timestamps[radarTileUrlsReversed.length - sliderIndex])} </Text>
      <Slider
        value={sliderIndex}
        minimumValue={1}
        maximumValue={sliderSteps}
        step={1}
        minimumTrackTintColor="#555"
        maximumTrackTintColor="#555"
        thumbTintColor="#555"
        style={styles.progress}
      />
      <Slider
        value={sliderIndex}
        minimumValue={1}
        maximumValue={sliderSteps}
        step={1}
        minimumTrackTintColor="#555"
        maximumTrackTintColor="#555"
        thumbTintColor="#555"
        style={styles.slider}
        onValueChange={setSliderIndex}
      />
      <MapView
        pitchEnabled={false}
        zoomEnabled={true}
        zoomControlEnabled={false}
        scrollEnabled={false}
        provider={null}
        mapType={MAP_TYPES.NONE}
        style={styles.map}
        rotateEnabled={false}
        minZoomLevel={6}
        moveOnMarkerPress={false}
        initialRegion={{
          latitude: 58.6488358,
          longitude: 25.2302703,
          latitudeDelta: 4.6,
          longitudeDelta: 2.5,
        }}
        mapPadding={{
          top: 0,
          right: 0,
          bottom: width,
          left: 0,
        }}
      >
        <UrlTile shouldReplaceMapContent={true} urlTemplate={tiles} maximumZ={19} flipY={flip} tileCacheMaxAge={30 * 24 * 60 * 60} tileCachePath={tileCacheDir} />

        {radarTileUrlsReversed.map((url, i) => {
          return <WMSTile style={{ opacity: radarTileUrlsReversed.length - 1 - i === sliderIndex - 1 ? 1 : 0 }} key={url} urlTemplate={url} />
        })}
        {location && assets && <Marker tappable={false} coordinate={location.coords} zIndex={1} image={assets[0]} />}
      </MapView>
    </View>
  )
}
const script = `
(function() {
document.getElementById("header").style.display = "none"
document.querySelector('.page-content-wrapper').style.setProperty('padding', 0, 'important')
document.querySelector('h2').remove()
document.querySelector('.layer-filter-buttons').remove()
document.querySelector('#app>.wrapper').style.setProperty('margin', 0, 'important')
document.querySelector('#app>.wrapper').style.setProperty('width', '100%', 'important')
window.dispatchEvent(new Event('resize'));

})()
`
const styles = StyleSheet.create({
  container: {
    width: width,
    height: width,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: 'rgba(0,0,0,0.5)',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    overflow: 'hidden',
  },
  progress: {
    zIndex: 1,
    position: 'absolute',
    top: -10,
    opacity: 1,
    height: 55,
    width: width,
  },
  smallText: {
    zIndex: 2,
    color: '#555',
    opacity: 1,
    fontSize: 22,
    textTransform: 'uppercase',
    position: 'absolute',
    left: 14,
    fontFamily: 'monospace',
    top: 20,
  },
  slider: {
    position: 'absolute',
    width: width,
    height: width,
    zIndex: 2,
    top: 0,
    opacity: 0,
  },
})