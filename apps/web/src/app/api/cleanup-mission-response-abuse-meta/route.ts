import { cleanupMissionResponseAbuseMeta } from "@/actions/mission-response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const result = await cleanupMissionResponseAbuseMeta();
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "미션 응답 어뷰징 메타 정리가 완료되었습니다.",
      clearedCount: result.clearedCount,
      cutoffDate: result.cutoffDate.toISOString(),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("미션 응답 어뷰징 메타 정리 API 에러:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "미션 응답 어뷰징 메타 정리 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
