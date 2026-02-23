import { searchSyncWorkerService } from "@/server/services/search-sync";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startedAt = Date.now();
    const result = await searchSyncWorkerService.processPending(new Date());
    const durationMs = Date.now() - startedAt;

    return NextResponse.json({
      success: true,
      durationMs,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Search sync worker failed:", error);
    return NextResponse.json(
      { success: false, error: "Search sync worker failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
