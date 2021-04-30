import { getUserLocalDate, monthNames } from './dateUtil'

export const dayNames = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev']

export function getDayName(input: string) {
  const date = getUserLocalDate(input)
  return dayNames[date.getDay()]
}

export function getDate(input: string) {
  const date = getUserLocalDate(input)
  return date.getDate() + '. ' + monthNames[date.getMonth()]
}

export function getDayNameShort(input: string) {
  return getDayName(input)[0].toUpperCase()
}

export function formatHours(date: Date) {
  let hours = date.getHours()

  if (hours < 10) {
    return '0' + hours
  }
  return String(hours)
}

export function getFormattedTime(timestamp: number) {
  if (!timestamp) {
    return ''
  }
  const date = new Date(timestamp)
  return addZeroBefore(date.getHours()) + ':' + addZeroBefore(date.getMinutes())
}

export function getFormattedDateTime(timestamp: number) {
  if (!timestamp) {
    return ''
  }
  const date = new Date(timestamp)
  return `${date.getDate()}. ${monthNames[date.getMonth()]}, ${getFormattedTime(timestamp)}`
}

function addZeroBefore(n: number) {
  return (n < 10 ? '0' : '') + n
}
