import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

function SvgComponent(props) {
  return (
    <Svg viewBox="0 0 28 28" {...props}>
      <Path d="M27.365 12.675L25.48 11.16a3.664 3.664 0 01-1.353-3.267l.261-2.406a1.7 1.7 0 00-1.873-1.873l-2.406.262a3.665 3.665 0 01-3.267-1.353L15.325.635A1.692 1.692 0 0014 0c-.517 0-1 .231-1.324.635l-1.517 1.887a3.665 3.665 0 01-2.385 1.342.67.67 0 10.177 1.33 5 5 0 003.254-1.832l1.516-1.887a.357.357 0 01.558 0l1.516 1.887a5 5 0 004.458 1.847l2.406-.262a.357.357 0 01.394.394l-.262 2.406a5 5 0 001.847 4.458l1.887 1.516a.357.357 0 010 .558l-1.887 1.516a5 5 0 00-1.847 4.458l.262 2.406a.357.357 0 01-.394.394l-2.406-.262a5 5 0 00-4.458 1.847l-1.516 1.887a.352.352 0 01-.279.133.352.352 0 01-.279-.133l-1.516-1.887a4.999 4.999 0 00-4.458-1.847l-2.406.262a.351.351 0 01-.292-.102.352.352 0 01-.102-.292l.261-2.406a5 5 0 00-1.846-4.458L1.475 14.28A.352.352 0 011.342 14c0-.064.017-.185.133-.279l1.887-1.516a5 5 0 001.846-4.458l-.261-2.406a.353.353 0 01.102-.292c.192-.19.418-.06.618-.067a.67.67 0 10.145-1.334c-.144.01-.997-.262-1.712.453-.365.365-.543.87-.487 1.385l.262 2.406A3.664 3.664 0 012.52 11.16L.635 12.675A1.691 1.691 0 000 14c0 .518.231 1 .635 1.325L2.52 16.84a3.664 3.664 0 011.354 3.267l-.262 2.406c-.056.515.122 1.02.488 1.386.366.366.87.543 1.385.487l2.406-.262a3.665 3.665 0 013.267 1.354l1.516 1.886C13 27.77 13.482 28 14 28c.518 0 1-.231 1.325-.635l1.516-1.886a3.664 3.664 0 013.267-1.354l2.406.262a1.7 1.7 0 001.873-1.873l-.261-2.406a3.664 3.664 0 011.353-3.267l1.886-1.516a1.7 1.7 0 000-2.65z" />
      <Path d="M14 22.143c4.49 0 8.143-3.653 8.143-8.143S18.49 5.857 14 5.857 5.856 9.51 5.856 14 9.51 22.143 14 22.143zm0-14.945A6.81 6.81 0 0120.802 14 6.81 6.81 0 0114 20.802 6.81 6.81 0 017.198 14 6.81 6.81 0 0114 7.198z" />
      <Path d="M10.835 16.74h.533c1.03 0 1.87-.839 1.87-1.87v-2.939a.67.67 0 10-1.343 0v2.94c0 .29-.236.527-.527.527h-.533a.528.528 0 01-.527-.528v-2.939a.67.67 0 10-1.342 0v2.94c0 1.03.838 1.869 1.87 1.869zM15.856 15.963a.935.935 0 00.89.628.936.936 0 00.89-.628l1.36-3.806a.67.67 0 10-1.264-.451l-.986 2.76-.986-2.76a.671.671 0 00-1.264.451l1.36 3.806z" />
    </Svg>
  )
}

export default SvgComponent