import React from 'react'
import { TouchableNativeFeedback, View, Text, StyleSheet } from 'react-native'

export function TabButton({ text, isActive, onPress, style }: any) {
  return (
    <TouchableNativeFeedback onPress={onPress}>
      <View style={[styles.container, isActive ? styles.activeContainer : {}, style]}>
        <Text allowFontScaling={false} style={[styles.text, isActive ? styles.activeText : {}]}>
          {text}
        </Text>
      </View>
    </TouchableNativeFeedback>
  )
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,.5)',
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: '50%',
    opacity: 0.7,
  },
  activeContainer: { opacity: 1 },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter_300Light',
    opacity: 0.9,
  },
  activeText: { opacity: 1 },
})
