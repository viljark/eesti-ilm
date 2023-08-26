import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

export const useAppState = (onFocus: () => void, onBackground?: () => void, runOnStartup: boolean | undefined = false) => {
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        onFocus()
        console.log('focus')
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        onBackground?.()
        console.log('bg')
      }

      appState.current = nextAppState
    })

    if (runOnStartup) {
      onFocus()
    }

    return () => {
      subscription?.remove()
    }
  }, [])
}
