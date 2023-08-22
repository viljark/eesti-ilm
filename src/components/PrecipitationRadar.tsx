import * as React from 'react'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import MapView, { MAP_TYPES, Marker, UrlTile, WMSTile } from 'react-native-maps'
import { LocationContext } from '../../LocationContext'
import * as FileSystem from 'expo-file-system'

import Slider from '@react-native-community/slider'
import { getFormattedTime } from '../utils/formatters'
import HTMLParser from 'fast-html-parser'
import Svg, { Circle } from 'react-native-svg'
import { RadarColors } from './RadarColors'
import { useSharedSettings } from '../screens/Settings'
import Animated, { FadeIn } from 'react-native-reanimated'
import format from 'date-fns/format'
import add from 'date-fns/add'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import { store } from '../store/store'
import { useSnapshot } from 'valtio'
import ZoomOutIcon from './ZoomOutIcon'
import ZoomInIcon from './ZoomInIcon'
import { addMinutes } from 'date-fns'
import { Station } from '../services'
import TemperatureIcon from './TemperatureIcon'
import ThunderIcon from './ThunderIcon'
import analytics from '@react-native-firebase/analytics'
import LottieView from 'lottie-react-native'
import { PhenomenonIcon } from './PhenomenonIcon'

const roundDownTo = (roundTo) => (x) => Math.floor(x / roundTo) * roundTo
const roundDownTo10Minutes = roundDownTo(1000 * 60 * 10)
const width = Dimensions.get('window').width - 20 //full width

const cityNames = [
  'Tallinn-Harku',
  // 'Tartu-Tõravere',
  'Tartu-Kvissental',
  'Narva',
  'Pärnu',
  'Kohtla-Järve',
  'Viljandi',
  'Rakvere',
  'Kuressaare linn',
  'Võru',
  'Valga',
  'Haapsalu',
  'Jõhvi',
  'Paide',
  'Kiviõli',
  'Tapa',
  'Põlva',
  'Türi',
  'Elva',
  'Rapla',
  'Saue',
  'Põltsamaa',
  'Kunda',
  'Kallaste',
  'Otepää',
  'Mustvee',
  'Tõrva',
  'Kehra',
  'Jõgeva',
  'Heltermaa',
]

