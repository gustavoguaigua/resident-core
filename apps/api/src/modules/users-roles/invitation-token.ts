import { createHash, randomBytes } from "node:crypto";

const INVITATION_TOKEN = /^[A-Za-z0-9_-]{43}$/u;

export class InvitationTokenError extends Error {}

export function createInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashInvitationToken(token: string): string {
  if (!INVITATION_TOKEN.test(token)) {
    throw new InvitationTokenError("Invitation token is invalid.");
  }
  return createHash("sha256").update(token, "utf8").digest("hex");
}
