/**
 * Fetch with timeout and retry logic
 * Handles long-running API calls with proper error messages
 */

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Fetch with automatic timeout and retry logic
 * @param url - The URL to fetch
 * @param options - Fetch options plus timeout/retry configuration
 * @returns Response object
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const {
    timeout = 120000, // 2 minutes default
    retries = 1,
    retryDelay = 1000,
    onRetry,
    ...fetchOptions
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        lastError = new TimeoutError(
          `Request timed out after ${timeout / 1000} seconds`
        );
      } else if (!navigator.onLine) {
        lastError = new NetworkError('No internet connection');
      } else {
        lastError = new NetworkError(
          error.message || 'Network request failed'
        );
      }

      // If this isn't the last attempt, retry
      if (attempt < retries) {
        onRetry?.(attempt + 1, lastError);
        await new Promise(resolve =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
        continue;
      }

      // Last attempt failed, throw error
      throw lastError;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError!;
}

/**
 * Get user-friendly error message based on error type
 * @param error - The error object
 * @param locale - Current locale (nl/en)
 * @returns Localized error message
 */
export function getErrorMessage(error: Error, locale: string = 'nl'): string {
  if (error instanceof TimeoutError) {
    return locale === 'en'
      ? 'The analysis is taking longer than expected. Please try again or receive the result via email.'
      : 'De analyse duurt langer dan verwacht. Probeer het opnieuw of ontvang het resultaat via email.';
  }

  if (error instanceof NetworkError) {
    if (error.message.includes('internet')) {
      return locale === 'en'
        ? 'Connection problem. Check your internet and try again.'
        : 'Verbindingsprobleem. Controleer je internet en probeer opnieuw.';
    }
    return locale === 'en'
      ? 'Network error. Please try again.'
      : 'Netwerkfout. Probeer het opnieuw.';
  }

  // Generic server error
  return locale === 'en'
    ? 'Something went wrong on our server. We have been notified.'
    : 'Er ging iets mis op onze server. We zijn op de hoogte gesteld.';
}
