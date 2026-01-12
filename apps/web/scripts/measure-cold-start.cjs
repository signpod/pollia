#!/usr/bin/env node

/**
 * 콜드 스타트 측정 스크립트
 *
 * 사용법:
 *   node scripts/measure-cold-start.js [routes...]
 *
 * 예시:
 *   node scripts/measure-cold-start.js /
 *   node scripts/measure-cold-start.js / /login /me
 *   node scripts/measure-cold-start.js --runs=5 / /admin
 *
 * 옵션:
 *   --runs=N    각 라우트당 측정 횟수 (기본: 3)
 *   --port=N    서버 포트 (기본: 3000)
 *   --no-build  빌드 스킵 (이미 빌드된 경우)
 */

const { spawn, execSync } = require("child_process");
const http = require("http");
const https = require("https");

const DEFAULT_ROUTES = ["/", "/login", "/me"];
const DEFAULT_RUNS = 3;
const DEFAULT_PORT = 3000;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    routes: [],
    runs: DEFAULT_RUNS,
    port: DEFAULT_PORT,
    skipBuild: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--runs=")) {
      options.runs = parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--port=")) {
      options.port = parseInt(arg.split("=")[1], 10);
    } else if (arg === "--no-build") {
      options.skipBuild = true;
    } else if (arg.startsWith("/")) {
      options.routes.push(arg);
    }
  }

  if (options.routes.length === 0) {
    options.routes = DEFAULT_ROUTES;
  }

  return options;
}

function killPort(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
      stdio: "ignore",
    });
  } catch (e) {
    // ignore
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await measureRequest(`http://localhost:${port}/`, 2000);
      return true;
    } catch (e) {
      await sleep(1000);
    }
  }
  return false;
}

function measureRequest(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();
    let ttfb = null;

    const protocol = url.startsWith("https") ? https : http;
    const req = protocol.get(url, (res) => {
      ttfb = Number(process.hrtime.bigint() - startTime) / 1e6; // ms

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const totalTime = Number(process.hrtime.bigint() - startTime) / 1e6;
        resolve({
          statusCode: res.statusCode,
          ttfb: Math.round(ttfb * 100) / 100,
          totalTime: Math.round(totalTime * 100) / 100,
          bodySize: data.length,
        });
      });
    });

    req.on("error", reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function measureColdStart(port, route) {
  // 서버 종료
  killPort(port);
  await sleep(1000);

  // 서버 시작
  const serverProcess = spawn("yarn", ["start", "--port", port.toString()], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  const serverStartTime = process.hrtime.bigint();

  // 서버 준비 대기
  const ready = await waitForServer(port);
  if (!ready) {
    serverProcess.kill();
    throw new Error("Server failed to start");
  }

  const serverReadyTime = Number(process.hrtime.bigint() - serverStartTime) / 1e6;

  // 콜드 스타트 측정 (첫 번째 요청)
  const coldStartResult = await measureRequest(`http://localhost:${port}${route}`);

  // 서버 종료
  try {
    process.kill(-serverProcess.pid);
  } catch (e) {
    killPort(port);
  }

  return {
    serverStartup: Math.round(serverReadyTime),
    ...coldStartResult,
  };
}

async function measureWarmStart(port, route) {
  return await measureRequest(`http://localhost:${port}${route}`);
}

function formatTable(headers, rows) {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i]).length))
  );

  const separator = colWidths.map((w) => "-".repeat(w + 2)).join("+");
  const formatRow = (row) =>
    row.map((cell, i) => ` ${String(cell).padEnd(colWidths[i])} `).join("|");

  return [formatRow(headers), separator, ...rows.map(formatRow)].join("\n");
}

function calculateStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];

  return {
    avg: Math.round(avg),
    min: Math.round(min),
    max: Math.round(max),
    median: Math.round(median),
  };
}

