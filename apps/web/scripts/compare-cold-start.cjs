#!/usr/bin/env node

/**
 * 콜드 스타트 전/후 비교 스크립트
 *
 * 사용법:
 *   node scripts/compare-cold-start.js <before-commit> <after-commit> [routes...]
 *
 * 예시:
 *   node scripts/compare-cold-start.js eeaa6583 HEAD /
 *   node scripts/compare-cold-start.js main feat/bundle-opt / /login /me
 *   node scripts/compare-cold-start.js HEAD~5 HEAD --runs=5 / /admin
 */

const { execSync, spawn } = require("node:child_process");
const fs = require("node:fs");

const DEFAULT_ROUTES = ["/", "/login"];
const DEFAULT_RUNS = 3;
const PORT = 3000;

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
사용법: node scripts/compare-cold-start.js <before-commit> <after-commit> [routes...]

예시:
  node scripts/compare-cold-start.js eeaa6583 HEAD /
  node scripts/compare-cold-start.js main feat/bundle-opt / /login
  node scripts/compare-cold-start.js HEAD~5 HEAD --runs=5 /
`);
    process.exit(1);
  }

  const options = {
    beforeCommit: args[0],
    afterCommit: args[1],
    routes: [],
    runs: DEFAULT_RUNS,
  };

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--runs=")) {
      options.runs = Number.parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("/")) {
      options.routes.push(arg);
    }
  }

  if (options.routes.length === 0) {
    options.routes = DEFAULT_ROUTES;
  }

  return options;
}

function getCurrentBranch() {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}

function getCommitHash(ref) {
  return execSync(`git rev-parse --short ${ref}`).toString().trim();
}

function checkoutCommit(commit) {
  execSync(`git checkout ${commit} --quiet`, { stdio: "inherit" });
}

function killPort(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
      stdio: "ignore",
    });
  } catch {
    // ignore
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(port, maxAttempts = 30) {
  const http = require("node:http");
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/`, () => {
          resolve(true);
        });
        req.on("error", reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error("timeout"));
        });
      });
      return true;
    } catch {
      await sleep(1000);
    }
  }
  return false;
}

function measureRequest(url) {
  const http = require("node:http");
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();
    let ttfb = null;

    const req = http.get(url, res => {
      ttfb = Number(process.hrtime.bigint() - startTime) / 1e6;

      res.on("data", () => {});
      res.on("end", () => {
        resolve({
          ttfb: Math.round(ttfb),
          total: Math.round(Number(process.hrtime.bigint() - startTime) / 1e6),
          status: res.statusCode,
        });
      });
    });

    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function measureColdStart(route, runs) {
  const results = [];

  for (let i = 0; i < runs; i++) {
    killPort(PORT);
    await sleep(1000);

    const serverProcess = spawn("yarn", ["start", "--port", PORT.toString()], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
    });

    const serverStart = process.hrtime.bigint();
    await waitForServer(PORT);
    const serverReady = Number(process.hrtime.bigint() - serverStart) / 1e6;

    try {
      const result = await measureRequest(`http://localhost:${PORT}${route}`);
      results.push({
        serverStartup: Math.round(serverReady),
        ttfb: result.ttfb,
      });
      process.stdout.write(".");
    } catch {
      process.stdout.write("x");
    }

    try {
      process.kill(-serverProcess.pid);
    } catch {
      killPort(PORT);
    }

    await sleep(1000);
  }

  return results;
}

