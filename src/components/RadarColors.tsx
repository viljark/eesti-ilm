import React from 'react'
import { StyleSheet, View, Text } from 'react-native'

interface Props {}

const colors = [
  { amount: 0.1, color: '#0099cc', description: 'nõrk' },
  { amount: 0.3, color: '#005588' },
  { amount: 0.5, color: '#7dcf46', description: 'mõõdukas' },
  { amount: 1, color: '#1ba824' },
  { amount: 2, color: '#f5f53f' },
  { amount: 4, color: '#f0bd31', description: 'tugev' },
  { amount: 8, color: '#ff7d25' },
  { amount: 16, color: '#f20000' },
  { amount: 50, color: '#ff45ff', description: 'rahe' },
]
export const RadarColors: React.FC<Props> = ({}: Props) => {
  return (
    <View
      style={{
        ...styles.container,
        marginTop: -10,
      }}
    >
      <View style={styles.colorWrap}>
        {colors.map((color, i) => (
          <View
            style={[
              styles.color,
              { backgroundColor: color.color },
              i === 0 && { borderBottomLeftRadius: 10, borderTopLeftRadius: 10 },
              i === colors.length - 1 && { borderBottomRightRadius: 10, borderTopRightRadius: 10 },
            ]}
          >
            <Text style={styles.amount}>{color.amount}</Text>
            {color.description && (
              <Text style={styles.description} numberOfLines={2}>
                {color.description}
              </Text>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.title}>sademete määr (mm/h)</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    paddingBottom: 5,
    flexGrow: 0,
  },
  colorWrap: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 12,
    fontFamily: 'Inter_300Light',
    color: '#fff',
    marginTop: 16,
    paddingRight: 4,
  },
  color: {
    height: 13,
    flexGrow: 1,
    flexShrink: 0,
    alignItems: 'center',
    overflow: 'visible',
  },
  amount: {
    paddingTop: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  description: {
    position: 'absolute',
    bottom: -12,
    left: '30%',
    flexWrap: 'nowrap',
    fontFamily: 'Inter_300Light',
    fontSize: 8,
    flexGrow: 1,
    color: '#fff',
    width: 100,
  },
})
