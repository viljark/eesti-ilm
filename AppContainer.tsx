import React, {useRef} from 'react'
import Main from './src/screens/Main'
import ForecastScreen from './src/screens/ForecastScreen'
import {Dimensions, Text} from 'react-native'
import Constants from 'expo-constants'
import Settings from './src/screens/Settings'
import {NavigationContainer, DefaultTheme, NavigationState} from '@react-navigation/native'
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {createStackNavigator} from '@react-navigation/stack'
import * as Analytics from 'expo-firebase-analytics'

const height = Dimensions.get('window').height //full height
const width = Dimensions.get('window').width //full width

const MyTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: 'transparent',
	},
}

const Tab = createMaterialTopTabNavigator()
const Stack = createStackNavigator()

function MainScreens() {
	return (
		<Tab.Navigator
			tabBarPosition={'bottom'}
			style={{
				backgroundColor: 'transparent',
			}}
			gestureHandlerProps={{}}
			screenOptions={{
				tabBarAllowFontScaling: false,
				tabBarActiveTintColor: '#fff',
				tabBarContentContainerStyle: {},
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					textTransform: 'lowercase',
					fontSize: 18,
					fontFamily: 'Inter_200ExtraLight',
				},
				tabBarItemStyle: {},
				tabBarIndicatorContainerStyle: {
					backgroundColor: 'rgba(25, 40, 59, 0.6)',
					opacity: 1,
				},
				tabBarIndicatorStyle: {
					backgroundColor: 'transparent',
					borderTopColor: 'rgba(255, 255, 255, 1)',
					borderTopWidth: 0.5,
					opacity: 1,
					height: '100%',
					top: 0,
				},
				tabBarStyle: {
					width,
					backgroundColor: 'transparent',
				},
			}}
		>
			<Tab.Screen name="Main" options={{title: 'Ilm hetkel'}} component={Main} />
			<Tab.Screen name="Forecast" options={{title: 'Ennustus'}} component={ForecastScreen} />
			<Tab.Screen name="Settings" options={{title: 'Seaded'}} component={Settings} />
		</Tab.Navigator>
	)
}

export default function App() {
	const navigationRef = useRef()
	return (
		<NavigationContainer
			theme={MyTheme}
			ref={navigationRef}
			onStateChange={() => {
				if (navigationRef?.current) {
					// @ts-ignore
					const currentRoute = navigationRef?.current?.getCurrentRoute()
					if (currentRoute?.name) {
						Analytics.logEvent('screen_view', {name: currentRoute?.name})
					}
				}
			}}
		>
			<Stack.Navigator screenOptions={{headerShown: false}}>
				<Stack.Screen name="MainScreens" component={MainScreens} />
			</Stack.Navigator>
		</NavigationContainer>
	)
}