function calculateStats(values) {
  if (values.length === 0) return { avg: 0, min: 0, max: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  return {
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    min: Math.round(sorted[0]),
    max: Math.round(sorted[sorted.length - 1]),
  };
}

async function measureCommit(commit, routes, runs) {
  console.log(`\n📍 체크아웃: ${commit}`);
  checkoutCommit(commit);

  const hash = getCommitHash("HEAD");
  const message = execSync("git log -1 --format=%s").toString().trim();
  console.log(`   커밋: ${hash} - ${message.substring(0, 50)}`);

  console.log("📦 빌드 중...");
  execSync("yarn build", { stdio: "ignore" });

  const results = {};

  for (const route of routes) {
    process.stdout.write(`📊 ${route} 측정 중 `);
    const measurements = await measureColdStart(route, runs);
    results[route] = {
      measurements,
      ttfb: calculateStats(measurements.map(m => m.ttfb)),
      serverStartup: calculateStats(measurements.map(m => m.serverStartup)),
    };
    console.log(` → avg TTFB: ${results[route].ttfb.avg}ms`);
  }

  return { hash, message, results };
}

function printComparison(before, after, routes) {
  console.log(`\n${"=".repeat(70)}`);
  console.log("📊 콜드 스타트 비교 결과");
  console.log("=".repeat(70));
  console.log(`\nBefore: ${before.hash} - ${before.message.substring(0, 40)}`);
  console.log(`After:  ${after.hash} - ${after.message.substring(0, 40)}\n`);

  console.log("-".repeat(70));
  console.log(
    `${"Route".padEnd(20)}${"Before(ms)".padEnd(15)}${"After(ms)".padEnd(15)}${"Diff".padEnd(15)}Change`,
  );
  console.log("-".repeat(70));

  for (const route of routes) {
    const b = before.results[route]?.ttfb.avg || 0;
    const a = after.results[route]?.ttfb.avg || 0;
    const diff = a - b;
    const pct = b > 0 ? ((diff / b) * 100).toFixed(1) : 0;
    const arrow = diff < 0 ? "✅ 개선" : diff > 0 ? "⚠️ 악화" : "➡️ 동일";

    console.log(
      `${route.padEnd(20)}${`${b}`.padEnd(15)}${`${a}`.padEnd(15)}${`${diff > 0 ? "+" : ""}${diff}`.padEnd(15)}${pct}% ${arrow}`,
    );
  }

  console.log("-".repeat(70));

  // 서버 시작 시간 비교
  console.log("\n서버 시작 시간:");
  for (const route of routes) {
    const b = before.results[route]?.serverStartup.avg || 0;
    const a = after.results[route]?.serverStartup.avg || 0;
    const diff = a - b;
    console.log(`  ${route}: ${b}ms → ${a}ms (${diff > 0 ? "+" : ""}${diff}ms)`);
  }
}

async function main() {
  const options = parseArgs();
  const { beforeCommit, afterCommit, routes, runs } = options;

  console.log("\n🚀 콜드 스타트 비교 시작");
  console.log(`📍 Before: ${beforeCommit}`);
  console.log(`📍 After: ${afterCommit}`);
  console.log(`🔄 측정 횟수: ${runs}회`);
  console.log(`📂 라우트: ${routes.join(", ")}`);

  const originalBranch = getCurrentBranch();

  try {
    // Before 측정
    const beforeResult = await measureCommit(beforeCommit, routes, runs);

    // After 측정
    const afterResult = await measureCommit(afterCommit, routes, runs);

    // 결과 비교
    printComparison(beforeResult, afterResult, routes);

    // 결과 저장
    const output = {
      timestamp: new Date().toISOString(),
      before: beforeResult,
      after: afterResult,
      comparison: Object.fromEntries(
        routes.map(route => {
          const b = beforeResult.results[route]?.ttfb.avg || 0;
          const a = afterResult.results[route]?.ttfb.avg || 0;
          return [
            route,
            {
              before: b,
              after: a,
              diff: a - b,
              pct: b > 0 ? ((a - b) / b) * 100 : 0,
            },
          ];
        }),
      ),
    };

    const outputPath = `cold-start-comparison-${beforeResult.hash}-vs-${afterResult.hash}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n💾 결과 저장됨: ${outputPath}`);
  } finally {
    // 원래 브랜치로 복귀
    console.log(`\n🔙 원래 브랜치로 복귀: ${originalBranch}`);
    checkoutCommit(originalBranch);
    killPort(PORT);
  }

  console.log("\n✅ 비교 완료\n");
}

main().catch(e => {
  console.error("❌ 오류:", e.message);
  killPort(PORT);
  process.exit(1);
});
