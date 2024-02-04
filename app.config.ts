import { ConfigContext, ExpoConfig } from '@expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Eesti ilm',
  slug: 'eesti-ilm',
  privacy: 'public',
  platforms: ['android'],
  version: '3.0.4',
  orientation: 'portrait',
  icon: './assets/icon-bg.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'cover',
    backgroundColor: '#ffffff',
  },
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 5 * 1000,
    url: 'https://u.expo.dev/ed6360c0-8c0c-11e9-9d21-bb29f9d51c79',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
  },
  jsEngine: 'hermes',
  android: {
    playStoreUrl: 'https://play.google.com/store/apps/details?id=ee.viljark.eestiilm',
    googleServicesFile: './google-services.json',
    package: 'ee.viljark.eestiilm',
    versionCode: 34,
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
  notification: {
    icon: './assets/icon-notification.png',
  },
  description:
    'An Expo/React Native app for Estonian weather Created using www.ilmateenistus.ee API details: https://www.ilmateenistus.ee/teenused/ilmainfo/eesti-vaatlusandmed-xml/ Icons made by Freepik from www.flaticon.com is licensed by CC 3.0 BY',
  githubUrl: 'https://github.com/viljark/eesti-ilm',
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: 'viljar-kargenberg',
          project: 'eesti-ilm',
          authToken: 'd420fd34a9a540a1ae67b8bb1e7f72982ba7af8c5d31447699b1aaaef09730eb',
        },
      },
    ],
  },
  extra: {
    eas: {
      projectId: 'ed6360c0-8c0c-11e9-9d21-bb29f9d51c79',
    },
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  plugins: [
    'sentry-expo',
    [
      'expo-build-properties',
      {
        android: {
          extraMavenRepos: ['../../node_modules/@notifee/react-native/android/libs'],
        },
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