export default function PrecipitationRadar({ latestUpdate, stations }: { latestUpdate: Date; stations: Station[] }): JSX.Element {
  const sliderSteps = 24
  const originalSteps = 36
  const futureMinutes = 60
  const [startDate, setStartDate] = useState(roundDownTo10Minutes(addMinutes(new Date(), futureMinutes)) - 5 * 60 * 1000 * originalSteps)
  const [deltaSum, setDeltaSum] = useState(7.1)

  const { location } = useContext(LocationContext)
  const [sliderIndex, setSliderIndex] = useState(sliderSteps - futureMinutes / 5)
  const { isDarkMap, showThunder, showTemperature, showPhenomenon, setShowPhenomenon, setShowThunder, setShowTemperature } = useSharedSettings()
  const tileCacheDir = FileSystem.cacheDirectory + `mapbox-${isDarkMap ? 'dark' : 'light'}/`

  const { isSwipeEnabled } = useSnapshot(store)
  const ref = useRef<MapView>()

  const mapBoxDark = 'clf1lw9lt001k01pg6s20piqq'
  const mapBoxWhite = 'cldc4wv26000d01nmjyljtssb'
  const borders = `https://www.ilmateenistus.ee/gsavalik/geoserver/baasandmed/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=baasandmed%3Aehak_maakond&STYLES=piirid_tume&SRS=EPSG%3A3857&BBOX={minX},{minY},{maxX},{maxY}&WIDTH={width}&HEIGHT={height}`
  const mapBox = `https://api.mapbox.com/styles/v1/viljark/${isDarkMap ? mapBoxDark : mapBoxWhite}/tiles/512/{z}/{x}/{y}@2x?access_token=${process.env.MAPBOX_TOKEN}`
  const maaamet = 'https://tiles.maaamet.ee/tm/tms/1.0.0/hallkaart@GMC/{z}/{x}/{y}.jpg&ASUTUS=MAAAMET&KESKKOND=EXAMPLES'
  const tiles = mapBox

  // @ts-ignore
  const flip = tiles === maaamet

  useEffect(() => {
    setStartDate(roundDownTo10Minutes(addMinutes(new Date(), futureMinutes)) - 5 * 60 * 1000 * originalSteps)
    setSliderIndex(sliderSteps - futureMinutes / 5)
  }, [latestUpdate])

  useEffect(() => {
    fetch('https://www.ilmateenistus.ee/ilm/ilmavaatlused/radar/#layers/precipitation')
      .then((r) => r.text())
      .then((r) => {
        const root = HTMLParser.parse(r)
        const slider = root.querySelector('#radar-slider')
        let start = slider.attributes['data-start']
        const startTimestamp = Number(start) * 1000
        if (differenceInMinutes(new Date(), startTimestamp) < 15) {
          start = start ? addMinutes(startTimestamp, futureMinutes) : roundDownTo10Minutes(addMinutes(new Date(), futureMinutes)) - 5 * 60 * 1000 * originalSteps
          setStartDate(start)
        }
      })
  }, [latestUpdate, setStartDate, sliderSteps])

  const getRadarUrl = useCallback(
    (isoDate: string) => {
      const isFuture = new Date(isoDate).getTime() > new Date().getTime()

      if (isFuture) {
        return `https://ilmgs.envir.ee/geoserver/ilm/wms?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=ilm:nowcasting&TILED=true&exceptions=application/vnd.ogc.se_inimage&TIME=${isoDate}&SRS=EPSG%3A3857&BBOX={minX},{minY},{maxX},{maxY}&WIDTH={width}&HEIGHT={height}&t=${latestUpdate.getTime()}`
      }
      return `https://ilmgs.envir.ee/geoserver/ilm/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=ilm:cmp_cap&TILED=true&exceptions=application/vnd.ogc.se_inimage&TIME=${isoDate}&SRS=EPSG%3A3857&BBOX={minX},{minY},{maxX},{maxY}&WIDTH={width}&HEIGHT={height}&t=${latestUpdate.getTime()}`
    },
    [latestUpdate]
  )
  const getThunderUrl = useCallback(
    (isoDate: string) => {
      const endTime = format(new Date(isoDate).setSeconds(0), 'yyyy-MM-dd HH:mm:SS')
      const startTime = format(add(new Date(isoDate).setSeconds(0), { minutes: -5, seconds: -1 }), 'yyyy-MM-dd HH:mm:ss')
      const isFuture = new Date(isoDate).getTime() > new Date().getTime()
      if (isFuture) {
        return ''
      }
      return `https://www.ilmateenistus.ee/gsavalik/geoserver/keskkonnainfo/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=keskkonnainfo%3Apikne&STYLES=pikne_yld&CQL_FILTER=loomise_aeg%20between%20%27${startTime}%27%20and%20%27${endTime}%27&SRS=EPSG%3A3857&BBOX={minX},{minY},{maxX},{maxY}&WIDTH={width}&HEIGHT={height}&t=${latestUpdate.getTime()}`
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

  const thunderTileUrlsReversed = useMemo(() => {
    return timestamps.map((timestamp) => getThunderUrl(new Date(timestamp).toISOString()))
  }, [timestamps])

  const sliderColor = '#ddd'
  const sliderTimestamp = timestamps[radarTileUrlsReversed.length - sliderIndex]
  const isFuture = new Date(sliderTimestamp).getTime() > new Date().getTime()
  const futureMinutesDiff = differenceInMinutes(new Date(sliderTimestamp), new Date())

  const cities = useMemo(() => {
    return stations.filter((station) => cityNames.includes(station.name))
  }, [stations])

  return (
    <View style={styles.container}>
      <Animated.View style={styles.mapContainer} entering={FadeIn.duration(500).delay(700)}>
        <Text style={[styles.smallText, { color: isDarkMap ? '#ddd' : '#555' }]}>
          {getFormattedTime(sliderTimestamp)} {isFuture && futureMinutesDiff > 0 ? '+' + futureMinutesDiff + 'min' : ''}
        </Text>
        <View style={styles.progressWrap}>
          <Slider
            value={sliderIndex}
            minimumValue={1}
            maximumValue={sliderSteps}
            step={1}
            minimumTrackTintColor={sliderColor}
            maximumTrackTintColor={sliderColor}
            thumbTintColor={sliderColor}
            style={styles.progress}
            onValueChange={setSliderIndex}
          />
          <View
            style={{
              position: 'absolute',
              backgroundColor: isDarkMap ? 'rgba(0,194,255,0.4)' : 'rgba(0,194,255,0.4)',
              width: (((width - 15) / sliderSteps) * futureMinutes) / 5 - 8,
              height: 50,
              right: 15,
              bottom: 0,
              zIndex: 1,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Text style={{ color: isDarkMap ? '#fff' : '#fff', paddingBottom: 4, fontFamily: 'Inter_300Light', fontSize: 12 }}>prognoos</Text>
          </View>
        </View>

        {isDarkMap === null ? null : (
          <MapView
            onRegionChange={(region) => {
              setDeltaSum(region.longitudeDelta + region.latitudeDelta)
            }}
            ref={ref}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderStart={(event) => {
              if (event.nativeEvent.touches.length > 1) {
                store.isSwipeEnabled = false
              }
            }}
            onResponderEnd={() => {
              store.isSwipeEnabled = true
            }}
            key={tileCacheDir}
            pitchEnabled={false}
            zoomEnabled={true}
            zoomControlEnabled={false}
            scrollEnabled={!isSwipeEnabled}
            provider={undefined}
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
          >
            <UrlTile shouldReplaceMapContent={true} urlTemplate={tiles} maximumZ={19} flipY={flip} tileCacheMaxAge={30 * 24 * 60 * 60} tileCachePath={tileCacheDir} />

            {radarTileUrlsReversed.map((url, i) => {
              return <WMSTile style={{ opacity: radarTileUrlsReversed.length - 1 - i === sliderIndex - 1 ? 1 : 0 }} key={url} urlTemplate={url} />
            })}
            {showThunder &&
              thunderTileUrlsReversed.map((url, i) => {
                return url ? <WMSTile style={{ opacity: thunderTileUrlsReversed.length - 1 - i === sliderIndex - 1 ? 1 : 0, zIndex: 1 }} key={url} urlTemplate={url} /> : null
              })}
            <WMSTile style={{ opacity: isDarkMap ? 0.6 : 0.4, zIndex: 2 }} urlTemplate={borders} />
            {location && (
              <Marker tappable={false} coordinate={location.coords} zIndex={1} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={{ width: 3, height: 3 }}>
                  <Svg width="100%" height="100%" viewBox="0 0 10 10">
                    <Circle cx={5} cy={5} r={5} fill="red" />
                  </Svg>
                </View>
              </Marker>
            )}
            {showPhenomenon && <PhenomenonMarkers cities={stations} />}
            {showTemperature && <CityMarkers cities={cities} />}
          </MapView>
        )}
        <TouchableOpacity
          style={{
            ...styles.zoomButton,
            right: 10,
            bottom: 210,
          }}
          onPress={() => {
            setShowPhenomenon(!showPhenomenon)
            ToastAndroid.show('Nähtuste kaardikiht ' + (showThunder ? 'väljas' : 'sees'), ToastAndroid.SHORT)

            analytics().logEvent('radar_thunder', { value: !showThunder })
          }}
        >
          <ThunderIcon fill={`'rgba(255, 255, 255, ${showPhenomenon ? '0.8' : '0.2'})`} width={24} height={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.zoomButton,
            right: 10,
            bottom: 160,
          }}
          onPress={() => {
            setShowThunder(!showThunder)
            ToastAndroid.show('Välgulöökide kaardikiht ' + (showThunder ? 'väljas' : 'sees'), ToastAndroid.SHORT)

            analytics().logEvent('radar_thunder', { value: !showThunder })
          }}
        >
          <ThunderIcon fill={`'rgba(255, 255, 255, ${showThunder ? '0.8' : '0.2'})`} width={24} height={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.zoomButton,
            right: 10,
            bottom: 110,
          }}
          onPress={() => {
            setShowTemperature(!showTemperature)

            analytics().logEvent('radar_temperature', { value: !showTemperature })
            ToastAndroid.show('Temperatuuride kaardikiht ' + (showTemperature ? 'väljas' : 'sees'), ToastAndroid.SHORT)
          }}
        >
          <TemperatureIcon fill={`'rgba(255, 255, 255, ${showTemperature ? '0.8' : '0.2'})`} width={24} height={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            display: deltaSum < 7.1 ? 'flex' : 'none',
            right: 60,
            ...styles.zoomButton,
          }}
          onPress={() => {
            analytics().logEvent('radar_zoom')
            ref.current.animateToRegion({
              latitude: 58.6488358,
              longitude: 25.2302703,
              latitudeDelta: 4.6,
              longitudeDelta: 2.5,
            })
          }}
        >
          <ZoomOutIcon strokeWidth={1} stroke="rgba(255, 255, 255, 0.8)" width={24} height={24} />
        </TouchableOpacity>
        {location && (
          <TouchableOpacity
            style={{
              right: 10,
              ...styles.zoomButton,
            }}
            onPress={() => {
              ref.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.2,
                longitudeDelta: 0.2,
              })
            }}
          >
            <ZoomInIcon strokeWidth={1} stroke="rgba(255, 255, 255, 0.8)" width={24} height={24} />
          </TouchableOpacity>
        )}
      </Animated.View>

      <RadarColors />
    </View>
  )
}

