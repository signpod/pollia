const { PrismaClient } = require("@prisma/client");
const { algoliasearch } = require("algoliasearch");

const prisma = new PrismaClient();

const HANGUL_BASE = 44032;
const HANGUL_LAST = 55203;
const HANGUL_CYCLE = 588;
const CHOSEONG_TABLE = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

function toChoseong(value) {
  return Array.from(value.normalize("NFC"))
    .map(char => {
      if (char === " ") return "";
      const code = char.charCodeAt(0);
      if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
        const idx = Math.floor((code - HANGUL_BASE) / HANGUL_CYCLE);
        return CHOSEONG_TABLE[idx] ?? "";
      }
      if (/[a-zA-Z0-9]/.test(char)) return char.toLowerCase();
      return "";
    })
    .join("");
}

async function main() {
  const appId = process.env.ALGOLIA_APP_ID;
  const writeApiKey = process.env.ALGOLIA_WRITE_API_KEY;
  const indexName = process.env.ALGOLIA_INDEX_NAME;
  const chunkSize = Number(process.env.BACKFILL_CHUNK_SIZE || 200);

  if (!appId) {
    throw new Error("ALGOLIA_APP_ID 환경변수가 설정되지 않았습니다.");
  }
  if (!writeApiKey) {
    throw new Error("ALGOLIA_WRITE_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  if (!indexName) {
    throw new Error("ALGOLIA_INDEX_NAME 환경변수가 설정되지 않았습니다.");
  }
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error("BACKFILL_CHUNK_SIZE는 1 이상의 정수여야 합니다.");
  }

  console.log(`[Backfill] start index=${indexName}, chunkSize=${chunkSize}`);

  const missions = await prisma.mission.findMany({
    select: {
      id: true,
      title: true,
      choseong: true,
      description: true,
      category: true,
      isActive: true,
      likesCount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`[Backfill] total missions=${missions.length}`);

  if (missions.length === 0) {
    console.log("[Backfill] nothing to process");
    return;
  }

  let dbUpdated = 0;
  for (const mission of missions) {
    const computed = toChoseong(mission.title);
    if (mission.choseong !== computed) {
      await prisma.mission.update({
        where: { id: mission.id },
        data: { choseong: computed },
      });
      dbUpdated++;
    }
  }
  console.log(`[Backfill] DB choseong updated=${dbUpdated}/${missions.length}`);

  const refreshed =
    dbUpdated > 0
      ? await prisma.mission.findMany({
          select: {
            id: true,
            title: true,
            choseong: true,
            description: true,
            category: true,
            isActive: true,
            likesCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        })
      : missions;

  const records = refreshed.map(m => ({
    objectID: m.id,
    title: m.title,
    choseong: m.choseong,
    description: m.description ?? "",
    category: m.category,
    isActive: m.isActive,
    likesCount: m.likesCount,
    createdAt: m.createdAt.toISOString(),
  }));

  const client = algoliasearch(appId, writeApiKey);

  let uploaded = 0;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    await client.saveObjects({ indexName, objects: chunk });
    uploaded += chunk.length;
    console.log(`[Backfill] algolia uploaded ${uploaded}/${records.length}`);
  }

  console.log("[Backfill] completed");
}

main()
  .catch(error => {
    console.error("[Backfill] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
