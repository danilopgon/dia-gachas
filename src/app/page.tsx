'use client';

import { Key, useEffect, useMemo, useState } from 'react';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import provinces from './constants/provinces.json';
import towns from './constants/towns.json';

export type Town = {
  code: string;
  label: string;
  parent_code: string;
  displayLabel: string;
};

export default function Home() {
  const [parsedTowns, setParsedTowns] = useState([] as Town[]);
  const [searchValue, setSearchValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTown, setSelectedTown] = useState('');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchValue) {
        const filteredTowns = towns.filter((town) =>
          town.label.toLowerCase().includes(searchValue.toLowerCase())
        );
        const parsedTowns = filteredTowns.map((town) => {
          const provinceName = provinces.find(
            (province) => province.code === town.parent_code
          )?.label;
          return {
            ...town,
            displayLabel: `${town.label}, ${provinceName}`,
          };
        });
        setParsedTowns(parsedTowns);
      } else {
        setParsedTowns([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  const handleTownChange = (value: string) => {
    setSearchValue(value);
    setInputValue(value);
  };

  const handleTownSelect = (value: Key) => {
    const [townName, provinceName] = String(value).split(', ');
    const newSelectedProvince =
      provinces.find((province) => province.label === provinceName)?.code || '';
    const newSelectedTown =
      towns.find((town) => town.label === townName)?.code || '';

    setSelectedProvince(newSelectedProvince);
    setSelectedTown(newSelectedTown);
    setInputValue(String(value));
  };

  const townOptions = useMemo(
    () =>
      parsedTowns.map((town, index) => (
        <AutocompleteItem key={town.displayLabel} value={town.displayLabel}>
          {town.displayLabel}
        </AutocompleteItem>
      )),
    [parsedTowns]
  );

  return (
    <main className='flex min-h-screen flex-col items-center justify-start p-24 gap-12'>
      <h1 className='text-6xl font-bold text-center'>
        ¡Bienvenido a El Gachametro!
      </h1>
      <p className='text-2xl text-center'>
        ¿Hace día de gachas? Comprueba la previsión del tiempo
      </p>

      <Autocomplete
        label='Escribe tu municipio'
        className='max-w-xs'
        listboxProps={{
          emptyContent: 'No hay resultados',
        }}
        inputValue={inputValue}
        allowsCustomValue={true}
        onInputChange={handleTownChange}
        onSelectionChange={handleTownSelect}
      >
        {townOptions}
      </Autocomplete>
    </main>
  );
}
