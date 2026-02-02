let warned = false;

/**
 * Centraliza o baseUrl do backend.
 *
 * Importante:
 * - Em dev/local, recomendamos SEMPRE configurar `VITE_API_URL` (ex: http://localhost:31535).
 */
export function getApiUrl(): string {
  const fromEnv = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").trim();

  if (!fromEnv && !warned) {
    warned = true;
    // eslint-disable-next-line no-console
    console.warn(
      "[API] VITE_API_URL não definido. " +
        "Defina VITE_API_URL em um arquivo .env.local (ex: VITE_API_URL=http://localhost:<PORT>)."
    );
  }

  return fromEnv;
}

