import React from 'react';
import Main from './src/screens/Main';
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import ForecastScreen from './src/screens/ForecastScreen';

const AppNavigator = createMaterialTopTabNavigator({
  Main: {
    screen: Main,
  },
  Forecast: {
    screen: ForecastScreen,
    navigationOptions: ({navigation}) => {
      const params = navigation.state.params;
      return {
        swipeEnabled: false, //params ? params.swipeEnabled : true,
      }
    }
  }
}, {
  initialRouteName: 'Main', tabBarOptions: {
    style: {
      display: 'none',
    },
  },

});

export default createAppContainer(AppNavigator);