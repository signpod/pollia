const { PrismaClient } = require("@prisma/client");
const { algoliasearch } = require("algoliasearch");

const prisma = new PrismaClient();

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

  const records = missions.map(mission => ({
    objectID: mission.id,
    title: mission.title,
    choseong: mission.choseong,
    description: mission.description ?? "",
    category: mission.category,
    isActive: mission.isActive,
    likesCount: mission.likesCount,
    createdAt: mission.createdAt.toISOString(),
  }));

  console.log(`[Backfill] total missions=${records.length}`);

  if (records.length === 0) {
    console.log("[Backfill] nothing to upload");
    return;
  }

  const client = algoliasearch(appId, writeApiKey);

  let uploaded = 0;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    await client.saveObjects({
      indexName,
      objects: chunk,
    });
    uploaded += chunk.length;
    console.log(`[Backfill] uploaded ${uploaded}/${records.length}`);
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
