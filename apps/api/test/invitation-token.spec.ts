import { describe, expect, it } from "vitest";

import {
  createInvitationToken,
  hashInvitationToken,
  InvitationTokenError,
} from "../src/modules/users-roles/invitation-token.js";

describe("Invitation token contract", () => {
  it("creates opaque 256-bit URL-safe tokens and stores only a deterministic hash", () => {
    const left = createInvitationToken();
    const right = createInvitationToken();

    expect(left).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    expect(right).not.toBe(left);
    expect(hashInvitationToken(left)).toMatch(/^[0-9a-f]{64}$/u);
    expect(hashInvitationToken(left)).toBe(hashInvitationToken(left));
    expect(hashInvitationToken(left)).not.toContain(left);
  });

  it.each(["", "short", "contains space", "a".repeat(44)])(
    "rejects malformed tokens without deriving a lookup hint: %s",
    (token) => {
      expect(() => hashInvitationToken(token)).toThrow(InvitationTokenError);
    },
  );
});
