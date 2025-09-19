import { NextResponse } from "next/server";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // "next" 파라미터가 있으면 리다이렉트 URL로 사용, 없으면 홈으로
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // 상대 URL이 아니면 기본값 사용
    next = "/";
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // 로드밸런서 이전 원본 호스트
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // 개발환경에서는 로드밸런서가 없으므로 origin 사용
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // 에러 발생시 에러 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
