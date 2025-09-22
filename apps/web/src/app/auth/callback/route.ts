import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = await cookies();

  let next = cookieStore.get("auth_redirect")?.value ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { default: prisma } = await import(
          "@/database/utils/prisma/client"
        );

        const existingUser = await prisma.user.findFirst({
          where: { id: user.id },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              name:
                user.user_metadata?.name ||
                user.email?.split("@")[0] ||
                "사용자",
            },
          });
        }
      }

      cookieStore.set("auth_redirect", "", {
        path: "/",
        maxAge: 0,
      });

      const forwardedHost = request.headers.get("x-forwarded-host");
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
