import React from 'react';



const phenomenonMap = {
  'Clear': 'Selge',
  'Few clouds': 'Vähene pilvisus',
  'Variable clouds': 'Poolpilves',
  'Cloudy with clear spells': 'Peamiselt pilves',
  'Overcast': 'Pilves',
  'Light snow shower': 'Nõrk hooglumi',
  'Moderate snow shower': 'Mõõdukas hooglumi',
  'Heavy snow shower': 'Tugev hooglumi',
  'Light shower': 'Nõrk hoovihm',
  'Moderate shower': 'Mõõdukas hoovihm',
  'Heavy shower': 'Tugev hoovihm',
  'Light rain': 'Nõrk vihm',
  'Moderate rain': 'Mõõdukas vihm',
  'Heavy rain': 'Tugev vihm',
  'Glaze': 'Jäide',
  'Light sleet': 'Nõrk lörtsisadu',
  'Moderate sleet': 'Mõõdukas lörtsisadu',
  'Light snowfall': 'Nõrk lumesadu',
  'Moderate snowfall': 'Mõõdukas lumesadu',
  'Heavy snowfall': 'Tugev lumesadu',
  'Blowing snow': 'Üldtuisk',
  'Drifting snow': 'Pinnatuisk',
  'Hail': 'Rahe',
  'Mist': 'Uduvine',
  'Fog': 'Udu',
  'Thunder': 'Äike',
  'Thunderstorm': 'Äikesevihm',
};


export function getIcon(phenomenon: string): React.ReactElement {
  return null;
}

export function getPhenomenonText(phenomenon: string): string {
  if (!phenomenon) {
    return 'pole saadaval';
  }
  const phenomenonText = phenomenonMap[phenomenon];
  return phenomenonText ? phenomenonText : 'pole saadaval';
}