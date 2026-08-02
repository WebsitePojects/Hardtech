import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, ShieldCheck, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSession } from "@/server/auth/session";

import { LoginForm } from "./login-form";
import { TestCredentialsCard } from "./test-credentials-card";

/**
 * docs/screens/desktop-02.md #1, docs/screens/mobile-04.md #11-12. Two-column
 * split on desktop (marketing copy left, sign-in card right); the mobile
 * capture shows the same content stacked, which the responsive classes below
 * produce without a separate mobile layout.
 */
const FEATURE_ROWS = [
  { icon: Zap, label: "Real-time progress tracking & analytics" },
  { icon: Award, label: "Download your QR-verified certificates" },
  { icon: ShieldCheck, label: "Secure, role-based account access" },
] as const;

export default async function LoginPage() {
  // Already signed in? Don't show the login form — go to the role router.
  // (This also keeps requireRole()'s /login redirect on a role mismatch from
  // ever landing on a form instead of bouncing straight through.)
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="hero-glow relative mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-24">
      <div className="space-y-6 lg:space-y-8">
        <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          System Online · 2026 Batches Open
        </Badge>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-balance sm:text-5xl">
            Continue Your
            <br />
            <span className="text-primary">Tech Journey</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Access your personalized training dashboard and track your progress in real time.
          </p>
        </div>

        <ul className="space-y-4">
          {FEATURE_ROWS.map((row) => (
            <li key={row.label} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-glass-border bg-glass">
                <row.icon className="size-4 text-primary" aria-hidden />
              </span>
              <span className="text-sm text-foreground">{row.label}</span>
            </li>
          ))}
        </ul>

        <p className="hidden text-xs text-muted-foreground lg:block">
          © 2026 HardTech IT Corp. All rights reserved.
        </p>
      </div>

      <Card className="glass rounded-2xl p-6 sm:p-8">
        <div className="mb-6 space-y-1.5">
          <h2 className="font-heading text-2xl font-semibold">Welcome Back</h2>
          <p className="text-sm text-muted-foreground">
            Want to join HardTech?{" "}
            <Link href="/enroll" className="font-medium text-primary hover:underline">
              Enroll in a program
            </Link>
          </p>
        </div>

        <LoginForm />

        <div className="mt-6">
          <TestCredentialsCard />
        </div>
      </Card>
    </div>
  );
}
