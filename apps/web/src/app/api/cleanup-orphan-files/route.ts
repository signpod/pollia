import { cleanupOrphanFiles } from "@/actions/common/image";
import { NextRequest, NextResponse } from "next/server";

// GET /api/cleanup-orphan-files
// 고아 파일 정리를 수행하는 API 엔드포인트
// 크론잡이나 스케줄러에서 주기적으로 호출 가능
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 보안 체크
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();

    console.log("🧹 고아 파일 정리 작업 시작...");

    const result = await cleanupOrphanFiles();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("✅ 고아 파일 정리 완료:", {
      deletedCount: result.deletedCount,
      failedCount: result.failedCount,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "고아 파일 정리가 완료되었습니다.",
      deletedCount: result.deletedCount,
      failedCount: result.failedCount,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      deletedFiles: result.deletedFiles,
      failedFiles: result.failedFiles,
    });
  } catch (error) {
    console.error("❌ 고아 파일 정리 API 에러:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "고아 파일 정리 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

// POST 요청도 지원 (크론잡 서비스에 따라 다름)
export async function POST(request: NextRequest) {
  return GET(request);
}
