import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const res = NextResponse.next();

  // If the visitor already chose a country, keep it.
  if (req.cookies.get("country")) return res;

  const detected = req.headers.get("x-vercel-ip-country"); // set by Vercel
  const country = detected === "AE" ? "AE" : "IN";

  res.cookies.set("country", country, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};