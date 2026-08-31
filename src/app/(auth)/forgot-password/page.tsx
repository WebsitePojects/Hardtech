import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { getSession } from "@/server/auth/session";

import { ForgotPasswordForm } from "./forgot-password-form";

/**
 * NOT SOURCED: no screenshot in docs/screens/ captures this page's content.
 * docs/research/01-design-source.md only confirms the route exists
 * ("/forgot-password | Password recovery") and desktop-02.md #1 / mobile-04
 * #12 confirm the "Forgot password?" link on /login points somewhere. The
 * heading, paragraph, and layout below are authored to fit the same design
 * system (Card, tokens, glass) rather than transcribed — flagged in the
 * wave-2 return report rather than presented as sourced copy.
 */
export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="hero-glow hero-glow-forgot-password relative mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:px-6 lg:py-24">
      <Card className="glass rounded-2xl p-6 sm:p-8">
        <div className="mb-6 space-y-1.5">
          <h2 className="font-heading text-2xl font-semibold">Reset Your Password</h2>
          <p className="text-sm text-muted-foreground">
            Enter the email address on your account and we&apos;ll send you instructions to
            reset your password.
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
