import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const baseMessage =
      'No deberías estar aquí, pero aquí tienes una curiosidad sobre animales: ';
    const trivia: string[] = [
      'Los patos tienen acentos diferentes según su región 🦆',
      'En Júpiter y Saturno puede llover diamantes 💎',
      "El 'hola' más largo de la historia fue transmitido por una ballena jorobada durante más de 24 horas 🐋",
      'Los pulpos tienen tres corazones, pero dos de ellos se detienen cuando nadan ❤️',
      "Un grupo de flamencos se llama 'flamboyance' en inglés 🦩",
      'Las huellas dactilares de los koalas son tan parecidas a las humanas que pueden confundir a los detectives 🐨',
      'En promedio, un ser humano pasa seis meses de su vida esperando que los semáforos cambien a verde 🚦',
      'Las abejas pueden reconocer rostros humanos, como si usaran un reconocimiento facial natural 🐝',
      "En 1997, un chatbot llamado 'Eliza' engañó a usuarios haciéndoles creer que era un terapeuta humano 🤖",
      'Las nutrias marinas se toman de las manos mientras duermen para no separarse 🦦',
      'Los cangrejos violinistas agitan una de sus pinzas gigantes para atraer pareja. Si la pierden, les crece una nueva 🦀',
      'En el espacio no puedes llorar porque las lágrimas no caen, simplemente se quedan en tus ojos 🌌',
      'El chasquido de tus dedos es en realidad causado por el choque del dedo contra la palma, no por el sonido de la fricción 🤌',
      'Los corales son animales, no plantas, y algunos pueden vivir miles de años 🪸',
      'Los gatos no pueden saborear cosas dulces 🐱',
      "La tierra huele a lluvia después de llover debido a una bacteria llamada 'actinobacteria' 🌧️",
      'Las tortugas pueden respirar por su trasero 🐢',
      'En Escocia, existe una oveja llamada Dolly que fue el primer mamífero clonado con éxito 🐑',
      'Los caracoles pueden dormir hasta tres años si las condiciones no son favorables 🐌',
    ];

    const randomIndex = Math.floor(Math.random() * trivia.length);

    return `${baseMessage}${trivia[randomIndex]}`;
  }
}
