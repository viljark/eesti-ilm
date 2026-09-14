import { ConfigContext, ExpoConfig } from '@expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Eesti ilm',
  slug: 'eesti-ilm',
  platforms: ['android'],
  version: '3.0.8',
  orientation: 'portrait',
  icon: './assets/icon-bg.png',
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 5 * 1000,
    url: 'https://u.expo.dev/ed6360c0-8c0c-11e9-9d21-bb29f9d51c79',
  },
  android: {
    playStoreUrl: 'https://play.google.com/store/apps/details?id=ee.viljark.eestiilm',
    googleServicesFile: './google-services.json',
    package: 'ee.viljark.eestiilm',
    versionCode: 38,
    adaptiveIcon: {
      backgroundImage: './assets/bg.png',
      foregroundImage: './assets/icon.png',
      backgroundColor: '#56a7cd',
    },
    permissions: ['ACCESS_FINE_LOCATION'],
    config: {
      googleMaps: {
        apiKey: process.env.FIREBASE_API_KEY,
      },
    },
  },
  description:
    'An Expo/React Native app for Estonian weather Created using www.ilmateenistus.ee API details: https://www.ilmateenistus.ee/teenused/ilmainfo/eesti-vaatlusandmed-xml/ Icons made by Freepik from www.flaticon.com is licensed by CC 3.0 BY',
  githubUrl: 'https://github.com/viljark/eesti-ilm',
  extra: {
    eas: {
      projectId: 'ed6360c0-8c0c-11e9-9d21-bb29f9d51c79',
    },
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  plugins: [
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        organization: 'viljar-kargenberg',
        project: 'eesti-ilm',
      },
    ],
    'expo-asset',
    'expo-background-task',
    'expo-font',
    'expo-image',
    'expo-status-bar',
    'expo-web-browser',
    [
      'expo-splash-screen',
      {
        image: './assets/splash.png',
        resizeMode: 'cover',
        backgroundColor: '#ffffff',
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/crashlytics',
    '@react-native-firebase/perf',
    // @ts-ignore
    './plugins/withNotificationIcons.js',
    './plugins/withUseLegacyPackaging.js',
  ],
})
