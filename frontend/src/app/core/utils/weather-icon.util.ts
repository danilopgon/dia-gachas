const iconKeywords = {
  sun: ['despejado', 'soleado'],
  cloud: ['nub', 'cubierto', 'chubasc', 'niebla', 'nublado', 'viento', 'rachas', 'vendaval'],
  rain: ['lluvia', 'chubasc', 'lluv'],
  storm: ['torment', 'granizo', 'rayos'],
  snow: ['nieve', 'nev', 'nevará', 'nevada'],
} as const;

export const iconMap = {
  sun: 'icon-sun.webp',
  cloud: 'icon-cloud.webp',
  rain: 'icon-rain.webp',
  storm: 'icon-storm.webp',
  snow: 'icon-snow.webp',
} as const;

type WeatherIcon = keyof typeof iconKeywords;

export function getWeatherIcon(description: string): WeatherIcon {
  const lowerDesc = description.toLowerCase();

  for (const [icon, keywords] of Object.entries(iconKeywords)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return icon as WeatherIcon;
    }
  }

  return 'sun';
}
