import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/me"],
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, response };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const { user, response } = await getSession(request);

    if (pathname.startsWith("/admin")) {
      if (!user) {
        return NextResponse.redirect(new URL("/login/admin", request.url));
      }
      return response;
    }

    if (pathname === "/me") {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return response;
    }

    return response;
  } catch (error) {
    console.error("[Middleware] Session check failed:", error);
    return NextResponse.next();
  }
}
