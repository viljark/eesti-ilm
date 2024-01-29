import axios from 'axios'
import iconv from 'iconv-lite'
import { Buffer } from 'buffer'

const parseString = require('react-native-xml2js').parseString

const RESPONSE_CHARSET = 'UTF-8'

export async function getObservations(): Promise<ObservationsResponse> {
  const response = await axios({
    method: 'get',
    url: 'https://www.ilmateenistus.ee/ilma_andmed/xml/observations.php',
    responseType: 'arraybuffer',
  })

  return xmlResponseToJson(iconv.decode(new Buffer(response.data), RESPONSE_CHARSET))
}

export async function getHourlyObservations(): Promise<HourlyObservation[]> {
  const response = await axios({
    method: 'get',
    url: 'https://ilmmicroservice.envir.ee/api/combinedWeatherData/mobileFrontPageWeatherToday?lang=est',
    responseType: 'json',
  })

  return response.data?.entries?.entry || []
}

export async function getForecast(): Promise<ForecastResponse> {
  const response = await axios({
    method: 'get',
    url: 'https://www.ilmateenistus.ee/ilma_andmed/xml/forecast.php',
    responseType: 'arraybuffer',
  })
  return xmlResponseToJson(iconv.decode(new Buffer(response.data), RESPONSE_CHARSET))
}

export async function getWarnings(): Promise<WarningsResponse> {
  let response
  try {
    response = await axios({
      method: 'get',
      url: 'https://www.ilmateenistus.ee/ilma_andmed/xml/hoiatus.php',
      responseType: 'arraybuffer',
    })
  } catch (e) {
    if (e.response) {
      response = e.response
    }
  }

  return xmlResponseToJson(iconv.decode(new Buffer(response.data), 'UTF-8'))
}

export async function getWarningForLocation(locationRegion: string | undefined): Promise<Warning | undefined> {
  if (!locationRegion) return
  const warningsResponse = await getWarnings()
  let warning = warningsResponse?.warnings?.warning
  let locationWarning
  if (warning) {
    if (Array.isArray(warning)) {
      const warnings = warning.filter((w) => {
        return w.area_eng.includes(locationRegion) || w.area_est.includes(locationRegion)
      })
      locationWarning = warning.find((w) => {
        return w.area_eng.includes(locationRegion) || w.area_est.includes(locationRegion)
      })
      if (locationWarning) {
        locationWarning.content_est = warnings
          .map((w) => w.content_est)
          .filter((v, i, a) => a.indexOf(v) === i)
          .reverse()
          .join('\n\n')
      }
    } else {
      if (warning.area_eng.includes(locationRegion) || warning.area_est.includes(locationRegion)) {
        locationWarning = warning
      }
    }

    return locationWarning
  }
}

function xmlResponseToJson(response: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(response, { explicitArray: false }, function (err, result) {
      if (err) {
        reject(err)
        return
      }
      if (result) {
        resolve(result)
      }
    })
  })
}

export async function getLocationByName(name: string): Promise<any> {
  const response = await axios.get('https://www.ilmateenistus.ee/wp-json/emhi/locationAutocomplete', {
    params: {
      location: name,
    },
  })
  return response.data?.data || []
}

export async function getDetailedForecast(coordinates: string): Promise<DetailedForecastResponse> {
  const response = await axios.get('https://www.ilmateenistus.ee/wp-content/themes/ilm2020/meteogram.php', {
    params: {
      coordinates,
    },
    responseType: 'json',
  })

  return response.data
}

export interface ObservationsResponse {
  observations: Observations
}

export interface Observations {
  $: _
  station: Station[]
}

export interface Station {
  airpressure: string
  airtemperature: string
  latitude: string
  longitude: string
  name: string
  phenomenon: string
  precipitations: string
  relativehumidity: string
  uvindex: string
  visibility: string
  waterlevel: string
  waterlevel_eh2000: string
  watertemperature: string
  winddirection: string
  windspeed: string
  windspeedmax: string
  wmocode: string
  distance: number
}

export interface _ {
  timestamp: string
}

export interface ForecastResponse {
  forecasts: Forecasts
}

interface Forecasts {
  forecast: Forecast[]
}

export interface Forecast {
  $: DateField
  night: Night
  day: Day
}

interface Day {
  phenomenon: string
  tempmin: string
  tempmax: string
  text: string
  place?: Place[]
  wind?: Wind[]
  sea?: string
  peipsi?: string
}

interface Night {
  phenomenon: string
  tempmin: string
  tempmax: string
  text: string
  place?: Place[]
  wind?: Wind[]
  sea?: string
  peipsi?: string
}

interface Wind {
  name: string
  direction: string
  speedmin: string
  speedmax: string
  gust: string
}

interface Place {
  name: string
  phenomenon: string
  tempmin: string
  tempmax: string
}

interface DateField {
  date: string
}

export interface Attributes {
  from: string
  to: string
}

export interface Attributes2 {
  className: string
  et: string
  en: string
  ru: string
}

export interface Phenomen {
  '@attributes': Attributes2
}

export interface Attributes3 {
  value: string
}

export interface Precipitation {
  '@attributes': Attributes3
}

export interface Attributes4 {
  deg: string
  name: string
  icon: string
}

export interface WindDirection {
  '@attributes': Attributes4
}

export interface Attributes5 {
  mps: string
}

export interface WindSpeed {
  '@attributes': Attributes5
}

export interface Attributes6 {
  unit: string
  value: string
}

export interface Temperature {
  '@attributes': Attributes6
}

export interface Attributes7 {
  value: string
}

export interface Pressure {
  '@attributes': Attributes7
}

export interface Time {
  '@attributes': Attributes
  phenomen: Phenomen
  precipitation: Precipitation
  windDirection: WindDirection
  windSpeed: WindSpeed
  temperature: Temperature
  pressure: Pressure
}

export interface Tabular {
  time: Time[]
}

export interface DetailedForecast {
  tabular: Tabular
}

export interface DetailedForecastResponse {
  location: string
  forecast: DetailedForecast
}

export interface Warning {
  timestamp: number
  area_est: string
  area_eng: string
  content_est: string
  content_eng: string
}

export interface Warnings {
  warning: Warning[] | Warning
}

export interface WarningsResponse {
  warnings: Warnings
}

export interface HourlyObservations {
  entries: Entries
}

export interface Entries {
  entry: HourlyObservation[]
}

export interface HourlyObservation {
  uvindex: null | string
  LaiusMinut: string
  Time: Date
  paring: string
  wl1ha: null | string
  /**
   * phenomenon EE
   */
  pw15maEst: null | string
  tuulekylm: null | string
  rhins: null | string
  /**
   * phenomenon EN
   */
  pw15maEng: null | string
  kuumaindeks: null | string
  pw15maRus: null | string
  tains_aeg: Date | null
  Jaam: string
  LaiusSekund: string
  wl1ha_bk77: null | string
  ws1hx: null | string
  pr1hs: null | string
  station_id: string
  LaiusKraad: string
  wd10ma: null | string
  county_ehak: null | string
  PikkusMinut: string
  wt1ha: null | string
  /**
   * temperature
   */
  tains: null | string
  ws10ma: null | string
  ws10ma_aeg: Date | null
  PikkusKraad: string
  qffins: null | string
  vis1ma: null | string
  PikkusSekund: string
  pr1hs_aeg: Date | null
  latitude: number
  longitude: number
  sunrise_utc: Date
  sunset_utc: Date
  sunrise: Date
  sunset: Date
  feels_like: null | string
  distance?: number
}
