import * as React from 'react'
import { useContext, useMemo, useRef, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import MapView, { MAP_TYPES, Marker, UrlTile, WMSTile } from 'react-native-maps'
import { LocationContext } from '../../LocationContext'
import * as FileSystem from 'expo-file-system'

import Svg, { Circle } from 'react-native-svg'
import { useSharedSettings } from '../screens/Settings'
import Animated, { FadeIn } from 'react-native-reanimated'
import { store } from '../store/store'
import { useSnapshot } from 'valtio'
import { Forecast, Station } from '../services'
import { PhenomenonIcon } from './PhenomenonIcon'

const roundDownTo = (roundTo) => (x) => Math.floor(x / roundTo) * roundTo
const roundDownTo10Minutes = roundDownTo(1000 * 60 * 10)
const width = Dimensions.get('window').width //full width

const cityNames = [
  'Tallinn-Harku',
  // 'Tartu-Tõravere',
  'Tartu-Kvissental',
  'Türi',
  'Kuressaare linn',
  'Jõhvi',
  'Pärnu',
]

export default function ForecastMap({ stations, forecast, mode }: { stations: Station[]; forecast: Forecast; mode: 'day' | 'night' }): JSX.Element {
  const [deltaSum, setDeltaSum] = useState(7.1)

  // const { location } = useContext(LocationContext)
  const { isDarkMap } = useSharedSettings()
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

  const cities = useMemo(() => {
    return stations
      .filter((station) => cityNames.find((name) => name.includes(station.name)))
      .map((station) => {
        const place = forecast[mode]?.place.find((place) => station.name.includes(place.name))
        return {
          ...station,
          phenomenon: place.phenomenon,
          airtemperature: `${place.tempmax || place.tempmin}`,
        }
      })
  }, [stations])

  return (
    <View style={styles.container}>
      <Animated.View style={styles.mapContainer} entering={FadeIn.duration(500).delay(700)}>
        {isDarkMap === null ? null : (
          <MapView
            onRegionChange={(region) => {
              setDeltaSum(region.longitudeDelta + region.latitudeDelta)
            }}
            ref={ref}
            key={tileCacheDir}
            pitchEnabled={false}
            zoomEnabled={false}
            zoomControlEnabled={false}
            scrollEnabled={false}
            provider={undefined}
            mapType={MAP_TYPES.NONE}
            style={styles.map}
            rotateEnabled={false}
            minZoomLevel={6.3}
            moveOnMarkerPress={false}
            initialRegion={{
              latitude: 58.6488358,
              longitude: 25.2302703,
              latitudeDelta: 7.7,
              longitudeDelta: 3.8,
            }}
          >
            <UrlTile shouldReplaceMapContent={true} urlTemplate={tiles} maximumZ={19} flipY={flip} tileCacheMaxAge={30 * 24 * 60 * 60} tileCachePath={tileCacheDir} />

            <WMSTile style={{ opacity: isDarkMap ? 0.6 : 0.4, zIndex: 2 }} urlTemplate={borders} />
            <PhenomenonMarkers cities={cities} mode={mode} />
            <CityMarkers cities={cities} />
          </MapView>
        )}
      </Animated.View>
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
            anchor={{ x: 0.5, y: 0.9 }}
            tracksViewChanges={false}
          >
            <View style={{ position: 'absolute', top: 0, paddingVertical: 0, paddingHorizontal: 4, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)' }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'white',
                  fontFamily: 'Inter_500Medium',
                  fontSize: 12,
                }}
              >
                {station.airtemperature}°
              </Text>
            </View>
          </Marker>
        ))}
    </>
  )
})

const PhenomenonMarkers = React.memo(({ cities, mode }: { cities: Station[]; mode: 'day' | 'night' }) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true)
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
            tracksViewChanges={tracksViewChanges}
          >
            <View style={{}}>
              <PhenomenonIcon isDay={mode === 'day'} onLoad={() => setTracksViewChanges(false)} phenomenon={station.phenomenon} width={35} height={35} theme={'meteocon'} />
            </View>
          </Marker>
        ))}
    </>
  )
})

const styles = StyleSheet.create({
  container: {
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mapContainer: {
    width: width,
    height: width - 20,
    overflow: 'hidden',
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
})
