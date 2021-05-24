import React from 'react'
import { Animated, StyleProp, ViewStyle, Text } from 'react-native'
import { PanGestureHandler, State } from 'react-native-gesture-handler'

interface Props {
  pan: Animated.ValueXY
  xMin: number
  xMax: number
  style: StyleProp<ViewStyle>
  children: any
}

export function HorizontalScrollView({ pan, xMin, xMax, style, children }: Props) {
  if (pan) {
    pan.addListener(({ x }) => {
      if (x < xMin || x > 0) {
        Animated.decay(pan, { useNativeDriver: true, velocity: { x: 0, y: 0 } }).stop()
      }
    })
  }
  return pan ? (
    <Animated.ScrollView
      onTouchStart={(e) => {
        if (e.nativeEvent.touches.length === 2) {
          pan.x.setOffset(0)
          pan.x.setValue(0)
        }
      }}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      style={style}
    >
      <PanGestureHandler
        onBegan={(e) => {
          // @ts-ignore
          pan.x.setOffset(pan.x._value > xMax ? xMax : pan.x._value < xMin ? xMin : pan.x._value)
          pan.x.setValue(0)
        }}
        onGestureEvent={Animated.event(
          [
            {
              nativeEvent: {
                translationX: pan.x,
              },
            },
          ],
          { useNativeDriver: true }
        )}
        onHandlerStateChange={(e) => {
          if (e.nativeEvent.oldState === State.ACTIVE) {
            pan.flattenOffset()
            Animated.decay(pan, { useNativeDriver: true, velocity: { x: e.nativeEvent.velocityX / 900, y: 0 }, deceleration: 0.997 }).start()
          }
        }}
      >
        <Animated.View
          style={{
            transform: [
              {
                translateX: pan.getTranslateTransform()[0].translateX.interpolate({
                  inputRange: [xMin, xMax],
                  outputRange: [xMin, xMax],
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              },
            ],
          }}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </Animated.ScrollView>
  ) : null
}
