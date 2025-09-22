import { NextRequest, NextResponse } from "next/server";
import { cleanupOrphanFiles } from "@/actions/image";

// GET /api/cleanup-orphan-files
// 고아 파일 정리를 수행하는 API 엔드포인트
// 크론잡이나 스케줄러에서 주기적으로 호출 가능
export async function GET(request: NextRequest) {
  try {
    // Vercel 크론잡인지 확인
    const isVercelCron = request.headers
      .get("user-agent")
      ?.includes("vercel-cron");
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CLEANUP_SECRET || "default-secret"}`;

    // Vercel 크론잡이 아니고 인증 헤더도 없으면 거부
    if (!isVercelCron && authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const triggerSource = isVercelCron ? "Vercel Cron" : "Manual";

    console.log(`🧹 고아 파일 정리 작업 시작... (트리거: ${triggerSource})`);

    const result = await cleanupOrphanFiles();

    if (!result.success) {
      console.error("❌ 고아 파일 정리 실패:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("✅ 고아 파일 정리 완료:", {
      triggerSource,
      deletedCount: result.deletedCount,
      failedCount: result.failedCount,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "고아 파일 정리가 완료되었습니다.",
      triggerSource,
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
        error: "고아 파일 정리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// POST 요청도 지원 (크론잡 서비스에 따라 다름)
export async function POST(request: NextRequest) {
  return GET(request);
}
