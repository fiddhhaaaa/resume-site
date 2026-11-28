// true: the visitor passed the check. false: refuse the request.
export async function verifyTurnstile(token: unknown): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // No key: skip on your own computer, refuse on the live site
    return process.env.NODE_ENV !== "production";
  }
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error("turnstile error:", e instanceof Error ? e.message : "unknown");
    return false;
  }
}