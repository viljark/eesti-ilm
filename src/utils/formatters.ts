export const dayNames = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];

export function getDayName(input: string) {
  const date = new Date(input);
  return dayNames[date.getDay()];
}

export function getDayNameShort(input: string) {
  return getDayName(input)[0].toUpperCase();
}
