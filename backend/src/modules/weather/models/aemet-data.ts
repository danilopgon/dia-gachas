export interface AemetData {
  origen: Origen;
  elaborado: Date;
  nombre: string;
  provincia: string;
  prediccion: Prediccion;
  id: number;
  version: number;
}

export interface Origen {
  productor: string;
  web: string;
  enlace: string;
  language: string;
  copyright: string;
  notaLegal: string;
}

export interface Prediccion {
  dia: Dia[];
}

export interface Dia {
  probPrecipitacion: ProbPrecipitacion[];
  cotaNieveProv: CotaNieveProv[];
  estadoCielo: EstadoCielo[];
  viento: Viento[];
  rachaMax: CotaNieveProv[];
  temperatura: HumedadRelativa;
  sensTermica: HumedadRelativa;
  humedadRelativa: HumedadRelativa;
  uvMax?: number;
  fecha: Date;
}

export interface CotaNieveProv {
  value: string;
  periodo?: string;
}

export interface EstadoCielo {
  value: string;
  periodo?: string;
  descripcion: string;
}

export interface HumedadRelativa {
  maxima: number;
  minima: number;
  dato: Dato[];
}

export interface Dato {
  value: number;
  hora: number;
}

export interface ProbPrecipitacion {
  value: number;
  periodo?: string;
}

export interface Viento {
  direccion: string;
  velocidad: number;
  periodo?: string;
}
