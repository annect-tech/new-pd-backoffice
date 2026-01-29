let warned = false;

/**
 * Centraliza o baseUrl do backend.
 *
 * Importante:
 * - Se `VITE_API_URL` não estiver definido, o projeto cai no fallback histórico.
 * - Em dev/local, recomendamos SEMPRE configurar `VITE_API_URL` (ex: http://localhost:31535).
 */
export function getApiUrl(): string {
  const fromEnv = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  const url = fromEnv.trim() || "http://186.248.135.172:31535";

  if (!fromEnv.trim() && !warned) {
    warned = true;
    // eslint-disable-next-line no-console
    console.warn(
      `[API] VITE_API_URL não definido. Usando fallback: ${url}. ` +
        `Para apontar para seu backend local, crie um .env.local com VITE_API_URL=http://localhost:<PORT>.`
    );
  }

  return url;
}