const CityMarkers = React.memo(({ cities }: { cities: Station[] }) => {
  return (
    <>
      {cities
        .filter((c) => !!c.airtemperature)
        .map((station) => (
          <Marker
            key={station.name}
            tappable={false}
            coordinate={{
              latitude: Number(station.latitude),
              longitude: Number(station.longitude),
            }}
            zIndex={1}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={{ position: 'absolute', top: 0, paddingVertical: 0, paddingHorizontal: 2, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)' }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'white',
                  fontFamily: 'Inter_300Light',
                  fontSize: 8,
                }}
              >
                {Math.round(+station.airtemperature)}°
              </Text>
            </View>
          </Marker>
        ))}
    </>
  )
})

const PhenomenonMarkers = React.memo(({ cities }: { cities: Station[] }) => {
  return (
    <>
      {cities
        .filter((c) => !!c.phenomenon)
        .map((station) => (
          <Marker
            key={station.name}
            tappable={false}
            coordinate={{
              latitude: Number(station.latitude),
              longitude: Number(station.longitude),
            }}
            zIndex={1}
            anchor={{ x: 0.5, y: 0.3 }}
          >
            <View style={{}}>
              <PhenomenonIcon phenomenon={station.phenomenon} width={15} height={15} theme={'meteocon'} />
            </View>
          </Marker>
        ))}
    </>
  )
})

const styles = StyleSheet.create({
  container: {
    borderColor: 'rgba(0,0,0,0.5)',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderWidth: 2,
    borderTopWidth: 0,
    overflow: 'hidden',
    marginBottom: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mapContainer: {
    width: width - 4,
    height: width,
    overflow: 'hidden',
    marginBottom: 10,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    overflow: 'hidden',
  },
  progressWrap: {
    zIndex: 2,
    position: 'absolute',
    bottom: 0,
    opacity: 1,
    height: 50,
    width: width,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  progress: {
    opacity: 1,
    height: 50,
    width: width,
    zIndex: 2,
  },
  smallText: {
    zIndex: 2,
    color: '#555',
    opacity: 1,
    fontSize: 22,
    textTransform: 'uppercase',
    position: 'absolute',
    bottom: 52,
    left: 5,
    fontFamily: 'monospace',
  },
  slider: {
    // position: 'absolute',
    width: width,
    zIndex: 2,
    top: 0,
    // opacity: 0,
  },
  zoomButton: {
    position: 'absolute',
    bottom: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
})
