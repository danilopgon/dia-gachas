import { DestroyRef, inject, Signal, signal } from '@angular/core';

/**
 * La preferencia de movimiento reducido, también si cambia con la página abierta.
 * Debe llamarse en un contexto de inyección.
 */
export function reducedMotion(): Signal<boolean> {
  const query =
    typeof window === 'undefined' ? undefined : window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reduced = signal(query?.matches ?? false);
  const onChange = (event: MediaQueryListEvent) => reduced.set(event.matches);
  query?.addEventListener?.('change', onChange);
  inject(DestroyRef).onDestroy(() => query?.removeEventListener?.('change', onChange));
  return reduced.asReadonly();
}
