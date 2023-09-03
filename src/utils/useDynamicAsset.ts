import { useEffect, useState } from 'react'
import { Asset } from 'expo-asset'

export function useDynamicAssets(moduleIds: number | number[]): [Asset[] | undefined, Error | undefined] {
  const [assets, setAssets] = useState<Asset[]>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    Asset.loadAsync(moduleIds).then(setAssets).catch(setError)
  }, [moduleIds])

  return [assets, error]
}
