# HardTech current-state audit — 2026-09-05

## Scope and confidence

Read-only audit of the enrollment-to-certificate lifecycle, authz/idempotency, query boundaries, and public SEO entry points. No database, network, browser, mutation-test, migration, seed, install, or production action was run.

`main` has eight pre-existing, uncommitted edits covering the hero-frame removal and two-program cleanup: `docs/screens/desktop-01.md`, `prisma/seed.ts`, `src/features/about/hero.tsx`, `src/features/home/{hero-frame-chrome.tsx,hero-frame.tsx,hero.tsx,programs-carousel.tsx}`, and `src/features/programs/program-visuals.tsx`. They were not modified.

`npm run typecheck` passed and `git diff --check` was clean. Neither result is browser or database verification.

No existing `graphify-out/graph.json` was present. A deliberately scoped, code-only AST graph was built for `src/server/services` (17 files; 236 nodes; 591 edges; no semantic extraction). Its narrow traversal located payment, assignment, progress, issuance, and verification services. The graph diagnostic found 269 dangling import/reference endpoints, so it was used for navigation only; all findings below are corroborated against source.

## Lifecycle state

| Stage | Source-confirmed state | Browser status |
| --- | --- | --- |
| Enroll + proof | Implemented: Zod boundary, server-priced programs, deterministic proof object, payment idempotency key, unique recovery, and transactionally attached media. [enrollment service](../../src/server/services/enrollment.service.ts:88) | Not independently verified. |
| Admin payment decision | Implemented: admin session action; database role re-verification; conditional `SUBMITTED` transition activates/rejects linked enrollments and writes an audit row in one transaction. [admin action](../../src/app/(dashboard)/dashboard/admin/actions.ts:59) [service](../../src/server/services/dashboard-write.service.ts:118) | Not independently verified. |
| Assignment delivery | Trainer can create an assignment but it is silently pinned to the earliest batch. Trainee UI accepts only a URL; allowed types are not enforced. [repository](../../src/server/repositories/assignment.repository.ts:6) [form](../../src/features/dashboard-trainee/assignment-submission-form.tsx:74) [service](../../src/server/services/dashboard-write.service.ts:71) | Not independently verified. |
| Trainer marking + completion | Evaluation and assignment actions are wired. Progress and completion services exist, but no page/action calls them. [trainer actions](../../src/app/(dashboard)/dashboard/trainer/actions.ts:8) [completion service](../../src/server/services/enrollment-progress.service.ts:54) | Not independently verified. |
| Certificate + QR | Approval is conditional. Public QR verification validates input, returns only approved credentials, and makes invalid/unknown/rejected alike. Private document retrieval checks owner/admin. [verification service](../../src/server/services/certificate-verify.service.ts:31) [verify page](../../src/app/(marketing)/verify/[code]/page.tsx:20) [private route](../../src/app/api/certificates/[code]/route.ts:19) | Not independently verified. |

## Highest five blockers

### 1. Active enrollments have no source-confirmed path into a trainer batch

**Evidence.** Payment verification only changes enrollment status to `ACTIVE` or `REJECTED`; it does not set `batchId`. [payment transition](../../src/server/services/dashboard-write.service.ts:129) The model makes `batchId` the join for trainee assignments, sessions, and materials. [Batch](../../prisma/schema.prisma:355) [Enrollment](../../prisma/schema.prisma:380) The sole admin batch mutation is unassignment. [admin write](../../src/server/services/admin-write.service.ts:93)

**Reproduce.** Approve a payment. The enrollment is `ACTIVE` but remains `batchId = null`, so it fails the trainee/batch eligibility query used by assignment submission. [submission eligibility](../../src/server/services/dashboard-write.service.ts:77)

**Bounded next-wave fix.** Add `assignEnrollmentToBatch` across `admin-write.schema.ts`, admin actions, `admin-write.service.ts`, and `batch.repository.ts`, accepting `{ enrollmentId, batchId, idempotencyKey }`. In one transaction, re-verify admin, require an active enrollment and matching batch program, conditionally update only `{ id, status: ACTIVE, batchId: null }`, then audit. Same-batch replay is success; a different existing batch is conflict. Add sequential and concurrent double-fire tests.

### 2. Assignment submission is a URL stub, not a typed upload contract

**Evidence.** The trainee form asks only for `https://...` and says its error path is “not wired up yet.” [submission form](../../src/features/dashboard-trainee/assignment-submission-form.tsx:30) The service upserts `submissionLink` without reading `allowedSubmissionTypes` and ignores the supplied idempotency key. [service](../../src/server/services/dashboard-write.service.ts:71) Persistence has one untyped link, no asset relation or intent key. [schema](../../prisma/schema.prisma:554) Trainer module upload is visibly disabled. [modules](../../src/features/dashboard-trainer/sections/modules-section.tsx:21)

**Reproduce.** Create an IMAGE-only assignment and submit any syntactically valid URL; no file type or ownership is checked. Concurrent different URLs race through the same upsert, so last writer wins.

