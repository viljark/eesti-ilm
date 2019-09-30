import React from 'react';
import Main from './src/Main';
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import ForecastScreen from './src/ForecastScreen';

const AppNavigator = createMaterialTopTabNavigator({
  Main: {
    screen: Main,
  },
  Forecast: {
    screen: ForecastScreen,
    navigationOptions: ({navigation}) => {
      const params = navigation.state.params;
      return {
        swipeEnabled: params ? params.swipeEnabled : true,
      }
    }
  }
}, {
  initialRouteName: 'Forecast', tabBarOptions: {
    style: {
      display: 'none',
    },
  },

});

export default createAppContainer(AppNavigator);