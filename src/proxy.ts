import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin area: ask for the username and password
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isAdminAuthorized(req.headers.get("authorization"))) {
      return new NextResponse("Login required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"' },
      });
    }
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // Everyone else: remember the visitor's country for pricing
  const res = NextResponse.next();
  if (req.cookies.get("country")) return res;

  const detected = req.headers.get("x-vercel-ip-country"); // set by Vercel
  const country = detected === "AE" ? "AE" : "IN";
  res.cookies.set("country", country, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}

export const config = {
  matcher: ["/api/admin/:path*", "/((?!_next|api|favicon.ico).*)"],
};