import React, { useEffect, useState } from 'react'
import { LinearGradient as ExpoLinearGradient, LinearGradient } from 'expo-linear-gradient'
import { Dimensions, StyleSheet } from 'react-native'
import { getTimes } from 'suncalc'
import * as Location from 'expo-location'
import { StatusBar } from 'expo-status-bar'

const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height //full height

const Background = (props: { children: React.ReactNode; location: Location.LocationObject }) => {
  const [gradient, setGradient] = useState<{
    color: string[]
    location: number[]
  }>()
  const [isNight, setIsNight] = useState(false)
  useEffect(() => {
    setGradient(gradientsDay[Math.floor(Math.random() * gradientsDay.length)])
  }, [])

  let sunLight

  useEffect(() => {
    if (props.location) {
      sunLight = getTimes(new Date(), props.location.coords.latitude, props.location.coords.longitude)

      const now = new Date().getHours() + new Date().getMinutes() / 60

      const sunrise = new Date(sunLight.sunrise).getHours() + new Date(sunLight.sunrise).getMinutes() / 60
      const sunset = new Date(sunLight.sunset).getHours() + new Date(sunLight.sunset).getMinutes() / 60

      if (now >= sunrise && now < sunset) {
        const dayStep = (sunset - sunrise) / gradientsDay.length
        const dayIndex = Math.floor((now - sunrise) / dayStep)
        setIsNight(false)
        setGradient(gradientsDay[dayIndex])
      } else {
        let nightIndex
        const nightStep = (24 - (sunset - sunrise)) / gradientsNight.length
        if (now < sunset) {
          // new day, so lets add 24 to calculate hours passed
          nightIndex = Math.floor((now + 24 - sunset) / nightStep)
        } else {
          nightIndex = Math.floor((now - sunset) / nightStep)
        }
        setIsNight(true)
        setGradient(gradientsNight[3])
      }
    }
  }, [props.location])

  return gradient ? (
    <LinearGradient style={styles.container} colors={gradient.color} start={[0.5, 0]} locations={gradient.location}>
      {props.children}
      <StatusBar style={gradientsNight.includes(gradient) ? 'light' : 'dark'} />
    </LinearGradient>
  ) : null
}

export default Background
const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1,
    backgroundColor: '#fff',
  },
})

