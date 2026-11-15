import axios from 'axios';

export interface ServiceHealthResult {
  healthy: boolean;
  status?: number;
  data?: any;
  error?: string;
}

export interface WaitForServiceOptions {
  baseUrl?: string;
  timeoutMs?: number;
  intervalMs?: number;
  verbose?: boolean;
}

/**
 * Checks once whether the backend service is healthy.
 */
export async function isServiceHealthy(baseUrl?: string): Promise<ServiceHealthResult> {
  const url = (baseUrl || process.env.E2E_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
  try {
    const res = await axios.get(`${url}/api/v1/health`, {
      timeout: 3000,
      validateStatus: () => true,
    });

    if (res.status === 200) {
      return {
        healthy: true,
        status: res.status,
        data: res.data,
      };
    }

    return {
      healthy: false,
      status: res.status,
      data: res.data,
      error: `Health endpoint returned HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      healthy: false,
      error: err.message || 'Unknown network error',
    };
  }
}

/**
 * Periodically polls the service health endpoint until healthy or timeout expires.
 */
export async function waitForService(options: WaitForServiceOptions = {}): Promise<boolean> {
  const {
    baseUrl,
    timeoutMs = 15000,
    intervalMs = 500,
    verbose = false,
  } = options;

  const url = (baseUrl || process.env.E2E_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const startTime = Date.now();

  if (verbose) {
    console.log(`[wait-for-service] Probing ${url}/api/v1/health (timeout: ${timeoutMs}ms)...`);
  }

  while (Date.now() - startTime < timeoutMs) {
    const result = await isServiceHealthy(url);
    if (result.healthy) {
      if (verbose) {
        console.log(`[wait-for-service] Backend service is ONLINE at ${url}`);
      }
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  if (verbose) {
    console.warn(
      `[wait-for-service] Backend service NOT REACHABLE at ${url} after ${timeoutMs}ms.\n` +
      `Ensure the backend is running via:\n` +
      `  - Docker: docker compose up -d\n` +
      `  - Local: npm run dev:api && npm run dev:worker\n`
    );
  }

  return false;
}

/**
 * Asserts that the backend service is reachable; throws informative error if not.
 */
export async function assertServiceReady(options: WaitForServiceOptions = {}): Promise<void> {
  const ready = await waitForService({ ...options, verbose: true });
  if (!ready) {
    const url = (options.baseUrl || process.env.E2E_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
    throw new Error(
      `[assertServiceReady] Backend service at ${url} is not responding to /api/v1/health.\n` +
      `Please ensure API and Worker services are running before running live E2E tests.`
    );
  }
}
