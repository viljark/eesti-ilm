import { Paths } from 'expo-file-system'

/**
 * Absolute filesystem path for react-native-maps' UrlTile offline cache.
 *
 * expo-file-system hands back `file://` URIs (Paths.cache is built from
 * `Uri.fromFile(cacheDirectory)`), and MapUrlTile.setTileCachePath forwards the
 * raw prop to MapTileProvider instead of its own URL-normalized copy, so the
 * provider ends up doing `new File('file:///data/.../5/10/3')`, which never
 * resolves and the cache silently never hits. Strip the scheme to get a plain
 * path the provider can actually use.
 */
export function tileCachePathFor(kind: 'dark' | 'light'): string {
  return Paths.join(Paths.cache, `mapbox-${kind}`)
    .toString()
    .replace(/^file:\/\//, '')
    .replace(/\/+$/, '')
}
