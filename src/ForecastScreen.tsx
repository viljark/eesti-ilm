import React, { useContext, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { getDetailedForecast, getLocationByName, Time } from './services';
import _ from 'lodash';
import { LocationContext } from '../LocationContext';
import { StackedAreaChart, Grid, AreaChart, LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape'
import { Circle, Defs, G, LinearGradient, Path, Stop, Text as SvgText, TSpan } from 'react-native-svg';
import { NavigationTabScreenProps } from 'react-navigation-tabs';
import { PhenomenonIcon } from './components/PhenomenonIcon';
import * as Location from 'expo-location'

const width = Dimensions.get('window').width; //full width

export default function ForecastScreen(props: NavigationTabScreenProps) {

  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [iconLocation, setIconLocation] = useState<Array<{
    index: number;
    location: number;
  }>>([]);
  const [tempData, setTempData] = useState([]);
  const [locationId, setLocationId] = useState(0);
  const { location, locationName } = useContext<{ location: Location.LocationData, locationName: string }>(LocationContext);
  const [latestUpdate, setLatestUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true);
  const [detailedForecast, setDetailedForecast] = useState<Time[]>(undefined);

  async function getData(query) {
    console.log('q', query);
    const response = await getLocationByName(query);
    const result = response.data;
    console.log('zz', result);
    setData(response.data || []);
  }

  async function getInitialData(query) {
    console.log('q', query);
    const response = await getLocationByName(query);
    const result = response.data;
    const locationId = result && result.length && result[0].id;
    console.log(locationId);
    setLocationId(locationId);
  }

  async function getForecast(locationId) {
    const response = await getDetailedForecast(locationId);
    setDetailedForecast(response.forecast.tabular.time);
    setIsRefreshing(false);
  }

  const debounceGetData = _.debounce(getData, 500);

  useEffect(() => {
    if (!locationId) {
      return;
    }
    getForecast(locationId);
  }, [locationId]);


  useEffect(() => {
    if (!query) {
      return;
    }
    debounceGetData(query);
  }, [query]);

  useEffect(() => {
    getInitialData(locationName);
  }, [locationName]);

  const chartData = [50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80]

  const Decorator = ({ x, y, data }) => {
    const locations = [];
    const decorators = data.map((value, index) => {
      locations.push({
        index,
        location: x(index),
      });
      return index % 2 === 0 ? null : (
        <G key={index}>
          <SvgText
            fill="#fff"
            fontSize="12"
            fontWeight="bold"
            x={x(index)}
            y={y(value) - 5}
            textAnchor="middle"
          >
            {value}<TSpan dx="3 3" dy="-3 -3" fontWeight="normal" fontSize="9">°C</TSpan>
          </SvgText>
        </G>
      )
    })

    if (!_.isEqual(locations, iconLocation)) {
      setIconLocation(locations);
    }
    return decorators;
  }

  const Line = ({ line }) => (
    <Path
      d={line}
      stroke={'#ffffff'}
      strokeWidth={0.3}
      fill={'none'}
    />
  )

  const Gradient = ({ index }) => (
    <Defs key={index}>
      <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
        <Stop offset={'100%'} stopColor={'#1fa2ff'} stopOpacity={1}/>
        <Stop offset={'50%'} stopColor={'#12d8fa'} stopOpacity={1}/>
        <Stop offset={'0%'} stopColor={'#a6ffcb'} stopOpacity={1}/>
      </LinearGradient>
    </Defs>
  )

  return (
    <ScrollView style={styles.scrollContainer} refreshControl={
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={() => {
          setLatestUpdate(new Date());
        }}/>
    }>
      <View style={styles.container}>
        <View style={styles.autocompleteContainer}>
          <Autocomplete
            defaultValue={query}
            data={data}
            onChangeText={text => setQuery(text)}
            inputContainerStyle={{
              borderWidth: 0,
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setQuery(item.label)} key={index}>
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {/*@ts-ignore*/}
        {detailedForecast && (
          <View
            onTouchStart={() => {
              props.navigation.setParams({ swipeEnabled: false })
              console.log('touch start');
            }}
            onTouchEnd={() => {
              props.navigation.setParams({ swipeEnabled: true })
              console.log('touch end');
            }}
          >
            <ScrollView
              horizontal={true}
              style={{ display: 'flex', flexGrow: 1, zIndex: 100 }}
              onScrollBeginDrag={() => {
                props.navigation.setParams({ swipeEnabled: false })
                console.log('drag start');
              }}

              onScrollEndDrag={() => {
                props.navigation.setParams({ swipeEnabled: true })
                console.log('drag end');
              }}
            >
              <AreaChart
                style={{ height: 120, width: width * 3, paddingBottom: 20}}
                data={detailedForecast.map(f => Number(f.temperature['@attributes'].value))}
                contentInset={{ top: 30 }}
                curve={shape.curveNatural}
                svg={{ fill: 'url(#gradient)' }}
              >
                <Decorator/>
                <Gradient/>
                {/*<Decorator />*/}
              </AreaChart>
              <LineChart
                style={{ height: 50, width: width * 3, zIndex: 1, position: 'absolute', left: 0, bottom: 20,}}
                data={detailedForecast.map(f => Number(f.precipitation['@attributes'].value))}
                contentInset={{ top: 5 }}
                curve={shape.curveNatural}
                yMax={7.6} // heavy rain
                yMin={0}
                svg={{ fill: '#204bff' }}
              >
                {/*<Decorator />*/}
              </LineChart>
              {iconLocation.map((icon, i) => (
                <View key={i+200} style={{
                  position: 'absolute',
                  left: icon.location,
                  top: 70,
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
                        marginLeft: -20,
                      }}
                      phenomenon={detailedForecast[i].phenomen['@attributes'].en}
                  />}
                  {detailedForecast[i] && !!detailedForecast[i]['@attributes'].from && i % 2 === 0 &&
                  <Text key={i+100} style={{
                    position: 'absolute',
                    bottom: 20,
                    width: 30,
                    height: 20,
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 10,

                  }}>{new Date(detailedForecast[i]['@attributes'].from + `+0${new Date().getTimezoneOffset() / 60 * -1}:00`).getHours()}:00</Text>}
                </View>
              ))}
            </ScrollView>
          </View>

        )}

        <View>
          {detailedForecast && detailedForecast.map((f, i) => (
            <Text key={i}>{f['@attributes'].from} {f.temperature['@attributes'].value} {f.phenomen['@attributes'].en} {f.precipitation['@attributes'].value}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingTop: 80,
    paddingLeft: 10,
    paddingRight: 10,
  },
  autocompleteContainer: {
    flex: 1,
    left: 10,
    position: 'absolute',
    right: 10,
    top: 33,
    zIndex: 1
  }
});