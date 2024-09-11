'use client';

import { NextUIProvider } from '@nextui-org/react';
import { useEffect, useState } from 'react';

export const UIProvider = ({ children }: any) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <NextUIProvider>{children}</NextUIProvider> : <></>;
};
