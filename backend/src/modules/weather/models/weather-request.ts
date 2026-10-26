/** Cuerpo de `POST /weather`: el código de municipio partido en provincia y localidad. */
export interface WeatherRequest {
  townCode: string;
  provinceCode: string;
}
