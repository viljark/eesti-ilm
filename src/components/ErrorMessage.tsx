import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

export function ErrorMessage({ children }) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={styles.container}
        onPress={async () => {
          await WebBrowser.openBrowserAsync('https://www.ilmateenistus.ee/ilm/ilmavaatlused/radar/#layers/precipitation,thunder')
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: '#fff',
            fontFamily: 'Inter_700',
          }}
        >
          <Text
            style={{
              color: 'red',
              fontSize: 15,
              fontFamily: 'Inter_700Bold',
            }}
          >
            ⚠{' '}
          </Text>
          {children}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    display: 'flex',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRadius: 15,
    padding: 10,
  },
  text: {
    color: '#fff',
  },
})
