import * as React from 'react'
import Svg, { SvgProps, Path } from 'react-native-svg'
const SvgComponent = (props: SvgProps) => (
  <Svg width={800} height={800} viewBox="0 0 24 24" {...props}>
    <Path strokeLinecap="round" fill={'transparent'} strokeLinejoin="round" d="m20 20-5.05-5.05m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9ZM7 10h6" />
  </Svg>
)
export default SvgComponent
