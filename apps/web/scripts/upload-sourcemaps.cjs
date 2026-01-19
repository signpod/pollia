const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const { execSync } = require("node:child_process");

const ROLLBAR_TOKEN = process.env.ROLLBAR_SERVER_TOKEN;
// minified_url은 스키마 없이 //hostname 형식이어야 함
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pollia.me";
const BASE_URL = APP_URL.replace(/^https?:/, "");

// Git commit SHA를 code_version으로 사용
function getCodeVersion() {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || "unknown";
  }
}

// FormData 바운더리 생성
function generateBoundary() {
  return `----FormBoundary${Math.random().toString(36).substring(2)}`;
}

// 멀티파트 폼 데이터 생성
function createFormData(boundary, fields, file) {
  let body = "";

  for (const [key, value] of Object.entries(fields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${value}\r\n`;
  }

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="source_map"; filename="${path.basename(file.path)}"\r\n`;
  body += "Content-Type: application/json\r\n\r\n";

  const fileContent = fs.readFileSync(file.path, "utf8");

  return Buffer.concat([
    Buffer.from(body),
    Buffer.from(fileContent),
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
}

// Rollbar에 소스맵 업로드
function uploadSourceMap(minifiedUrl, sourceMapPath) {
  return new Promise((resolve, reject) => {
    const codeVersion = getCodeVersion();
    const boundary = generateBoundary();

    const fields = {
      access_token: ROLLBAR_TOKEN,
      version: codeVersion,
      minified_url: minifiedUrl,
    };

    const formData = createFormData(boundary, fields, { path: sourceMapPath });

    const options = {
      hostname: "api.rollbar.com",
      port: 443,
      path: "/api/1/sourcemap",
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": formData.length,
      },
    };

    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log(`✓ Uploaded: ${path.basename(sourceMapPath)}`);
          resolve(data);
        } else {
          console.error(`✗ Failed: ${path.basename(sourceMapPath)} - ${data}`);
          reject(new Error(data));
        }
      });
    });

    req.on("error", reject);
    req.write(formData);
    req.end();
  });
}

// .next/static 디렉토리에서 소스맵 파일 찾기
function findSourceMaps(dir) {
  const sourceMaps = [];

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith(".js.map")) {
        const jsFile = filePath.replace(".map", "");
        const relativePath = path.relative(path.join(process.cwd(), ".next"), jsFile);
        const minifiedUrl = `${BASE_URL}/_next/${relativePath}`;

        sourceMaps.push({
          minifiedUrl,
          sourceMapPath: filePath,
        });
      }
    }
  }

  if (fs.existsSync(dir)) {
    walkDir(dir);
  }

  return sourceMaps;
}

async function main() {
  if (!ROLLBAR_TOKEN) {
    console.error("Error: ROLLBAR_SERVER_TOKEN is not set");
    process.exit(1);
  }

  const codeVersion = getCodeVersion();
  console.log("\nUploading source maps to Rollbar...");
  console.log(`Code version: ${codeVersion}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  const staticDir = path.join(process.cwd(), ".next", "static");
  const sourceMaps = findSourceMaps(staticDir);

  if (sourceMaps.length === 0) {
    console.log("No source maps found. Make sure to build first.");
    process.exit(0);
  }

  console.log(`Found ${sourceMaps.length} source maps\n`);

  let success = 0;
  let failed = 0;

  for (const { minifiedUrl, sourceMapPath } of sourceMaps) {
    try {
      await uploadSourceMap(minifiedUrl, sourceMapPath);
      success++;
    } catch (_error) {
      failed++;
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
}

main().catch(console.error);
