#!/usr/bin/env node

/**
 * Turbopack 빌드 청크 크기 비교 스크립트
 *
 * 사용법:
 *   node scripts/compare-chunks.cjs <before-commit> <after-commit>
 *
 * 예시:
 *   node scripts/compare-chunks.cjs eeaa6583 HEAD
 *   node scripts/compare-chunks.cjs main feat/bundle-opt
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
사용법: node scripts/compare-chunks.cjs <before-commit> <after-commit>

예시:
  node scripts/compare-chunks.cjs eeaa6583 HEAD
  node scripts/compare-chunks.cjs main feat/bundle-opt
`);
    process.exit(1);
  }

  return {
    beforeCommit: args[0],
    afterCommit: args[1],
  };
}

function getCurrentBranch() {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}

function getCommitHash(ref) {
  return execSync(`git rev-parse --short ${ref}`).toString().trim();
}

function getCommitMessage(ref) {
  return execSync(`git log -1 --format=%s ${ref}`).toString().trim();
}

function checkoutCommit(commit) {
  execSync(`git checkout ${commit} --quiet`, { stdio: "inherit" });
}

function getChunkSizes(chunksDir) {
  const chunks = {};
  let totalSize = 0;
  let totalGzipSize = 0;

  if (!fs.existsSync(chunksDir)) {
    return { chunks, totalSize, totalGzipSize, count: 0 };
  }

  const files = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js") || f.endsWith(".css"));

  for (const file of files) {
    const filePath = path.join(chunksDir, file);
    const stat = fs.statSync(filePath);
    const size = stat.size;

    // gzip 크기 추정 (실제 압축 없이 대략적 비율 적용)
    const gzipSize = Math.round(size * 0.3);

    chunks[file] = { size, gzipSize };
    totalSize += size;
    totalGzipSize += gzipSize;
  }

  return {
    chunks,
    totalSize,
    totalGzipSize,
    count: files.length,
  };
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function buildAndMeasure(commit) {
  const hash = getCommitHash(commit);
  const message = getCommitMessage(commit);

  console.log(`\n📍 체크아웃: ${hash}`);
  console.log(`   ${message.substring(0, 60)}`);

  checkoutCommit(commit);

  console.log("📦 빌드 중...");
  execSync("yarn build", { stdio: "ignore" });

  const chunksDir = path.join(process.cwd(), ".next/static/chunks");
  const result = getChunkSizes(chunksDir);

  console.log(`   총 청크: ${result.count}개, ${formatSize(result.totalSize)}`);

  return {
    hash,
    message,
    ...result,
  };
}

function generateReport(before, after) {
  const lines = [];

  lines.push("# Turbopack 빌드 청크 크기 비교");
  lines.push("");
  lines.push(`생성일: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## 요약");
  lines.push("");
  lines.push(`| 항목 | Before | After | 변화 |`);
  lines.push(`|------|--------|-------|------|`);

  const sizeDiff = after.totalSize - before.totalSize;
  const sizePct = ((sizeDiff / before.totalSize) * 100).toFixed(1);
  const sizeArrow = sizeDiff < 0 ? "↓" : sizeDiff > 0 ? "↑" : "→";

  lines.push(
    `| 총 크기 | ${formatSize(before.totalSize)} | ${formatSize(after.totalSize)} | ${sizeDiff > 0 ? "+" : ""}${formatSize(sizeDiff)} (${sizePct}%) ${sizeArrow} |`
  );
  lines.push(`| 청크 수 | ${before.count} | ${after.count} | ${after.count - before.count} |`);
  lines.push("");
  lines.push("## 커밋 정보");
  lines.push("");
  lines.push(`- **Before**: \`${before.hash}\` - ${before.message}`);
  lines.push(`- **After**: \`${after.hash}\` - ${after.message}`);
  lines.push("");

  // 큰 청크 목록 (100KB 이상)
  lines.push("## 큰 청크 목록 (After, 100KB 이상)");
  lines.push("");
  lines.push("| 파일 | 크기 |");
  lines.push("|------|------|");

  const largeChunks = Object.entries(after.chunks)
    .filter(([, info]) => info.size >= 100 * 1024)
    .sort((a, b) => b[1].size - a[1].size);

  for (const [file, info] of largeChunks) {
    lines.push(`| ${file} | ${formatSize(info.size)} |`);
  }

  if (largeChunks.length === 0) {
    lines.push("| (없음) | - |");
  }

  lines.push("");

  // CSS vs JS 분리
  const beforeJS = Object.entries(before.chunks)
    .filter(([f]) => f.endsWith(".js"))
    .reduce((sum, [, info]) => sum + info.size, 0);
  const beforeCSS = Object.entries(before.chunks)
    .filter(([f]) => f.endsWith(".css"))
    .reduce((sum, [, info]) => sum + info.size, 0);
  const afterJS = Object.entries(after.chunks)
    .filter(([f]) => f.endsWith(".js"))
    .reduce((sum, [, info]) => sum + info.size, 0);
  const afterCSS = Object.entries(after.chunks)
    .filter(([f]) => f.endsWith(".css"))
    .reduce((sum, [, info]) => sum + info.size, 0);

  lines.push("## 타입별 크기");
  lines.push("");
  lines.push("| 타입 | Before | After | 변화 |");
  lines.push("|------|--------|-------|------|");

  const jsDiff = afterJS - beforeJS;
  const jsPct = beforeJS > 0 ? ((jsDiff / beforeJS) * 100).toFixed(1) : 0;
  lines.push(
    `| JavaScript | ${formatSize(beforeJS)} | ${formatSize(afterJS)} | ${jsDiff > 0 ? "+" : ""}${formatSize(jsDiff)} (${jsPct}%) |`
  );

  const cssDiff = afterCSS - beforeCSS;
  const cssPct = beforeCSS > 0 ? ((cssDiff / beforeCSS) * 100).toFixed(1) : 0;
  lines.push(
    `| CSS | ${formatSize(beforeCSS)} | ${formatSize(afterCSS)} | ${cssDiff > 0 ? "+" : ""}${formatSize(cssDiff)} (${cssPct}%) |`
  );

  return lines.join("\n");
}

async function main() {
  const { beforeCommit, afterCommit } = parseArgs();

  console.log("\n🚀 청크 크기 비교 시작");
  console.log(`📍 Before: ${beforeCommit}`);
  console.log(`📍 After: ${afterCommit}`);

  const originalBranch = getCurrentBranch();
  const afterHash = getCommitHash(afterCommit);

  try {
    // Before 측정
    const before = buildAndMeasure(beforeCommit);

    // After 측정
    const after = buildAndMeasure(afterHash);

    // 결과 출력
    console.log("\n" + "=".repeat(60));
    console.log("📊 청크 크기 비교 결과");
    console.log("=".repeat(60));

    const sizeDiff = after.totalSize - before.totalSize;
    const sizePct = ((sizeDiff / before.totalSize) * 100).toFixed(1);
    const arrow = sizeDiff < 0 ? "✅ 감소" : sizeDiff > 0 ? "⚠️ 증가" : "➡️ 동일";

    console.log(`\nBefore: ${before.hash} - ${before.message.substring(0, 40)}`);
    console.log(`After:  ${after.hash} - ${after.message.substring(0, 40)}`);
    console.log("");
    console.log(`총 크기: ${formatSize(before.totalSize)} → ${formatSize(after.totalSize)}`);
    console.log(`변화: ${sizeDiff > 0 ? "+" : ""}${formatSize(sizeDiff)} (${sizePct}%) ${arrow}`);
    console.log(`청크 수: ${before.count} → ${after.count}`);

    // 리포트 저장
    const report = generateReport(before, after);
    const reportPath = `chunks-comparison-${before.hash}-vs-${after.hash}.md`;
    fs.writeFileSync(reportPath, report);
    console.log(`\n💾 리포트 저장됨: ${reportPath}`);
  } finally {
    // 원래 브랜치로 복귀
    console.log(`\n🔙 원래 브랜치로 복귀: ${originalBranch}`);
    checkoutCommit(originalBranch);
  }

  console.log("\n✅ 비교 완료\n");
}

main().catch((e) => {
  console.error("❌ 오류:", e.message);
  process.exit(1);
});
