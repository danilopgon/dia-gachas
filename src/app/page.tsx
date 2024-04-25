'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import provinces from './constants/provinces.json';
import towns from './constants/towns.json';

export default function Home() {
  const queryClient = useQueryClient();

  const [parsedProvinces, setParsedProvinces] = useState(
    [] as typeof provinces
  );
  const [parsedTowns, setParsedTowns] = useState([] as typeof towns);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTown, setSelectedTown] = useState('');

  useEffect(() => {
    setParsedProvinces(
      provinces.sort((a, b) => a.label.localeCompare(b.label))
    );
  }, []);

  const handleProvinceChange = (value: string) => {
    if (value) {
      const provinceName = value as string;
      const newSelectedProvince =
        provinces.find((province) => province.label === provinceName)?.code ||
        '';
      setSelectedProvince(newSelectedProvince);

      const filteredTowns = towns
        .filter((town) => town.parent_code === newSelectedProvince)
        .sort((a, b) => a.label.localeCompare(b.label));
      setParsedTowns(filteredTowns);
    }
  };

  const handleTownChange = (value: string) => {
    if (value) {
      const townName = value as string;
      const newSelectedTown =
        towns.find((town) => town.label === townName)?.code || '';
      setSelectedTown(newSelectedTown);
    }
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-start p-24 gap-12'>
      <h1 className='text-6xl font-bold text-center'>
        ¡Bienvenido a El Gachametro!
      </h1>
      <p className='text-2xl text-center'>
        ¿Hace día de gachas? Comprueba la previsión del tiempo
      </p>

      <Autocomplete
        label='Provincias'
        className='max-w-xs'
        listboxProps={{
          emptyContent: 'No hay resultados',
        }}
        onInputChange={handleProvinceChange}
      >
        {parsedProvinces.map((province) => (
          <AutocompleteItem key={province.code} value={province.code}>
            {province.label}
          </AutocompleteItem>
        ))}
      </Autocomplete>

      <Autocomplete
        label='Municipios'
        className='max-w-xs'
        listboxProps={{
          emptyContent: 'No hay resultados',
        }}
        onInputChange={handleTownChange}
      >
        {parsedTowns.map((town) => (
          <AutocompleteItem key={town.label} value={town.code}>
            {town.label}
          </AutocompleteItem>
        ))}
      </Autocomplete>
    </main>
  );
}
