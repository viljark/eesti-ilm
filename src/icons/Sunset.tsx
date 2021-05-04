import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

function SvgComponent(props) {
  return (
    <Svg height={512} viewBox="0 0 512 512" width={512} {...props}>
      <Path d="M241 114.954h30v111h-30zM412.279 397.952C404.702 318.393 337.51 255.954 256 255.954s-148.702 62.44-156.279 141.999H0v30h512v-30h-99.721zM256 285.954c64.954 0 118.675 49.013 126.119 111.999H129.881c7.444-62.986 61.165-111.999 126.119-111.999zM63.667 457.952h384.667v30H63.667z" />
      <Path d="M33.794 300.29h30v69.001h-30z" transform="rotate(-69.34 48.777 334.673)" />
      <Path d="M155.591 174.112h30v69.001h-30z" transform="rotate(-22.7 170.361 208.393)" />
      <Path d="M306.908 193.612h69.001v30h-69.001z" transform="rotate(-67.3 341.358 208.511)" />
      <Path d="M428.705 319.791h69.001v30h-69.001z" transform="rotate(-20.66 463.048 334.675)" />
      <Path d="M69.528 185.98h30v111h-30z" transform="rotate(-45 84.49 241.514)" />
      <Path d="M371.972 226.48h111v30h-111z" transform="rotate(-45 427.461 241.576)" />
      <Path d="M464.477 148.701l45.989-45.988L489.253 81.5l-20.383 20.382V29.351h-30v72.531l-20.698-20.698-21.213 21.213 46.305 46.304z" />
    </Svg>
  )
}

export default SvgComponent
