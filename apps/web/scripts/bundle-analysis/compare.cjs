#!/usr/bin/env node
/**
 * Bundle Snapshot 비교 스크립트
 *
 * 사용법:
 *   node scripts/bundle-analysis/compare.cjs <before> <after>
 *   node scripts/bundle-analysis/compare.cjs <before> <after> --notion
 *
 * 예시:
 *   node scripts/bundle-analysis/compare.cjs before-optimization after-optimization
 *   node scripts/bundle-analysis/compare.cjs before after --notion
 */

const fs = require("fs");
const path = require("path");

const SNAPSHOTS_DIR = path.join(__dirname, "snapshots");

function loadSnapshot(name) {
  const filePath = path.join(SNAPSHOTS_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: 스냅샷 '${name}'을 찾을 수 없습니다.`);
    console.error(`경로: ${filePath}`);
    listSnapshots();
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listSnapshots() {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    console.log("\n사용 가능한 스냅샷이 없습니다.");
    return;
  }
  const files = fs.readdirSync(SNAPSHOTS_DIR).filter(f => f.endsWith(".json"));
  if (files.length > 0) {
    console.log("\n사용 가능한 스냅샷:");
    files.forEach(f => console.log(`  - ${f.replace(".json", "")}`));
  }
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return (bytes / 1024 / 1024).toFixed(2) + "MB";
  }
  return (bytes / 1024).toFixed(1) + "KB";
}

function formatDiff(before, after) {
  const diff = after - before;
  const percent = before > 0 ? ((diff / before) * 100).toFixed(1) : 0;
  const sign = diff > 0 ? "+" : "";
  const emoji = diff > 0 ? "🔴" : diff < 0 ? "🟢" : "⚪";
  return { diff, percent: `${sign}${percent}%`, emoji, formatted: `${sign}${formatSize(Math.abs(diff))}` };
}

function generateTerminalReport(before, after) {
  const totalDiff = formatDiff(before.stats.totalGzip, after.stats.totalGzip);

  console.log("\n" + "═".repeat(70));
  console.log("  📊 Bundle Size 비교 리포트");
  console.log("═".repeat(70));

  console.log("\n┌─────────────────────────────────────────────────────────────────┐");
  console.log("│  📋 기본 정보                                                    │");
  console.log("├─────────────────────────────────────────────────────────────────┤");
  console.log(`│  Before: ${before.name.padEnd(20)} (${before.git.branch}@${before.git.commit})`.padEnd(66) + "│");
  console.log(`│  After:  ${after.name.padEnd(20)} (${after.git.branch}@${after.git.commit})`.padEnd(66) + "│");
  console.log(`│  비교일: ${new Date().toLocaleDateString("ko-KR")}`.padEnd(66) + "│");
  console.log("└─────────────────────────────────────────────────────────────────┘");

  console.log("\n┌─────────────────────────────────────────────────────────────────┐");
  console.log("│  📦 전체 번들 크기 (Gzip)                                        │");
  console.log("├─────────────────────────────────────────────────────────────────┤");
  console.log(`│  Before:  ${formatSize(before.stats.totalGzip).padEnd(10)}                                       │`);
  console.log(`│  After:   ${formatSize(after.stats.totalGzip).padEnd(10)}                                       │`);
  console.log(`│  변화:    ${totalDiff.formatted.padEnd(10)} (${totalDiff.percent}) ${totalDiff.emoji}`.padEnd(66) + "│");
  console.log("└─────────────────────────────────────────────────────────────────┘");

  // 패키지별 변화
  console.log("\n┌─────────────────────────────────────────────────────────────────┐");
  console.log("│  📦 패키지별 변화 (상위 15개)                                     │");
  console.log("├──────────────────────────────┬──────────┬──────────┬────────────┤");
  console.log("│ 패키지                        │ Before   │ After    │ 변화       │");
  console.log("├──────────────────────────────┼──────────┼──────────┼────────────┤");

  const beforePkgs = new Map(before.stats.packages.map(p => [p.name, p]));
  const afterPkgs = new Map(after.stats.packages.map(p => [p.name, p]));
  const allPkgs = new Set([...beforePkgs.keys(), ...afterPkgs.keys()]);

  const pkgChanges = [];
  for (const name of allPkgs) {
    const b = beforePkgs.get(name) || { gzip: 0 };
    const a = afterPkgs.get(name) || { gzip: 0 };
    const diff = a.gzip - b.gzip;
    pkgChanges.push({ name, before: b.gzip, after: a.gzip, diff });
  }

  pkgChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  pkgChanges.slice(0, 15).forEach(({ name, before: b, after: a, diff }) => {
    const emoji = diff > 0 ? "🔴" : diff < 0 ? "🟢" : "  ";
    const diffStr = diff !== 0 ? `${diff > 0 ? "+" : ""}${formatSize(diff)}` : "-";
    const shortName = name.length > 28 ? name.slice(0, 25) + "..." : name;
    console.log(
      `│ ${shortName.padEnd(28)} │ ${formatSize(b).padStart(8)} │ ${formatSize(a).padStart(8)} │ ${emoji} ${diffStr.padStart(7)} │`
    );
  });

  console.log("└──────────────────────────────┴──────────┴──────────┴────────────┘");

  // 새로 추가된 패키지
  const added = pkgChanges.filter(p => beforePkgs.get(p.name)?.gzip === 0 || !beforePkgs.has(p.name));
  const removed = pkgChanges.filter(p => afterPkgs.get(p.name)?.gzip === 0 || !afterPkgs.has(p.name));

  if (added.length > 0) {
    console.log("\n  🆕 새로 추가된 패키지:");
    added.slice(0, 5).forEach(p => console.log(`     + ${p.name}: ${formatSize(p.after)}`));
  }

  if (removed.length > 0) {
    console.log("\n  🗑️  제거된 패키지:");
    removed.slice(0, 5).forEach(p => console.log(`     - ${p.name}: ${formatSize(p.before)}`));
  }

  console.log("\n" + "═".repeat(70));
}

function generateNotionMarkdown(before, after) {
  const totalDiff = formatDiff(before.stats.totalGzip, after.stats.totalGzip);

  let md = "";

  md += `# 📊 Bundle Size 비교 리포트\n\n`;
  md += `> 생성일: ${new Date().toLocaleDateString("ko-KR")} ${new Date().toLocaleTimeString("ko-KR")}\n\n`;

  md += `## 📋 비교 정보\n\n`;
  md += `| 항목 | Before | After |\n`;
  md += `|------|--------|-------|\n`;
  md += `| 스냅샷 | ${before.name} | ${after.name} |\n`;
  md += `| Git | \`${before.git.branch}@${before.git.commit}\` | \`${after.git.branch}@${after.git.commit}\` |\n`;
  md += `| 시간 | ${new Date(before.timestamp).toLocaleString("ko-KR")} | ${new Date(after.timestamp).toLocaleString("ko-KR")} |\n\n`;

  md += `## 📦 전체 번들 크기\n\n`;
  md += `| 구분 | Gzip 크기 |\n`;
  md += `|------|----------|\n`;
  md += `| Before | ${formatSize(before.stats.totalGzip)} |\n`;
  md += `| After | ${formatSize(after.stats.totalGzip)} |\n`;
  md += `| **변화** | **${totalDiff.formatted} (${totalDiff.percent})** ${totalDiff.emoji} |\n\n`;

  // 요약 callout
  if (totalDiff.diff < 0) {
    md += `> ✅ **${formatSize(Math.abs(totalDiff.diff))} 감소** (${totalDiff.percent})\n\n`;
  } else if (totalDiff.diff > 0) {
    md += `> ⚠️ **${formatSize(totalDiff.diff)} 증가** (${totalDiff.percent})\n\n`;
  }

  // 패키지별 변화
  md += `## 📊 패키지별 변화\n\n`;

  const beforePkgs = new Map(before.stats.packages.map(p => [p.name, p]));
  const afterPkgs = new Map(after.stats.packages.map(p => [p.name, p]));
  const allPkgs = new Set([...beforePkgs.keys(), ...afterPkgs.keys()]);

  const pkgChanges = [];
  for (const name of allPkgs) {
    const b = beforePkgs.get(name) || { gzip: 0 };
    const a = afterPkgs.get(name) || { gzip: 0 };
    const diff = a.gzip - b.gzip;
    pkgChanges.push({ name, before: b.gzip, after: a.gzip, diff });
  }

  pkgChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  // 크게 변한 패키지들
  const significantChanges = pkgChanges.filter(p => Math.abs(p.diff) > 1024); // 1KB 이상 변화

  if (significantChanges.length > 0) {
    md += `### 주요 변화 (1KB 이상)\n\n`;
    md += `| 패키지 | Before | After | 변화 |\n`;
    md += `|--------|--------|-------|------|\n`;

    significantChanges.slice(0, 20).forEach(({ name, before: b, after: a, diff }) => {
      const emoji = diff > 0 ? "🔴" : "🟢";
      const diffStr = `${diff > 0 ? "+" : ""}${formatSize(diff)}`;
      md += `| \`${name}\` | ${formatSize(b)} | ${formatSize(a)} | ${emoji} ${diffStr} |\n`;
    });

    md += `\n`;
  }

  // 새로 추가/제거된 패키지
  const added = pkgChanges.filter(p => !beforePkgs.has(p.name) || beforePkgs.get(p.name).gzip === 0);
  const removed = pkgChanges.filter(p => !afterPkgs.has(p.name) || afterPkgs.get(p.name).gzip === 0);

  if (added.length > 0) {
    md += `### 🆕 새로 추가된 패키지\n\n`;
    added.forEach(p => {
      md += `- \`${p.name}\`: +${formatSize(p.after)}\n`;
    });
    md += `\n`;
  }

  if (removed.length > 0) {
    md += `### 🗑️ 제거된 패키지\n\n`;
    removed.forEach(p => {
      md += `- \`${p.name}\`: -${formatSize(p.before)}\n`;
    });
    md += `\n`;
  }

  // 상위 패키지 현황
  md += `## 📈 현재 상위 패키지 (After 기준)\n\n`;
  md += `| 순위 | 패키지 | Gzip 크기 |\n`;
  md += `|------|--------|----------|\n`;

  after.stats.packages.slice(0, 15).forEach((pkg, i) => {
    md += `| ${i + 1} | \`${pkg.name}\` | ${formatSize(pkg.gzip)} |\n`;
  });

  md += `\n---\n`;
  md += `*Generated by bundle-analysis script*\n`;

  return md;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes("--help") || args.includes("-h")) {
    console.log("\n사용법: node compare.cjs <before> <after> [--notion]");
    console.log("\n옵션:");
    console.log("  --notion    Notion 복사용 마크다운 파일 생성");
    listSnapshots();
    process.exit(0);
  }

  const beforeName = args[0];
  const afterName = args[1];
  const generateNotion = args.includes("--notion");

  const before = loadSnapshot(beforeName);
  const after = loadSnapshot(afterName);

  // 터미널 리포트 출력
  generateTerminalReport(before, after);

  // Notion 마크다운 생성
  if (generateNotion) {
    const md = generateNotionMarkdown(before, after);
    const outputPath = path.join(SNAPSHOTS_DIR, `compare-${beforeName}-vs-${afterName}.md`);
    fs.writeFileSync(outputPath, md);
    console.log(`\n📝 Notion 마크다운 저장: ${outputPath}`);
    console.log("   위 파일을 열어서 Notion에 복사/붙여넣기 하세요.\n");
  } else {
    console.log("\n💡 Tip: --notion 옵션을 추가하면 Notion용 마크다운 파일이 생성됩니다.\n");
  }
}

main();
