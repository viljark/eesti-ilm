const parseString = require('react-native-xml2js').parseString;

export async function getObservations(): Promise<ObservationsResponse> {
  const textResponse = await fetch('http://www.ilmateenistus.ee/ilma_andmed/xml/observations.php').then((result) => result.text());
  return xmlResponseToJson(textResponse);

}


function xmlResponseToJson(response: string): Promise<ObservationsResponse> {
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