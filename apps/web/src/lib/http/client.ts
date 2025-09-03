import { HttpError, TimeoutError } from "./errors";
import type { HttpClient, HttpOptions, RequestConfig } from "./types";
import { defaultRetry, nextDelay, sleep, type RetryOptions } from "./retry";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new TimeoutError()), timeoutMs);
    promise
      .then((res) => {
        clearTimeout(id);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}

function buildUrl(path: string, baseUrl?: string) {
  if (/^https?:\/\//.test(path)) return path;
  const root = baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!root) return path;
  return `${root.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function createHttpClient(
  defaults: HttpOptions = {},
  retry: RetryOptions = {}
): HttpClient {
  const opts: Required<HttpOptions> = {
    baseUrl: defaults.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(defaults.headers || {}),
    },
    timeoutMs: defaults.timeoutMs ?? 15000,
    credentials: defaults.credentials ?? "include",
  };
  const retryCfg = { ...defaultRetry, ...retry } as Required<RetryOptions>;

  async function core<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const url = buildUrl(path, config.baseUrl ?? opts.baseUrl);
    const method = config.method ?? "GET";
    const headers = { ...opts.headers, ...(config.headers || {}) };
    const credentials = config.credentials ?? opts.credentials;
    const timeoutMs = config.timeoutMs ?? opts.timeoutMs;

    let attempt = 0;
    while (true) {
      try {
        const res = await withTimeout(
          fetch(url, {
            method,
            headers,
            body:
              config.body !== undefined &&
              headers["Content-Type"]?.includes("application/json")
                ? JSON.stringify(config.body)
                : (config.body as BodyInit | undefined),
            credentials,
            mode: "cors",
            redirect: "follow",
          }),
          timeoutMs
        );

        if (!res.ok) {
          let body: unknown = undefined;
          try {
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) body = await res.json();
            else body = await res.text();
          } catch {
            body = undefined;
          }
          if (attempt < retryCfg.retries && retryCfg.retryOn(res.status)) {
            await sleep(nextDelay(attempt, retryCfg));
            attempt++;
            continue;
          }
          throw new HttpError(`${method} ${url} failed`, res.status, url, body);
        }

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          return (await res.json()) as T;
        }
        // JSON 외 응답은 any로 반환(필요시 호출부에서 처리)
        // @ts-expect-error - non-json
        return await res.text();
      } catch (err) {
        if (attempt < retryCfg.retries) {
          await sleep(nextDelay(attempt, retryCfg));
          attempt++;
          continue;
        }
        throw err;
      }
    }
  }

  return {
    request: core,
    get: (path, config) => core(path, { ...config, method: "GET" }),
    post: (path, body, config) =>
      core(path, { ...config, method: "POST", body }),
    put: (path, body, config) => core(path, { ...config, method: "PUT", body }),
    patch: (path, body, config) =>
      core(path, { ...config, method: "PATCH", body }),
    delete: (path, config) => core(path, { ...config, method: "DELETE" }),
  };
}
