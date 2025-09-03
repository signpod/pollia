export type RetryOptions = {
  retries?: number;
  factor?: number;
  minTimeoutMs?: number;
  maxTimeoutMs?: number;
  retryOn?: (status: number) => boolean;
};

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function nextDelay(attempt: number, { factor, minTimeoutMs, maxTimeoutMs }: Required<Omit<RetryOptions, "retries" | "retryOn">>) {
  const exp = minTimeoutMs * Math.pow(factor, attempt);
  return Math.min(exp, maxTimeoutMs);
}

export const defaultRetry: Required<RetryOptions> = {
  retries: 0,
  factor: 2,
  minTimeoutMs: 300,
  maxTimeoutMs: 4000,
  retryOn: (status) => status >= 500 || status === 429,
};


