import LatLon from 'geodesy/latlon-spherical.js'
import { HourlyObservation, Station } from '../services'

export function getDistance(p1: number[], p2: number[]) {
  // @ts-ignore
  const point1 = new LatLon(...p1)
  // @ts-ignore
  const point2 = new LatLon(...p2)
  return point1.distanceTo(point2) / 1000
}

export function closestObservationField<T extends keyof Station>(stations: Station[] | undefined, field: T): Station[T] | undefined {
  const withPhenomenons = stations?.filter((s) => s[field])
  const orderedStations = withPhenomenons?.sort((a, b) => a.distance - b.distance)
  return orderedStations?.length ? orderedStations[0][field] : undefined
}

export function closestStationWithObservationField(stations: Station[] | undefined, field: keyof Station): Station {
  const withPhenomenons = stations?.filter((s) => s[field])
  const orderedStations = withPhenomenons?.sort((a, b) => a.distance - b.distance)
  return orderedStations?.[0] || ({} as Station)
}

export function closestHourlyObservationField<T extends keyof HourlyObservation>(stations: HourlyObservation[] | undefined, field: T): HourlyObservation[T] | undefined {
  const withPhenomenons = stations?.filter((s) => s[field])
  const orderedStations = withPhenomenons?.sort((a, b) => a.distance - b.distance)
  return orderedStations?.length ? orderedStations[0][field] : undefined
}

export function closestHourlyStationWithObservationField(stations: HourlyObservation[] | undefined, field: keyof HourlyObservation): HourlyObservation {
  const withPhenomenons = stations?.filter((s) => s[field])
  const orderedStations = withPhenomenons?.sort((a, b) => a.distance - b.distance)
  return orderedStations?.[0] || ({} as HourlyObservation)
}
