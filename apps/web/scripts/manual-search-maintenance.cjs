#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://localhost:3000";
const DEFAULT_JOB = "both";
const DEFAULT_MAX_SYNC_RUNS = 20;
const DEFAULT_DELAY_MS = 0;

function printUsage() {
  console.log(`
Manual Search Maintenance

Usage:
  node scripts/manual-search-maintenance.cjs [options]

Options:
  --job <backfill|sync|both>   Job to run (default: both)
  --base-url <url>             API base URL (default: http://localhost:3000)
  --max-sync-runs <number>     Max sync iterations for sync/both (default: 20)
  --delay-ms <number>          Delay between sync iterations in ms (default: 0)
  --help                        Show this help
`);
}

function parseArgs(argv) {
  const options = {
    job: DEFAULT_JOB,
    baseUrl: DEFAULT_BASE_URL,
    maxSyncRuns: DEFAULT_MAX_SYNC_RUNS,
    delayMs: DEFAULT_DELAY_MS,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--job") {
      options.job = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--base-url") {
      options.baseUrl = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--max-sync-runs") {
      const value = Number(argv[i + 1]);
      options.maxSyncRuns = value;
      i += 1;
      continue;
    }

    if (arg === "--delay-ms") {
      const value = Number(argv[i + 1]);
      options.delayMs = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!["backfill", "sync", "both"].includes(options.job)) {
    throw new Error(`Invalid --job: ${options.job}`);
  }

  if (!Number.isInteger(options.maxSyncRuns) || options.maxSyncRuns <= 0) {
    throw new Error(`--max-sync-runs must be a positive integer: ${options.maxSyncRuns}`);
  }

  if (!Number.isInteger(options.delayMs) || options.delayMs < 0) {
    throw new Error(`--delay-ms must be a non-negative integer: ${options.delayMs}`);
  }

  try {
    const normalizedUrl = new URL(options.baseUrl);
    options.baseUrl = normalizedUrl.origin;
  } catch {
    throw new Error(`Invalid --base-url: ${options.baseUrl}`);
  }

  return options;
}

function getCronSecret() {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error("CRON_SECRET is required. Please set it in your environment.");
  }
  return secret;
}

async function requestJson(baseUrl, path, cronSecret) {
  const url = `${baseUrl}${path}`;
  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cronSecret}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Request failed: POST ${url} - ${message}`);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Request failed: POST ${url} - Non-JSON response (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      `Request failed: POST ${url} - HTTP ${response.status} ${response.statusText} - ${JSON.stringify(
        payload,
      )}`,
    );
  }

  if (!payload || typeof payload !== "object") {
    throw new Error(`Request failed: POST ${url} - Invalid JSON payload`);
  }

  return payload;
}

async function runBackfill(baseUrl, cronSecret) {
  const payload = await requestJson(baseUrl, "/api/backfill-search-index", cronSecret);

  if (payload.success !== true) {
    throw new Error(`Backfill returned success=false: ${JSON.stringify(payload)}`);
  }

  console.log(
    `[backfill] success=${payload.success} algoliaUploaded=${payload.algoliaUploaded ?? "-"} dbUpdated=${
      payload.dbUpdated ?? "-"
    } durationMs=${payload.durationMs ?? "-"}`,
  );
  console.log(`[backfill] response=${JSON.stringify(payload)}`);
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function runSync(baseUrl, cronSecret, maxSyncRuns, delayMs) {
  let totalFetched = 0;
  let totalClaimed = 0;
  let totalSuccess = 0;
  let totalFailure = 0;
  let runCount = 0;

  for (let run = 1; run <= maxSyncRuns; run += 1) {
    const payload = await requestJson(baseUrl, "/api/search-sync", cronSecret);

    if (payload.success !== true) {
      throw new Error(`[sync run ${run}] success=false: ${JSON.stringify(payload)}`);
    }

    const fetchedCount = Number(payload.fetchedCount ?? 0);
    const claimedCount = Number(payload.claimedCount ?? 0);
    const successCount = Number(payload.successCount ?? 0);
    const failureCount = Number(payload.failureCount ?? 0);

    totalFetched += fetchedCount;
    totalClaimed += claimedCount;
    totalSuccess += successCount;
    totalFailure += failureCount;
    runCount = run;

    console.log(
      `[sync run ${run}] fetched=${fetchedCount} claimed=${claimedCount} success=${successCount} failure=${failureCount}`,
    );
    console.log(`[sync run ${run}] response=${JSON.stringify(payload)}`);

    if (fetchedCount === 0) {
      console.log(`[sync] queue drained at run ${run}`);
      break;
    }

    if (delayMs > 0 && run < maxSyncRuns) {
      await sleep(delayMs);
    }
  }

  console.log(
    `[sync summary] runs=${runCount} totalFetched=${totalFetched} totalClaimed=${totalClaimed} totalSuccess=${totalSuccess} totalFailure=${totalFailure}`,
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const cronSecret = getCronSecret();

  console.log(
    `[start] job=${options.job} baseUrl=${options.baseUrl} maxSyncRuns=${options.maxSyncRuns} delayMs=${options.delayMs}`,
  );

  if (options.job === "backfill") {
    await runBackfill(options.baseUrl, cronSecret);
    return;
  }

  if (options.job === "sync") {
    await runSync(options.baseUrl, cronSecret, options.maxSyncRuns, options.delayMs);
    return;
  }

  await runBackfill(options.baseUrl, cronSecret);
  await runSync(options.baseUrl, cronSecret, options.maxSyncRuns, options.delayMs);
}

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[error] ${message}`);
  process.exit(1);
});
