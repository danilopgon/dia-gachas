export const AEMET_BULK_URL =
  'https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/todos';

export type AemetFailure =
  'unauthorized' | 'rate-limited' | 'not-found' | 'transient' | 'invalid';

export class AemetBulkError extends Error {
  constructor(
    readonly kind: AemetFailure,
    message: string,
  ) {
    super(message);
    this.name = 'AemetBulkError';
  }
}

const TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
const MAX_RATE_LIMIT_ATTEMPTS = 2;
const RETRY_DELAYS_MS = [5_000, 15_000];

// AEMET devuelve a veces HTTP 200 con el error real en `estado`.
function failureFromStatus(status: number): AemetFailure | null {
  if (status >= 200 && status < 300) return null;
  if (status === 401 || status === 403) return 'unauthorized';
  if (status === 404) return 'not-found';
  if (status === 429) return 'rate-limited';
  if (status >= 500) return 'transient';
  return 'invalid';
}

/** Descarga el agregado de predicciones diarias de todos los municipios (un tar.gz). */
export class AemetBulkClient {
  constructor(
    private readonly apiKey: string,
    private readonly fetchFn: typeof fetch = fetch,
    private readonly sleep: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
  ) {}

  async download(): Promise<Buffer> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.tryDownload();
      } catch (error) {
        const failure = this.toBulkError(error);
        const maxAttempts =
          failure.kind === 'transient'
            ? MAX_ATTEMPTS
            : failure.kind === 'rate-limited'
              ? MAX_RATE_LIMIT_ATTEMPTS
              : 1;
        if (attempt >= maxAttempts) throw failure;
        await this.sleep(RETRY_DELAYS_MS[attempt - 1]);
      }
    }
  }

  private async tryDownload(): Promise<Buffer> {
    const response = await this.fetchFn(AEMET_BULK_URL, {
      headers: { api_key: this.apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const httpFailure = failureFromStatus(response.status);
    if (httpFailure) {
      throw new AemetBulkError(
        httpFailure,
        `AEMET respondió HTTP ${response.status}`,
      );
    }

    let body: { estado?: number; descripcion?: string; datos?: string };
    try {
      body = await response.json();
    } catch {
      throw new AemetBulkError('invalid', 'La respuesta de AEMET no es JSON');
    }
    const stateFailure = failureFromStatus(Number(body.estado ?? 200));
    if (stateFailure) {
      throw new AemetBulkError(
        stateFailure,
        `AEMET: ${body.estado} ${body.descripcion ?? ''}`.trim(),
      );
    }
    if (!body.datos)
      throw new AemetBulkError('invalid', 'AEMET no devolvió la URL de datos');

    const data = await this.fetchFn(body.datos, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!data.ok) {
      throw new AemetBulkError(
        data.status >= 500 ? 'transient' : 'invalid',
        `La descarga de datos respondió HTTP ${data.status}`,
      );
    }
    return Buffer.from(await data.arrayBuffer());
  }

  private toBulkError(error: unknown): AemetBulkError {
    if (error instanceof AemetBulkError) return error;
    // Red caída, DNS o timeout: transitorio.
    const name = (error as Error)?.name;
    if (
      error instanceof TypeError ||
      name === 'AbortError' ||
      name === 'TimeoutError'
    ) {
      return new AemetBulkError(
        'transient',
        `Fallo de red con AEMET: ${(error as Error).message}`,
      );
    }
    return new AemetBulkError(
      'invalid',
      `Error inesperado con AEMET: ${String(error)}`,
    );
  }
}
