function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

// Checks the "Authorization: Basic ..." header against ADMIN_USER and ADMIN_PASSWORD
export function isAdminAuthorized(authHeader: string | null): boolean {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false; // locked until both are set
  if (!authHeader?.startsWith("Basic ")) return false;

  let decoded = "";
  try {
    decoded = atob(authHeader.slice(6));
  } catch {
    return false;
  }
  const i = decoded.indexOf(":");
  if (i === -1) return false;

  const userOk = safeEqual(decoded.slice(0, i), user);
  const passOk = safeEqual(decoded.slice(i + 1), pass);
  return userOk && passOk;
}

// For admin API routes: returns an error response, or null when allowed.
// Changes (POST) must come from our own site, which blocks other sites
// from using the CEO's saved login.
export function guardAdminApi(req: Request): Response | null {
  if (!isAdminAuthorized(req.headers.get("authorization"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    const site = process.env.SITE_URL?.replace(/\/$/, "");
    if (!origin || !site || origin !== site) {
      return new Response("Forbidden", { status: 403 });
    }
  }
  return null;
}