async function main() {
  const options = parseArgs();
  const { routes, runs, port, skipBuild } = options;

  console.log("\n🚀 콜드 스타트 측정 시작\n");
  console.log(`📍 측정 라우트: ${routes.join(", ")}`);
  console.log(`🔄 측정 횟수: ${runs}회`);
  console.log(`🔌 포트: ${port}\n`);

  // 빌드
  if (!skipBuild) {
    console.log("📦 프로덕션 빌드 중...\n");
    try {
      execSync("yarn build", { stdio: "inherit" });
    } catch (e) {
      console.error("❌ 빌드 실패");
      process.exit(1);
    }
    console.log("\n✅ 빌드 완료\n");
  }

  const results = {};

  for (const route of routes) {
    console.log(`\n📊 측정 중: ${route}`);
    results[route] = {
      coldStart: [],
      warmStart: [],
      serverStartup: [],
    };

    for (let i = 0; i < runs; i++) {
      process.stdout.write(`  Run ${i + 1}/${runs}: `);

      try {
        // 콜드 스타트 측정
        const coldResult = await measureColdStart(port, route);
        results[route].coldStart.push(coldResult.ttfb);
        results[route].serverStartup.push(coldResult.serverStartup);

        console.log(
          `서버시작=${coldResult.serverStartup}ms, TTFB=${coldResult.ttfb}ms`
        );
      } catch (e) {
        console.log(`❌ 실패: ${e.message}`);
      }

      await sleep(2000);
    }
  }

  // 결과 출력
  console.log("\n" + "=".repeat(70));
  console.log("📈 측정 결과 요약");
  console.log("=".repeat(70) + "\n");

  const headers = ["Route", "서버시작(avg)", "TTFB(avg)", "TTFB(min)", "TTFB(max)"];
  const rows = [];

  for (const route of routes) {
    const r = results[route];
    if (r.coldStart.length === 0) continue;

    const ttfbStats = calculateStats(r.coldStart);
    const startupStats = calculateStats(r.serverStartup);

    rows.push([
      route,
      `${startupStats.avg}ms`,
      `${ttfbStats.avg}ms`,
      `${ttfbStats.min}ms`,
      `${ttfbStats.max}ms`,
    ]);
  }

  console.log(formatTable(headers, rows));

  // JSON 결과 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const gitCommit = execSync("git rev-parse --short HEAD").toString().trim();
  const outputPath = `cold-start-${gitCommit}-${timestamp}.json`;

  const output = {
    timestamp: new Date().toISOString(),
    gitCommit,
    options: { routes, runs, port },
    results,
    summary: Object.fromEntries(
      routes.map((route) => [
        route,
        {
          ttfb: calculateStats(results[route].coldStart),
          serverStartup: calculateStats(results[route].serverStartup),
        },
      ])
    ),
  };

  require("fs").writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 결과 저장됨: ${outputPath}`);

  // 이전 결과와 비교
  const previousFiles = require("fs")
    .readdirSync(".")
    .filter((f) => f.startsWith("cold-start-") && f.endsWith(".json") && f !== outputPath)
    .sort()
    .reverse();

  if (previousFiles.length > 0) {
    const prevFile = previousFiles[0];
    const prevData = JSON.parse(require("fs").readFileSync(prevFile, "utf-8"));

    console.log(`\n📊 이전 측정과 비교 (${prevData.gitCommit}):`);
    console.log("-".repeat(50));

    for (const route of routes) {
      if (!prevData.summary[route] || !output.summary[route]) continue;

      const prev = prevData.summary[route].ttfb.avg;
      const curr = output.summary[route].ttfb.avg;
      const diff = curr - prev;
      const pct = ((diff / prev) * 100).toFixed(1);
      const arrow = diff < 0 ? "⬇️" : diff > 0 ? "⬆️" : "➡️";

      console.log(
        `${route}: ${prev}ms → ${curr}ms (${diff > 0 ? "+" : ""}${diff}ms, ${pct}%) ${arrow}`
      );
    }
  }

  console.log("\n✅ 측정 완료\n");

  // 정리
  killPort(port);
}

main().catch((e) => {
  console.error("❌ 오류:", e.message);
  process.exit(1);
});
