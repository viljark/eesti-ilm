import * as React from 'react'
import Svg, { SvgProps, G, Path } from 'react-native-svg'
const SvgComponent = (props: SvgProps) => (
  <Svg width={512} height={512} viewBox="0 0 32 32" {...props}>
    <G fill="none" stroke={props.fill}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 14h1v9h1m12-7a13 13 0 1 1-26 0 13 13 0 0 1 26 0Z" />
      <Path fill="currentColor" d="M17 9.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </G>
  </Svg>
)
export default SvgComponent
