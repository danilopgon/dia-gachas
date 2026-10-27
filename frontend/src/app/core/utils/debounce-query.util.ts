/**
 * Espera para `debounced()`: una consulta válida espera `ms` antes de usarse;
 * la consulta vacía se aplica al momento para no mostrar resultados viejos.
 */
export const waitForQuery =
  (ms: number) =>
  (value: string): Promise<void> | undefined =>
    value ? new Promise(resolve => setTimeout(resolve, ms)) : undefined;
