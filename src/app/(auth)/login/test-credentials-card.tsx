/**
 * The "TEST CREDENTIALS" box below the sign-in form
 * (docs/screens/desktop-02.md #1, docs/screens/mobile-04.md #12). Every
 * email address and the helper line are transcribed verbatim — do not
 * paraphrase or invent an address (.claude/rules/20-design-fidelity.md).
 *
 * Static server component: nothing here is interactive.
 */
const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@gmail.com" },
  { label: "Trainer", email: "trainer@gmail.com" },
  { label: "Trainee", email: "trainee@gmail.com" },
] as const;

export function TestCredentialsCard() {
  return (
    <div className="rounded-xl border border-glass-border bg-surface-secondary/60 p-4">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Test Credentials
      </p>
      <ul className="mt-2 space-y-1">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.email} className="flex items-start gap-2 text-sm">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="text-foreground">
              <span className="font-semibold">{account.label}:</span> {account.email}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">Password: any value</p>
    </div>
  );
}
