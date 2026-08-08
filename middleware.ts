import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isActiveAdmin(user: {
  app_metadata?: Record<string, unknown>;
}): boolean {
  return (
    user.app_metadata?.role === "admin" &&
    user.app_metadata?.active === true
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  let hasUser = false;
  let authorized = false;

  if (url && anonKey) {
    try {
      const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const cookie of cookiesToSet) {
              request.cookies.set(cookie.name, cookie.value);
            }

            response = NextResponse.next({ request });

            for (const cookie of cookiesToSet) {
              response.cookies.set(cookie.name, cookie.value, cookie.options);
            }
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      hasUser = Boolean(user);
      authorized = Boolean(user && isActiveAdmin(user));
    } catch {
      authorized = false;
    }
  }

  if (isLoginPage) {
    if (authorized) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  }

  if (!authorized) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    if (hasUser) {
      loginUrl.searchParams.set("error", "unauthorized");
    }

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
