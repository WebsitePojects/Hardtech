import { createHash, randomBytes } from "node:crypto";
import { passwordResetRepository } from "@/server/repositories/password-reset.repository";
import { userRepository } from "@/server/repositories/user.repository";

const RESET_LIFETIME_MS = 60 * 60 * 1000;

function hashToken(token: string): string { return createHash("sha256").update(token).digest("hex"); }

export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  const user = await userRepository.findByEmail(email);
  if (user) {
    const rawToken = randomBytes(32).toString("base64url");
    await passwordResetRepository.create({ userId: user.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + RESET_LIFETIME_MS) });
    // TODO(deploy): wire an email provider. Never log or return rawToken.
    void rawToken;
  }
  return { ok: true };
}

export async function consumePasswordResetToken(token: string): Promise<boolean> {
  return (await passwordResetRepository.consume(hashToken(token), new Date())).count === 1;
}

export { hashToken };
