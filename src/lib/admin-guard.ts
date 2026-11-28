import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminAuthorized } from "./admin-auth";

// Every admin page calls this first, even though the proxy checks too
export async function assertAdmin() {
  const h = await headers();
  if (!isAdminAuthorized(h.get("authorization"))) notFound();
}