import React from 'react';
import { StyleSheet, Text, View } from 'react-native';



export function ErrorMessage ({children}) {
  return (
    <View style={styles.container}>
      <Text>
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
    color: '#fff',
    display: 'flex',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});