import { createHmac, randomInt } from "node:crypto";

export type RecoveryPurpose = "enroll" | "reset";

export function recoveryCodeSecret() {
  const secret = process.env.RECOVERY_CODE_SECRET;
  if (!secret || secret.length < 32) throw new Error("RECOVERY_CODE_SECRET must contain at least 32 characters.");
  return secret;
}

export function createRecoveryCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashRecoveryCode(userId: string, email: string, purpose: RecoveryPurpose, code: string) {
  return createHmac("sha256", recoveryCodeSecret()).update(`${userId}:${email}:${purpose}:${code}`).digest("hex");
}

export async function sendRecoveryCode(email: string, code: string, purpose: RecoveryPurpose) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Recovery email is not configured.");
  const isEnrollment = purpose === "enroll";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: isEnrollment ? "Verify your CampusConnect recovery email" : "Reset your CampusConnect password",
      text: `Your CampusConnect verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this message.`,
      html: `<p>Your CampusConnect verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you did not request this, you can ignore this message.</p>`,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Recovery email provider returned ${response.status}.`);
  }
  await response.body?.cancel();
}