**Bounded next-wave fix.** Add an owned `MediaAsset` relation and unique per-intent key to `AssignmentSubmission` in a dedicated schema migration. Add signed upload/confirm support for `ASSIGNMENT_SUBMISSION`; change the action contract to `{ assignmentId, mediaAssetId, idempotencyKey }`. The service verifies active trainee/batch enrollment, confirmed asset ownership, and asset-derived type against the allow-list before one conditional attach/upsert transaction. A deliberate resubmission mints a new key. Preserve pending/early-return UI guards and add sequential/concurrent same-intent tests.

### 3. Trainer completion is unreachable from the day-to-day product

**Evidence.** `setEnrollmentProgress` and `completeEnrollment` enforce actor ownership and conditionally create a certificate request in one transaction. [progress service](../../src/server/services/enrollment-progress.service.ts:54) The only trainer actions are evaluation and assignment creation. [actions](../../src/app/(dashboard)/dashboard/trainer/actions.ts:8) The trainee UI explicitly waits for a trainer to mark completion. [credentials](../../src/features/dashboard-trainee/credentials-section.tsx:94)

**Reproduce.** After active, assigned enrollment, use every rendered trainer section: no progress/complete control or server action exists, so no certificate request can be created through the app.

**Bounded next-wave fix.** Add Zod schemas and trainer actions for `{ enrollmentId, progressPercent }` and `{ enrollmentId, idempotencyKey }`, always deriving actor from session. Add guarded controls to `my-trainees-section`. Require 100% progress before completion unless product explicitly chooses another policy. Preserve conditional completion and test ownership plus sequential/concurrent completion.

### 4. Certificate issuance can strand approved requests permanently

**Evidence.** Approval commits, then attempts Cloudinary issuance; on failure it logs and returns success. [approval/issuance](../../src/server/services/dashboard-write.service.ts:93) `findAwaitingIssuance` and `reissuePendingCertificates` exist, but are not called outside the service. [recovery selector](../../src/server/repositories/certificate-request.repository.ts:67)

**Reproduce.** Make storage unavailable during approval. The request is approved with no `certificatePublicId`; a repeat approval is correctly rejected as non-pending, and no scheduled route processes the recovery queue.

**Bounded next-wave fix.** Add an authenticated, bounded `/api/cron/issue-certificates` runner beside existing cron routes. Validate its cron secret before querying, claim/lease work or otherwise expose attempts, call `reissuePendingCertificates(limit)`, and return aggregate counts only. Schedule it externally; add retry/backoff/terminal-failure fields if `APPROVED + NULL` cannot prevent hot looping. Test failed issuance followed by exactly-once recovery.

### 5. Authentication throttling is explicitly not production-safe

**Evidence.** Signed sessions, page role gates, and mutation-time database role re-verification are present. [session](../../src/server/auth/session.ts:59) [actor verification](../../src/server/services/actor-verification.service.ts:23) But the only limiter is an in-memory per-process map; its own source says cold starts/redeploys reset it and multiple instances multiply the effective allowance. [rate limit](../../src/server/auth/rate-limit.ts:1)

**Reproduce.** Deploy more than one instance or restart one: each process starts with an empty five-attempt bucket.

**Bounded next-wave fix.** Retain `checkRateLimit(key)` as the boundary but implement an atomic shared-store increment with expiry. Key by normalized client identity, return retry duration, fail closed if the shared limiter is unavailable in production, and add adapter-level multi-client/concurrent tests.

## SEO and public entry points

Root metadata and a handful of page titles exist, but there is no `robots.*`, `sitemap.*`, `metadataBase`, canonical/alternates, or Open Graph metadata in source. [root layout](../../src/app/layout.tsx:40) The real public `/verify/[code]` QR destination has no route-specific metadata. [verify page](../../src/app/(marketing)/verify/[code]/page.tsx:20)

Next wave should establish one validated deployment-origin config, use it as `metadataBase`, add canonical/Open Graph defaults for marketing pages, create `robots.ts` and `sitemap.ts`, and mark dashboards, API, and private certificate documents `noindex`. Verification should default to `noindex` to avoid indexing arbitrary certificate-code URLs unless product explicitly requires credential discovery.

## Coordinator browser observations — not independently re-verified

- Coordinator observed the duplicate hero-frame header still live. This aligns with pending deletion of both hero-frame files; this audit did not browser-check it.
- Coordinator observed a “zero coding → Junior Developer” testimonial after course removal. Source confirms homepage testimonials are database-backed, but the dirty seed was not treated as independently verified runtime state. [marketing page](../../src/app/(marketing)/page.tsx:8)
- Footer phone placeholder `(123) 456-7890` / `tel:1234567890` is source-confirmed. [footer](../../src/components/layout/footer.tsx:93)
- Footer Facebook and Prince IT Solutions links are source-confirmed `#` placeholders. [footer](../../src/components/layout/footer.tsx:50)

These are launch/provenance issues, not substitutes for the five lifecycle/security blockers. Do not claim them browser-fixed until the coordinator checks the live route after pending work lands.

## Next-wave verification minimum

For every new mutation: local schema rejection, wrong role, wrong ownership/program, sequential replay, and two concurrent requests. The coordinator should browser-check the actual happy path: admin → trainer → trainee → public QR verifier.
