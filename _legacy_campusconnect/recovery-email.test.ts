import { afterEach, describe, expect, it, vi } from "vitest";
import { createRecoveryCode, hashRecoveryCode } from "@/lib/recovery-email";

afterEach(() => vi.unstubAllEnvs());

describe("recovery email verification", () => {
  it("creates a six-digit code and stores only a keyed digest", () => {
    vi.stubEnv("RECOVERY_CODE_SECRET", "a-long-test-only-secret-with-at-least-32-characters");
    const code = createRecoveryCode();
    const digest = hashRecoveryCode("user-1", "student@example.edu", "enroll", code);
    expect(code).toMatch(/^\d{6}$/);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toBe(code);
  });

  it("binds the code digest to the account, email, and purpose", () => {
    vi.stubEnv("RECOVERY_CODE_SECRET", "a-long-test-only-secret-with-at-least-32-characters");
    const digest = hashRecoveryCode("user-1", "student@example.edu", "reset", "123456");
    expect(hashRecoveryCode("user-2", "student@example.edu", "reset", "123456")).not.toBe(digest);
    expect(hashRecoveryCode("user-1", "other@example.edu", "reset", "123456")).not.toBe(digest);
    expect(hashRecoveryCode("user-1", "student@example.edu", "enroll", "123456")).not.toBe(digest);
  });

  it("refuses to hash codes without a strong server secret", () => {
    vi.stubEnv("RECOVERY_CODE_SECRET", "short");
    expect(() => hashRecoveryCode("user-1", "student@example.edu", "reset", "123456")).toThrow(/at least 32 characters/);
  });
});
