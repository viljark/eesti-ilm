import React, { useContext, useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { getDetailedForecast, getLocationByName, Time } from '../services';
import _ from 'lodash';
import { LocationContext } from '../../LocationContext';
import { AreaChart, BarChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape'
import { Defs, G, LinearGradient, Path, Stop, Text as SvgText, TSpan } from 'react-native-svg';
import { PhenomenonIcon } from '../components/PhenomenonIcon';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location'
import { ScrollView } from 'react-native-gesture-handler';
import { getDayName } from '../utils/formatters';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height - 71; //full height

export default function ForecastScreen() {

  const [query, setQuery] = useState(undefined);
  const [data, setData] = useState([]);
  const [iconLocation, setIconLocation] = useState<Array<{
    index: number;
    locationX: number;
    locationY: number;
  }>>([]);
  const [coordinates, setCoordinates] = useState('');
  const { location, locationName } = useContext<{ location: Location.LocationData, locationName: string }>(LocationContext);
  const [latestUpdate, setLatestUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true);
  const [detailedForecast, setDetailedForecast] = useState<Time[]>(undefined);

  async function getData(query) {
    if (!query) {
      setData([]);
    }
    const response = await getLocationByName(query);
    setData(response.data || []);
  }

  async function getInitialData(query) {
    if (!query) return
    const response = await getLocationByName(query);
    const result = response.data;
    const coords = result && result.length && result[0].koordinaat;
    setCoordinates(coords);
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


  const Decorator = (props?: any) => {
    const decoratorLocations = [];
    const decorators = props.data.map((value, index) => {
      decoratorLocations.push({
        index,
        locationX: props.x(index),
        locationY: props.y(value),
      });
      return null;
    })

    if (!_.isEqual(decoratorLocations, iconLocation)) {
      setIconLocation(decoratorLocations);
    }
    return decorators;
  }

  const PrecipitationDecorator = (props?: any) => {
    const decorators = props.data.map((value, index) => {
      return value === 0 ? null : (
        <G key={index}>
          <SvgText
            fill="#fff"
            fontSize="6"
            x={props.x(index) + 5}
            y={props.y(value) - 1}
            textAnchor="middle"
          >
            {value} mm
          </SvgText>
        </G>
      )
    })

    return decorators;
  }

  const Gradient = (props?: any) => (
    <Defs key={props.index}>
      <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
        <Stop offset={'100%'} stopColor={'#325571'} stopOpacity={0}/>
        <Stop offset={'50%'} stopColor={'#12d8fa'} stopOpacity={.5}/>
        <Stop offset={'0%'} stopColor={'#a6ffcb'} stopOpacity={1}/>
      </LinearGradient>
    </Defs>
  );
  const Line = (props?: any) => (
    <Path
      key={'line'}
      d={props.line}
      stroke={'#a6ffcb'}
      fill={'none'}
    />
  )

  const minTemp = detailedForecast && _.min(detailedForecast.map((f) => Number(f.temperature['@attributes'].value)));

  return (
    <ScrollView style={styles.scrollContainer} nestedScrollEnabled={true} refreshControl={
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={() => {
          setLatestUpdate(new Date());
        }}/>
    }>
      <View style={styles.container}>
        <View style={styles.autocompleteContainer}>
          <Autocomplete
            defaultValue={query === undefined ? locationName : query}
            data={data}
            onFocus={() => {
              setQuery('');
            }}
            style={{
              paddingLeft: 10,
              paddingRight: 5,
              paddingTop: 5,
              paddingBottom: 5,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              borderRadius: 3,
            }}
            onChangeText={text => setQuery(text)}
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
              <TouchableOpacity onPress={() => {
                setQuery(item.label);
                setCoordinates(item.koordinaat);
              }} key={index} style={{ paddingVertical: 10, paddingHorizontal: 5, borderTopColor: '#f1f1f1', borderTopWidth: 1, }}>
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {detailedForecast && (
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            shouldActivateOnStart={true}
            style={{ display: 'flex', flexGrow: 1, zIndex: 10, position: 'absolute', bottom: 0, }}
          >
            <AreaChart
              style={{ height: 220, width: width * 4.5, paddingBottom: 20 }}
              data={detailedForecast.map(f => Number(f.temperature['@attributes'].value))}
              contentInset={{ top: 30, bottom: 5 }}
              curve={shape.curveNatural}
              svg={{ fill: 'url(#gradient)' }}
              start={minTemp - 0.5}
              yMin={minTemp - 2}
            >
              <Decorator/>
              <Gradient/>
              <Line/>
            </AreaChart>
            {iconLocation.map((icon, i) => (
              <View key={i + 200} style={{
                position: 'absolute',
                left: icon.locationX,
                top: 160,
                display: 'flex',
                height: 70,
              }}>
                {detailedForecast[i] && !!detailedForecast[i].phenomen['@attributes'].en &&
                <PhenomenonIcon
                    latitude={location.coords.latitude}
                    longitude={location.coords.longitude}
                    key={i}
                    width={30}
                    height={30}
                    style={{
                      marginLeft: 0,
                    }}
                    date={new Date(detailedForecast[i]['@attributes'].from + `+0${new Date().getTimezoneOffset() / 60 * -1}:00`)}
                    phenomenon={detailedForecast[i].phenomen['@attributes'].en}
                />}
                {detailedForecast[i]
                && !!detailedForecast[i]['@attributes'].from
                && new Date(detailedForecast[i]['@attributes'].from + `+0${new Date().getTimezoneOffset() / 60 * -1}:00`).getHours() === 0
                && <>
                    <Text key={i + 100} style={{
                      position: 'absolute',
                      bottom: 210,
                      height: 20,
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginLeft: -2,
                      fontSize: 12,
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 5,
                    }}>
                      {getDayName(detailedForecast[i]['@attributes'].from + `+0${new Date().getTimezoneOffset() / 60 * -1}:00`)}
                    </Text>
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      width: 0.5,
                      height: 210,
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    }}/>
                </>
                }
                {detailedForecast[i] && !!detailedForecast[i]['@attributes'].from && i % 2 === 0 &&
                <Text key={i + 100} style={{
                  position: 'absolute',
                  bottom: 10,
                  width: 30,
                  height: 20,
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 10,
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 5,

                }}>{new Date(detailedForecast[i]['@attributes'].from + `+0${new Date().getTimezoneOffset() / 60 * -1}:00`).getHours()}:00</Text>}
              </View>
            ))}
            <BarChart
              style={{ height: 100, width: width * 4.5, zIndex: 1, position: 'absolute', left: 0, bottom: 20, }}
              data={detailedForecast.map(f => Number(f.precipitation['@attributes'].value))}
              contentInset={{ top: 5 }}
              yMax={7.6} // heavy rain
              yMin={0}
              svg={{ fill: '#204bff' }}
            >
              <PrecipitationDecorator/>
            </BarChart>

            {iconLocation.map((icon, i) => (
              detailedForecast[i] && !!detailedForecast[i].temperature['@attributes'].value && i % 2 === 0 &&
                <View key={i} style={{
                  position: 'absolute',
                  top: icon.locationY - 25,
                  left: icon.locationX,
                  display: 'flex',
                  flexDirection: 'row',
                }}>
                    <Text style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 14,
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 5,
                      fontFamily: ""

                    }}>
                      {Number(detailedForecast[i].temperature['@attributes'].value).toFixed(0)}
                    </Text>
                    <Text style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 10,
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 5,
                      fontFamily: ""
                    }}>
                        ℃
                    </Text>
                </View>)
            )}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  )
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
    position: 'absolute',
    right: 10,
    top: 13,
    zIndex: 2,
  }
});