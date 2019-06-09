import LatLon from 'geodesy/latlon-spherical.js';
import { Station } from './services';

const p1 = new LatLon(50.06632, -5.71475);
const p2 = new LatLon(58.64402, -3.07009);
const d = p1.distanceTo(p2);

export function getDistance(p1: number[], p2: number[]) {
  // @ts-ignore
  const point1 = new LatLon(...p1);
  // @ts-ignore
  const point2 = new LatLon(...p2);
  return point1.distanceTo(point2) / 1000;
}

export function closestObservationField(stations: Station[], field: keyof Station): string | number {
  const withPhenomenons = stations.filter((s) => s[field]);
  const orderedStations = withPhenomenons.sort((a, b) => a.distance - b.distance);
  console.log(orderedStations);
  return orderedStations.length ? orderedStations[0][field] : '';
}