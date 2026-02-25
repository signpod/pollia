import prisma from "@/database/utils/prisma/client";
import { toChoseong, toMissionSearchRecord } from "@/server/search";
import { getAlgoliaClient } from "@/server/services/search-sync";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startedAt = Date.now();

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

    const updateOps = missions
      .map(mission => ({
        id: mission.id,
        choseong: toChoseong(mission.title),
        current: mission.choseong,
      }))
      .filter(({ choseong, current }) => choseong !== current);

    if (updateOps.length > 0) {
      await prisma.$transaction(
        updateOps.map(({ id, choseong }) =>
          prisma.mission.update({ where: { id }, data: { choseong } }),
        ),
      );
    }

    const dbUpdated = updateOps.length;

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

    const indexName = process.env.ALGOLIA_INDEX_NAME;
    if (!indexName) {
      return NextResponse.json({ error: "ALGOLIA_INDEX_NAME not set" }, { status: 500 });
    }

    const records = refreshed.map(toMissionSearchRecord);

    const client = getAlgoliaClient();
    const chunkSize = 200;
    let uploaded = 0;

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize).map(r => ({ ...r }));
      await client.saveObjects({ indexName, objects: chunk });
      uploaded += chunk.length;
    }

    const durationMs = Date.now() - startedAt;

    return NextResponse.json({
      success: true,
      durationMs,
      totalMissions: missions.length,
      dbUpdated,
      algoliaUploaded: uploaded,
    });
  } catch (error) {
    console.error("Backfill choseong failed:", error);
    return NextResponse.json(
      { success: false, error: "Backfill choseong failed" },
      { status: 500 },
    );
  }
}
