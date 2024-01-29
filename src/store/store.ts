import { proxy, useSnapshot } from 'valtio'
import { HourlyObservation } from '../services'

interface Store {
  isSwipeEnabled: boolean
  hourlyObservations: HourlyObservation[]
}
export const store = proxy<Store>({ isSwipeEnabled: true, hourlyObservations: [] })
