import * as React from 'react'
import Svg, { SvgProps, Path, Circle } from 'react-native-svg'
const SvgComponent = (props: SvgProps) => (
  <Svg width={512} height={512} viewBox="0 0 32 32" {...props}>
    <Path d="M30 18h-6a2.002 2.002 0 0 1-2-2V6a2.002 2.002 0 0 1 2-2h6v2h-6v10h6Z" />
    <Circle cx={18} cy={4} r={2} />
    <Path d="M10 20.184V12H8v8.184a3 3 0 1 0 2 0Z" />
    <Path d="M9 30a6.993 6.993 0 0 1-5-11.89V7a5 5 0 0 1 10 0v11.11A6.993 6.993 0 0 1 9 30ZM9 4a3.003 3.003 0 0 0-3 3v11.983l-.332.299a5 5 0 1 0 6.664 0L12 18.983V7a3.003 3.003 0 0 0-3-3Z" />
  </Svg>
)
export default SvgComponent
