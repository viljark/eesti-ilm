import React from 'react';
import Main from './src/screens/Main';
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import ForecastScreen from './src/screens/ForecastScreen';
import { Dimensions } from 'react-native';

const height = Dimensions.get('window').height; //full height
const width = Dimensions.get('window').width; //full width

const AppNavigator = createMaterialTopTabNavigator({
  Main: {
    screen: Main,
    navigationOptions: ({navigation}) => {
      const params = navigation.state.params;
      return {
        title: 'Ilm hetkel',
      }
    }
  },
  Forecast: {
    screen: ForecastScreen,
    navigationOptions: ({navigation}) => {
      const params = navigation.state.params;
      return {
        swipeEnabled: params ? params.swipeEnabled : true,
        title: '48 tunni ennustus',
      }
    }
  }
}, {
  initialRouteName: 'Main', tabBarOptions: {
    showLabel: true,
    upperCaseLabel: false,
    indicatorStyle: {
      backgroundColor: '#fff',
      opacity: .3,
    },
    style: {
      paddingTop: 23,
      width,
      backgroundColor: 'transparent',
    },
  },

});

export default createAppContainer(AppNavigator);