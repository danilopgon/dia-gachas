'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import provinces from './constants/provinces.json';
import towns from './constants/towns.json';

export default function Home() {
  // const queryClient = useQueryClient();

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

  useEffect(() => {
    if (selectedProvince) {
      const filteredTowns = towns.filter(
        (town) => town.parent_code === selectedProvince
      ).sort((a, b) => a.label.localeCompare(b.label));
      setParsedTowns(filteredTowns);
    }
  }, [selectedProvince]);

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <h1 className='text-6xl font-bold text-center'>
        ¡Bienvenido a El Gachametro!
      </h1>
      <p className='text-2xl text-center'>
        ¿Hace día de gachas? Comprueba la previsión del tiempo
      </p>
      <select
        name='province'
        id='province'
        className='w-1/2 p-4'
        onChange={(e) => {
          setSelectedProvince(e.target.value);
        }}
      >
        <option value=''>Selecciona una provincia</option>
        {parsedProvinces.map((province) => (
          <option key={province.code} value={province.code}>
            {province.label}
          </option>
        ))}
      </select>
      <select
        name='town'
        id='town'
        className='w-1/2 p-4'
        onChange={(e) => {
          setSelectedTown(e.target.value);
        }}
      >
        <option value=''>Selecciona un municipio</option>
        {parsedTowns.map((town) => (
          <option key={town.code} value={town.code}>
            {town.label}
          </option>
        ))}
      </select>
    </main>
  );
}
