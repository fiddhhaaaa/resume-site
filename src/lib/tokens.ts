import { randomBytes } from "node:crypto";

// 32 random characters that can't be guessed
export const randomToken = () => randomBytes(24).toString("base64url");