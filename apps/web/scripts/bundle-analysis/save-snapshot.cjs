#!/usr/bin/env node
/**
 * Bundle Snapshot 저장 스크립트
 *
 * 사용법:
 *   node scripts/bundle-analysis/save-snapshot.cjs [snapshot-name]
 *
 * 예시:
 *   node scripts/bundle-analysis/save-snapshot.cjs before-optimization
 *   node scripts/bundle-analysis/save-snapshot.cjs after-lodash-removal
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SNAPSHOTS_DIR = path.join(__dirname, "snapshots");
const ANALYZE_DIR = path.join(__dirname, "../../.next/analyze");

function parseClientHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const match = html.match(/window\.chartData = (\[.*?\]);/s);

  if (!match) {
    throw new Error("chartData를 찾을 수 없습니다. 먼저 yarn analyze를 실행하세요.");
  }

  const data = JSON.parse(match[1]);
  const modulesSizes = {};

  function traverse(node) {
    if (node.groups) {
      for (const child of node.groups) {
        traverse(child);
      }
    } else if (node.path && node.path.includes("node_modules")) {
      const m = node.path.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
      if (m) {
        const pkg = m[1];
        if (!modulesSizes[pkg]) {
          modulesSizes[pkg] = { parsed: 0, gzip: 0 };
        }
        modulesSizes[pkg].parsed += node.parsedSize || 0;
        modulesSizes[pkg].gzip += node.gzipSize || 0;
      }
    }
  }

  let totalParsed = 0;
  let totalGzip = 0;

  data.forEach(chunk => {
    totalParsed += chunk.parsedSize || 0;
    totalGzip += chunk.gzipSize || 0;
    traverse(chunk);
  });

  // 청크별 정보
  const chunks = data.map(chunk => ({
    name: chunk.label.replace("static/chunks/", ""),
    parsed: chunk.parsedSize || 0,
    gzip: chunk.gzipSize || 0,
  })).sort((a, b) => b.gzip - a.gzip);

  // 패키지별 정보 (상위 30개)
  const packages = Object.entries(modulesSizes)
    .map(([name, sizes]) => ({ name, ...sizes }))
    .sort((a, b) => b.gzip - a.gzip)
    .slice(0, 30);

  return {
    totalParsed,
    totalGzip,
    chunks,
    packages,
  };
}

function getGitInfo() {
  try {
    const commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
    return { commit, branch };
  } catch {
    return { commit: "unknown", branch: "unknown" };
  }
}

function main() {
  const snapshotName = process.argv[2] || `snapshot-${Date.now()}`;
  const clientHtmlPath = path.join(ANALYZE_DIR, "client.html");

  if (!fs.existsSync(clientHtmlPath)) {
    console.error("Error: client.html이 없습니다.");
    console.error("먼저 'yarn analyze'를 실행하세요.");
    process.exit(1);
  }

  // 스냅샷 디렉토리 생성
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }

  const stats = parseClientHtml(clientHtmlPath);
  const gitInfo = getGitInfo();

  const snapshot = {
    name: snapshotName,
    timestamp: new Date().toISOString(),
    git: gitInfo,
    stats,
  };

  const outputPath = path.join(SNAPSHOTS_DIR, `${snapshotName}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

  console.log(`\n✅ 스냅샷 저장 완료: ${outputPath}`);
  console.log(`\n📊 요약:`);
  console.log(`   Total Parsed: ${(stats.totalParsed / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Total Gzip:   ${(stats.totalGzip / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Git:          ${gitInfo.branch}@${gitInfo.commit}`);
}

main();
