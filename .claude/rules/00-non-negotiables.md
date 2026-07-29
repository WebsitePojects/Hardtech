# Non-negotiable security and reliability rules

Absolute and standing. A change that violates any of these is wrong even if it
works, even if it ships, and even if it was requested. Do not re-litigate them.

1. **No double-submit, ever.** Every mutating UI control is disabled while a
   request is in flight, shows a pending state, and its handler early-returns if
   already pending. Idempotency keys are generated once per user intent, not per
   attempt, so a retry replays instead of duplicating.

2. **Every mutating endpoint is duplicate-safe**, via one of: an idempotency-key
   store; a conditional state-transition UPDATE where side effects only fire in
   the winning transaction; a unique constraint plus out-of-transaction recovery;
   or a central idempotent posting layer. Every new mutating endpoint ships with
   a double-fire test covering both sequential and concurrent duplicates.

3. **Fail closed.** An unrecognized enum, state, or route in a validation chain
   is rejected. Never fall through to allow.

4. **Validate at the boundary.** Schema validation (zod) on every external input.
   Parameterized queries only. The server recomputes money and quantities — never
   trust a client-sent price, role, or scope.

5. **Server-side authorization on every route.** Rate-limit auth endpoints.
   Return generic auth errors. Compare secrets in constant time. Compute HMAC
   over the exact raw bytes.

6. **Never log or return secrets, tokens, or PII.** Secrets live in environment
   variables or gitignored files only.

7. **No fire-and-forget side effects.** Work that must survive a crash goes
   through an outbox or queue with a lease claim and bounded retry to a terminal
   state.

## Project-specific application

- **Enrollment** (`/enroll`) is the highest-risk mutating flow: a duplicate
  submission creates a duplicate student record. It needs a unique constraint on
  the applicant identity, an idempotency key minted when the form mounts, and a
  double-fire test.
- **Forum writes** (post, reply, vote, bookmark, report) are all mutating. Votes
  and bookmarks are toggles and must be idempotent per `(user, target)` — enforce
  with a compound unique constraint, not with a read-then-write.
- **Trainee posts require approval.** Moderation is a state transition. Approve
  and reject must be conditional UPDATEs guarded on the current state so two
  moderators acting at once cannot both fire side effects.
- **Role checks are server-side.** `trainee` / `trainer` / `admin` is read from
  the session on the server for every dashboard route and every mutation. The
  role chip in the navbar is display only and is never an authorization input.
