import { proxy, useSnapshot } from 'valtio'

export const store = proxy({ isSwipeEnabled: true })
