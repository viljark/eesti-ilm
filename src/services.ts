import axios from "axios";
import iconv from 'iconv-lite';
import { Buffer } from 'buffer';

const parseString = require('react-native-xml2js').parseString;

const RESPONSE_CHARSET = "ISO-8859-15";

export async function getObservations(): Promise<ObservationsResponse> {
  const response = await axios({
    method: 'get',
    url: 'https://www.ilmateenistus.ee/ilma_andmed/xml/observations.php',
    responseType: 'arraybuffer'
  });

  return xmlResponseToJson(iconv.decode(new Buffer(response.data), RESPONSE_CHARSET));
}

export async function getForecast(): Promise<ForecastResponse> {
  const response = await axios({
    method: 'get',
    url: 'https://www.ilmateenistus.ee/ilma_andmed/xml/forecast.php',
    responseType: 'arraybuffer'
  });

  return xmlResponseToJson(iconv.decode(new Buffer(response.data), RESPONSE_CHARSET));
}

function xmlResponseToJson(response: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(response, {explicitArray : false}, function (err, result) {
      if (err) {
        reject(err);
        return;
      }
      if (result) {
        resolve(result);
      }
    });
  });
}

export interface ObservationsResponse {
  observations: Observations;
}

export interface Observations {
  '$': _;
  station: Station[];
}

export interface Station {
  airpressure: string;
  airtemperature: string;
  latitude: string;
  longitude: string;
  name: string;
  phenomenon: string;
  precipitations: string;
  relativehumidity: string;
  uvindex: string;
  visibility: string;
  waterlevel: string;
  waterlevel_eh2000: string;
  watertemperature: string;
  winddirection: string;
  windspeed: string;
  windspeedmax: string;
  wmocode: string;
  distance: number;
}

export interface _ {
  timestamp: string;
}

export interface ForecastResponse {
  forecasts: Forecasts;
}

interface Forecasts {
  forecast: Forecast[];
}

interface Forecast {
  '$': DateField;
  night: Night;
  day: Day;
}

interface Day {
  phenomenon: string;
  tempmin: string;
  tempmax: string;
  text: string;
  place?: Place[];
  wind?: Wind[];
  sea?: string;
  peipsi?: string;
}

interface Night {
  phenomenon: string;
  tempmin: string;
  tempmax: string;
  text: string;
  place?: Place[];
  wind?: Wind[];
  sea?: string;
  peipsi?: string;
}

interface Wind {
  name: string;
  direction: string;
  speedmin: string;
  speedmax: string;
  gust: string;
}

interface Place {
  name: string;
  phenomenon: string;
  tempmin: string;
  tempmax: string;
}

interface DateField {
  date: string;
}