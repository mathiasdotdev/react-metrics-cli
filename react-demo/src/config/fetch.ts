export const DEFAULT_TIMEOUT = 10000;

interface FetchOptions {
  timeout: number;
}

async function appFetch(
  url: string,
  options: FetchOptions = { timeout: DEFAULT_TIMEOUT },
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  const response = await fetch(url, { ...options, signal: controller.signal });
  clearTimeout(timeoutId);
  return response;
}
