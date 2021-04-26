import LatLon from 'geodesy/latlon-spherical.js'
import { Station } from '../services'

export function getDistance(p1: number[], p2: number[]) {
  // @ts-ignore
  const point1 = new LatLon(...p1)
  // @ts-ignore
  const point2 = new LatLon(...p2)
  return point1.distanceTo(point2) / 1000
}

export function closestObservationField(stations: Station[] | undefined, field: keyof Station): string | number {
  const withPhenomenons = stations?.filter((s) => s[field])
  const orderedStations = withPhenomenons?.sort((a, b) => a.distance - b.distance)
  return orderedStations?.length ? orderedStations[0][field] : ''
}

export function closestStationWithObservationField(stations: Station[] | undefined, field: keyof Station): Station {
  const withPhenomenons = stations?.filter((s) => s[field])
  const orderedStations = withPhenomenons?.sort((a, b) => a.distance - b.distance)
  return orderedStations?.[0] || ({} as Station)
}
