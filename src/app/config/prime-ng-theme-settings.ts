import Lara from '@primeng/themes/lara';
import { definePreset } from '@primeng/themes';

const theme = definePreset(Lara, {
  semantic: {
    primary: {
      '50': '#fdf5ef',
      '100': '#fbe7d9',
      '200': '#f5ccb3',
      '300': '#eea983',
      '400': '#eea983',
      '500': '#e98961',
      '600': '#e15b2e',
      '700': '#af331f',
      '800': '#8c2a20',
      '900': '#71261d',
      '950': '#3d110d',
    },
  },
  extend: {
    accent: {
      color: '#94aa8b',
    },
  },
});

export const primeNGThemeSettings = {
  theme: {
    preset: theme,
    options: {
      darkModeSelector: false,
    },
  },
  ripple: true,
};