// from https://codepen.io/cobaltblue/pen/tkvmi?editors=1000
const gradientsDay = [
  {
    color: ['#b3cae5', '#dbdde4', '#e4e3e4', '#f7ddbb', '#efcab2'],
    location: [12 / 100, 46 / 100, 70 / 100, 94 / 100, 1],
  }, // sunrise
  {
    color: ['#5e7fb1', '#dce8f7', '#eff1f4', '#fce1a8', '#f7ec86'],
    location: [0 / 100, 61 / 100, 72 / 100, 88 / 100, 1],
  },
  {
    color: ['#8fb8ee', '#cbe2f4', '#dbe5eb', '#f9d3b8', '#e0b2a3'],
    location: [0 / 100, 40 / 100, 63 / 100, 83 / 100, 1],
  },
  {
    color: ['#b4ced8', '#d7e5d4', '#e2e8c9', '#f1e5b9', '#edd7ac'],
    location: [17 / 100, 51 / 100, 72 / 100, 87 / 100, 1],
  },
  {
    color: ['#506e90', '#7695aa', '#a7bdb8', '#e2e2b8', '#fdf998'],
    location: [0 / 100, 37 / 100, 56 / 100, 79 / 100, 1],
  },
  {
    color: ['#6bafd2', '#a4c8dc', '#d6cbca', '#eabc96', '#db8876'],
    location: [0 / 100, 38 / 100, 58 / 100, 79 / 100, 1],
  },
  {
    color: ['#95b3bf', '#c6cdd3', '#e5d8d9', '#f1e1d9', '#f3e1cd'],
    location: [0 / 100, 35 / 100, 64 / 100, 85 / 100, 1],
  },
  {
    color: ['#a7d3cb', '#bcc1c4', '#e5cab3', '#fee6c5', '#fdecd0'],
    location: [0 / 100, 32 / 100, 59 / 100, 89 / 100, 1],
  },

  {
    color: ['#bccacc', '#c7d8d6', '#d9ebe0', '#ebf9e3', '#f4f8d0'],
    location: [0 / 100, 26 / 100, 54 / 100, 78 / 100, 1],
  },
  {
    color: ['#a2e0f9', '#cef5fc', '#eafaeb', '#fefcd3', '#fdf4ba'],
    location: [6 / 100, 39 / 100, 70 / 100, 88 / 100, 1],
  },
  {
    color: ['#34a4ca', '#59d7dd', '#a8f2f0', '#d0f8ef', '#d6f6e1'],
    location: [0 / 100, 28 / 100, 59 / 100, 84 / 100, 1],
  },
  {
    color: ['#7696cd', '#8fb2e4', '#b0cff0', '#d7e5ec', '#dee0e7'],
    location: [0 / 100, 15 / 100, 33 / 100, 69 / 100, 1],
  },
  {
    color: ['#8dd6c3', '#c5e5e2', '#eafaeb', '#f9f7ca', '#fceea1'],
    location: [6 / 100, 40 / 100, 70 / 100, 88 / 100, 1],
  },
  {
    color: ['#4e72c7', '#6d9ed7', '#a4c8d5', '#b4d9e1', '#c4d9d6'],
    location: [0 / 100, 34 / 100, 67 / 100, 84 / 100, 1],
  },
  {
    color: ['#889db6', '#a5b8ce', '#c1cfdd', '#dee1e4', '#d5d1cf'],
    location: [0 / 100, 20 / 100, 42 / 100, 81 / 100, 1],
  },
  {
    color: ['#74bddb', '#a8d1eb', '#cddbf5', '#e4e6fb', '#f6f4f8'],
    location: [0 / 100, 32 / 100, 56 / 100, 73 / 100, 1],
  },

  {
    color: ['#ffe3c8', '#efad9e', '#c79797', '#a78a92', '#857d8d'],
    location: [0 / 100, 45 / 100, 65 / 100, 85 / 100, 1],
  },
  {
    color: ['#6f749e', '#9a8daf', '#d0a8b9', '#f8bbb1', '#fde6b1'],
    location: [0 / 100, 31 / 100, 58 / 100, 80 / 100, 1],
  },
  {
    color: ['#727288', '#8e889b', '#d3c2bd', '#f9d89a', '#f8c785'],
    location: [6 / 100, 29 / 100, 70 / 100, 89 / 100, 1],
  },
  {
    color: ['#7e74b2', '#b3a2c2', '#e2cdbe', '#f6cf97', '#f4a77a'],
    location: [9 / 100, 36 / 100, 66 / 100, 85 / 100, 1],
  },
  {
    color: ['#555351', '#555351', '#8d7b6c', '#cc9d7a', '#fff9aa'],
    location: [0 / 100, 5 / 100, 40 / 100, 70 / 100, 1],
  },
  {
    color: ['#47565f', '#5b625a', '#947461', '#f98056', '#f7ec86'],
    location: [0 / 100, 15 / 100, 38 / 100, 70 / 100, 1],
  },
  {
    color: ['#325571', '#8e9fa4', '#decab2', '#f2d580', '#ffa642'],
    location: [0 / 100, 38 / 100, 66 / 100, 78 / 100, 1],
  },
  {
    color: ['#c5d4d7', '#d6b98d', '#c99262', '#8c5962', '#43577e'],
    location: [6 / 100, 34 / 100, 57 / 100, 80 / 100, 1],
  },
]

const gradientsNight = [
  {
    color: ['#20202f', '#273550', '#416081', '#adacb2', '#eac3a2'],
    location: [0 / 100, 16 / 100, 41 / 100, 78 / 100, 1],
  }, //sunset
  {
    color: ['#171c33', '#525f83', '#848896', '#bb9d78', '#f6e183'],
    location: [0 / 100, 42 / 100, 63 / 100, 78 / 100, 1],
  },
  {
    color: ['#536a97', '#8087ad', '#bca391', '#bd968a', '#a38b8a'],
    location: [11 / 100, 35 / 100, 72 / 100, 96 / 100, 1],
  },
  {
    color: ['#325176', '#7b9ea7', '#9baf93', '#dbaf81', '#fbdf73'],
    location: [1 / 100, 42 / 100, 67 / 100, 85 / 100, 1],
  },
  {
    color: ['#634b5f', '#868080', '#b7b29b', '#dfd6a4', '#e9f3a2'],
    location: [0 / 100, 34 / 100, 58 / 100, 80 / 100, 1],
  },
  {
    color: ['#29153e', '#657489', '#bfb6aa', '#ead79d', '#f2ebda'],
    location: [5 / 100, 38 / 100, 66 / 100, 87 / 100, 1],
  },
  {
    color: ['#4c86ab', '#95a5bc', '#bfcdc9', '#dcd6c9', '#edd9c7'],
    location: [0 / 100, 39 / 100, 70 / 100, 91 / 100, 1],
  },
  {
    color: ['#0f124a', '#1b2360', '#515b80', '#758391', '#e5e3b0'],
    location: [0 / 100, 16 / 100, 42 / 100, 58 / 100, 1],
  },
]
