# ADR 0001 — Data model for the HardTech platform rebuild

Status: **Accepted**. Schema formatted and validated (see Verification below).
Owner: DBA role. This ADR covers `prisma/schema.prisma` only.

## 0. Toolchain note — Prisma 7

This repo runs **Prisma 7.9.1** (`package.json`), not 5/6. Three contract
changes from the version most Prisma tutorials assume, per
`.claude/rules/40-prisma-7.md` (independently cross-checked against the
shipped type definitions in `node_modules/@prisma/config/dist/index.d.ts`
and the string table in `node_modules/prisma/build/cli.js`):

1. `generator client { provider = "prisma-client" }`, not `"prisma-client-js"`.
2. `output` is mandatory (`../generated/prisma`, gitignored) — the client no
   longer generates into `node_modules`.
3. The `datasource` block takes **only** `provider`. `url`/`directUrl` are
   not valid keys there in v7; they live in `prisma.config.ts` (CLI-side,
   already written, out of this ADR's scope) and in the app's own
   `PrismaClient` construction (`src/server/db.ts`, not this DBA's file).

Consequences for the builders who consume this schema:

- Repository-layer imports become `import { PrismaClient } from
  '@/../generated/prisma/client'`, not `'@prisma/client'`. Generated
  entrypoints: `client` (server client + `Prisma` namespace), `browser`
  (browser-safe types/enums, no real client), `enums`, `models`. Client
  components that need an enum should import it from `enums` or `browser`,
  never from `client` — pulling `client` into a browser bundle drags the
  server runtime with it.
- `Prisma.validator()` is removed in the v7 generator. Use TypeScript
  `satisfies` instead, e.g. `const x = { id: true } satisfies
  Prisma.ForumPostSelect`.
- `DATABASE_URL` (pooled, port 6543, `?pgbouncer=true`) is what the app
  runtime's `PrismaClient` should use. `DIRECT_URL` (port 5432) is what
  `prisma.config.ts` gives the CLI for `migrate`/`db push`, because DDL and
  advisory locks don't survive a transaction-mode PgBouncer pool. Never
  point migrations at the pooled URL.

## 1. Verification

Run from the repo root, with placeholder connection strings supplied only as
process env vars (no `.env` file was created or modified — `prisma.config.ts`
requires `DIRECT_URL`/`DATABASE_URL` to resolve at config-load time even for
static checks, and neither is this DBA's file to own):

```
$ npx prisma format
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Formatted prisma\schema.prisma in 38ms 🚀

$ npx prisma validate
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
```

Both succeeded. `prisma generate` / `prisma migrate` were not run, per scope.

## 2. Entities and the screens that drive them

Grouped by subsystem. "Screen" citations use the doc filenames
(`desktop-01/02`, `mobile-01..06`) and the screenshot index inside them.

### Identity

- **User** — every authenticated person (trainee/trainer/admin). Drives
  `/login` (desktop-02 #1), User Management table (desktop-02 #4-7), all
  three dashboard sidebars, every forum byline.
- **TrainerProfile** — trainer-only bio, credentials list, Facebook link,
  status. Drives the 4 `/about` instructor cards (desktop-01 #9,
  mobile-01 #15-20) and admin Trainer Management (desktop-02 #8).

### Catalog

- **Program** — the 5-program catalog. Drives `/programs`
  (desktop-01 #14-17), `/enroll` Step 1 (desktop-01 #26), and every admin
  Program `<Select>` (desktop-02 #6: "Computer Hardware, Cellphone Repair,
  Software Dev, Networking Basics, CCTV Installation").
- **ProgramCurriculumTopic** — one "COURSE MODULES" checklist line
  (desktop-01 #15-17).

### Enrollment & money

- **Batch** — one cohort of a program under one trainer (e.g. "Batch
  2026-A"), named on every trainer/trainee dashboard subtitle
  (desktop-02 #14, #22).
- **Enrollment** — one trainee in one program (`ENR-xxxx`). Drives admin
  "Enrollments & Payment Verification" (desktop-02 #3), trainee "Enrolled
  Programs" (desktop-02 #25), and the "Program Mix" donut (desktop-02 #2).
- **EnrollmentPayment** — one checkout/payment event, which can fund 1-3
  Enrollment rows at once. Drives the full `/enroll` Step 3-5 flow
  (desktop-01 #27-32, mobile-04 #11-32 — the canonical 3-program walkthrough).

### Training delivery

- **Evaluation** — a trainer's rating of a trainee's enrollment. Drives "My
  Trainees > Evaluate" (desktop-02 #17-18) and the "Trained Graduate" badge
  (mobile-06).
- **CertificateRequest** — a request for the official e-certificate. Drives
  admin "Certificate Approvals" (desktop-02 #9) and the trainee "Official
  E-Certificate" lifecycle: Locked -> Pending Approval -> Approved
  (mobile-03 #31-32, mobile-06 #14:33:18).
- **TrainingSession** — one calendar event. Drives trainer "Training
  Calendar" (desktop-02 #15) and trainee "Session Schedule" (desktop-02 #23).
- **Assignment** / **AssignmentSubmission** — trainer-posted tasks and
  trainee submissions (desktop-02 #19-20, mobile-03 "Submitting
  Assignments").
- **Module** — trainer-uploaded learning-material file. The same rows back
  both trainer "Modules" (desktop-02 #21) and trainee "Materials"
  (desktop-02 #26).

### Site-wide admin

- **Announcement** — feeds the landing-page "Live Updates" ticker
  (desktop-01 #1-2). Managed at desktop-02 #10.
- **PaymentMethodConfig** — the 4 payment channels shown on `/enroll` Step 3,
  admin-editable at desktop-02 #12.
- **AuditLog** — one row per mutation. Drives desktop-02 #13; category enum
  confirmed against mobile-02 help section 9 (9 categories, not the 7 first
  visible in the desktop screenshot's clipped dropdown).
- **Notification** — one bell-icon item (mobile-04 help "Reading Your
  Notifications").

### Forum

- **ForumPost**, **Reply** — posts/replies across the general forum and
  communities (desktop-01 #11-13, mobile-01 #24-30).
- **PostReaction**, **ReplyReaction** — like/helpful/insightful toggles.
- **PostBookmark** — the forum "Bookmarks" tab / "My Bookmarks" rail
  (desktop-02 #28).
- **PostReport** — the 5-reason report dialog (mobile-04 "Reporting
  Inappropriate Content").
- **AuthorRating** — "Rate this author" (desktop-02 #30) and the Rating
  Leaderboard (desktop-01 #11-13).

### Communities

- **Community** — region-scoped, slug-addressed (desktop-02 #28-29).
- **CommunityMembership** — join state, public (instant) vs. private
  (admin-approved) (mobile-03 help "Approving Community Join Requests").

### Marketing content (flagged, see Open Questions)

- **GalleryPhoto**, **Testimonial**, **Faq** — back `/gallery`
  (desktop-01 #18), the homepage testimonial grid (desktop-01 #4-5), and the
  `/contact` FAQ accordion (desktop-01 #22-25). No admin CRUD screen was
  observed for any of the three; see §6.

**Total: 29 models.**

## 3. Enums (23) and where each value is confirmed

| Enum | Values | Source |
|---|---|---|
| `UserRole` | TRAINEE, TRAINER, ADMIN | desktop-02 #5 (Role select) |
| `UserStatus` | ACTIVE, PENDING, SUSPENDED | desktop-02 #7 (Status select) — matches known facts |
| `TrainerStatus` | ACTIVE, ON_LEAVE, SUSPENDED | mobile-02 help §10 — **not** in the confirmed-facts list, flagged in §6 |
| `EnrollmentStatus` | PENDING_VERIFICATION, ACTIVE, COMPLETED, REJECTED | desktop-02 #3 badges + mobile-06 Graduate persona |
| `EnrollmentPaymentStatus` | SUBMITTED, VERIFIED, REJECTED | desktop-01 #27-32, mobile-04 receipt flow |
| `PaymentMethod` | GCASH, MAYA, BANK_TRANSFER, CARD | desktop-01 #27, desktop-02 #12 |
| `EvaluationRating` | CERTIFIED, COMPETENT, NEEDS_IMPROVEMENT | desktop-02 #17 — matches known facts |
| `CertificateStatus` | PENDING, APPROVED, REJECTED | desktop-02 #9 |
| `SessionType` | LECTURE, HANDS_ON, WORKSHOP, ASSESSMENT | desktop-02 #14, mobile-05 #35 |
| `SubmissionType` | IMAGE, VIDEO, DOCUMENT | desktop-02 #20 |
| `ModuleFileType` | PDF, MP4, DOCX | desktop-02 #21, mobile-06 |
| `AnnouncementType` | UPDATE, NOTICE, INFO | desktop-02 #10 (chip group; the `/help` copy says "Info/Warning/Success" — inconsistent, flagged in §6, the schema follows what the actual screenshot shows) |
| `MediaType` | IMAGE, VIDEO | desktop-02 #10 |
| `AuditCategory` | USER, ENROLLMENT, PAYMENT, CERTIFICATE, CALENDAR, MODULE, SYSTEM, FORUM, COMMUNITY | mobile-02 help §9 (9 values; desktop-02 #13's live dropdown was clipped by the viewport at 7) |
| `ForumCategory` | GENERAL_DISCUSSION, QA_HELP, RESOURCES_TIPS, TROUBLESHOOTING, CAREER_JOBS, ANNOUNCEMENTS | desktop-01 #11 — matches known facts |
| `PostStatus` | PENDING_APPROVAL, PUBLISHED, REJECTED | desktop-01 guideline 5, mobile-03 "Moderating a Community" |
| `ReactionType` | UPVOTE, HELPFUL, INSIGHTFUL | desktop-01/02 post footer icons, mobile-01 #29 reaction buttons |
| `ReportReason` | SPAM, HARASSMENT, MISINFORMATION, OFF_TOPIC, OTHER | mobile-04 "Reporting Inappropriate Content" step 2 |
| `ReportStatus` | PENDING, ACTIONED, DISMISSED | inferred moderation lifecycle for a report row; not directly screenshotted as a 3-state UI, flagged in §6 |
| `CommunityTopic` | MOBILE_REPAIR, DESKTOP_REPAIR, NETWORKING, TROUBLESHOOTING | desktop-02 #29 tag badges — matches known facts |
| `CommunityVisibility` | PUBLIC, PRIVATE | desktop-02 #29 "PUBLIC" badge, mobile-03 help (public vs private join) |
| `CommunityRole` | MEMBER, MODERATOR | mobile-03 help "Moderating a Community" (gold shield badge) |
| `MembershipStatus` | PENDING, APPROVED, REJECTED | mobile-03 help "Approving Community Join Requests" |

## 4. Index list and the query each one serves

Every index below maps to a WHERE/ORDER BY/JOIN a specific screen performs.
No index was added for a query no screen performs (e.g. no full-text/trigram
index on `User.firstName`/`lastName` — see §6).

| Model.index | Screen query it serves |
|---|---|
| `User(role)` | User Management role filter (desktop-02 #4, "All roles/Admins/Trainers/Trainees") |
| `User(status)` | User Management status filter / admin pending-user queue |
| `TrainerProfile(primaryProgramId)` | Trainer Management "trainer -> program" card lookup |
| `TrainerProfile(status)` | mobile-02 help §10 "filter by status (Active, On Leave, Suspended)" |
| `Program(primaryTrainerId)` | `/programs` instructor mini-card join |
| `ProgramCurriculumTopic(programId, sortOrder)` | ordered "COURSE MODULES" checklist render |
| `Batch(trainerId)` [+ `@@unique(programId, code)`] | Trainer Management assigned-batch lookup; batch-code uniqueness |
| `Enrollment(traineeId)` | trainee's own Enrolled Programs / dashboard join |
| `Enrollment(status)` | admin pending-review queue (desktop-02 #3) |
| `Enrollment(programId, status)` | Program Mix donut (`COUNT(*) GROUP BY programId WHERE status='ACTIVE'`) |
| `Enrollment(batchId)` | trainee Session Schedule / Materials scoped to their batch |
| `Enrollment(createdAt)` | Reports & Analytics "Enrollments by Month" bucketing (desktop-02 #11) |
| `EnrollmentPayment(traineeId)` | trainee's own payment history |
| `EnrollmentPayment(status)` | admin "Pending Review" stat card |
| `EnrollmentPayment(createdAt)` | Analytics "Revenue Trend" bucketing |
| `Evaluation(enrollmentId)` | "My Trainees" card evaluation lookup |
| `Evaluation(trainerId)` | trainer's own evaluation history |
| `CertificateRequest(enrollmentId)` | Credentials page cert-status lookup |
| `CertificateRequest(status)` | admin Certificate Approvals pending queue |
| `TrainingSession(batchId, sessionDate)` | trainee Session Schedule month view |
| `TrainingSession(trainerId, sessionDate)` | trainer Training Calendar month view |
| `Assignment(batchId)` | trainee Assignments list scoped to their batch |
| `Assignment(trainerId)` | trainer Assignments list |
| `Assignment(dueDate)` | assignment list sort/due soonest |
| `Module(programId, unitNumber)` | Materials/Modules list ordered by unit |
| `Module(trainerId)` | trainer's own Modules list |
| `Announcement(isPinned, createdAt)` | pin-to-top-then-newest ordering (desktop-02 #10) |
| `AuditLog(category, createdAt)` | Audit Log category filter + chronological sort (desktop-02 #13) |
| `AuditLog(referenceId)` | looking up all log rows for one `ENR-`/`U-`/`EV-`/`CRT-` id |
| `AuditLog(actorUserId)` | "actions by this admin/trainer" queries |
| `Notification(userId, isRead)` | bell panel "Unread"/"Read" tabs |
| `Notification(userId, createdAt)` | last-20 retention ordering |
| `ForumPost(category)` | forum category filter chips |
| `ForumPost(communityId)` | community detail page's post feed |
| `ForumPost(status)` | fail-closed "only PUBLISHED posts are public" filter |
| `ForumPost(isPinned)` | pinned-post-first ordering |
| `ForumPost(isTrending)` | "Trending" tab |
| `ForumPost(createdAt)` | "Newest" sort |
| `ForumPost(viewCount)` | "Most Viewed" sort |
| `ForumPost(replyCount)` | "Most Active" sort |
| `ForumPost(authorId)` | author's post count / profile page |
| `Reply(postId)` | fetching a post's replies |
| `Reply(parentReplyId)` | nested-reply lookup |
| `Reply(authorId)` | author's reply count |
| `PostReaction(userId)` | "did I react to this" reverse lookup |
| `ReplyReaction(userId)` | same, for replies |
| `PostBookmark(postId)` | "how many users bookmarked this post" |
| `PostReport(status)` | moderation queue for pending reports |
| `AuthorRating(ratedUserId)` | average-rating computation / leaderboard join |
| `Community(region)` | `/communities` region filter |
| `Community(primaryTopic)` | `/communities` topic filter |
| `Community(visibility)` | public/private filter |
| `CommunityMembership(communityId, status)` | per-community pending-join-request queue |
| `CommunityMembership(userId)` | "my communities" lookup |
| `GalleryPhoto/Testimonial/Faq(sortOrder)` | display ordering on their respective public pages |

Every `@@unique` listed in §5 also functions as an index and is not
duplicated here.

## 5. Idempotency and duplicate-safety (non-negotiables rules 2 & 3)

### Toggle-style actions (rule 3: compound `@@unique([userId, targetId])`)

| Action | Constraint | Why it's idempotent |
|---|---|---|
| Post reaction | `PostReaction.@@unique([postId, userId, type])` | a repeat tap on "Like" hits the same row; the service does an upsert/no-op instead of inserting a second row |
| Reply reaction | `ReplyReaction.@@unique([replyId, userId, type])` | same pattern |
| Bookmark | `PostBookmark.@@unique([userId, postId])` | double-fire bookmark toggle cannot double-count |
| Report | `PostReport.@@unique([postId, reporterId])` | repeat-clicking "Report" cannot file duplicates |
| Author rating | `AuthorRating.@@unique([ratedUserId, raterUserId])` | a re-rate updates the existing row rather than duplicating |
| Community join | `CommunityMembership.@@unique([communityId, userId])` | double-fire "Join" cannot create two membership rows |
| Assignment resubmission | `AssignmentSubmission.@@unique([assignmentId, traineeId])` | "you can re-submit to update your answer" (mobile-03) updates the same row |

In every case the constraint holds under concurrency because Postgres
enforces a unique B-tree index atomically at insert time: two concurrent
transactions racing to insert the same key can't both win — the loser gets a
unique-violation at commit, which the service layer catches and treats as
"already done" (an upsert, or `INSERT ... ON CONFLICT DO NOTHING` followed by
a read). A prior `SELECT`-then-`INSERT` check would **not** be safe under
concurrency; the unique constraint is what makes it safe, not the check.

### Enrollment (non-negotiables rule 2 + project-specific note: "the
highest-risk mutating flow")

The concrete mechanism:

1. The `/enroll` wizard mints one **idempotency key client-side when the
   form mounts** (per `.claude/rules/00-non-negotiables.md`), carried through
   Steps 1-3 and submitted with the "Confirm Payment" click.
2. That key lands on `EnrollmentPayment.idempotencyKey`, which is
   `@unique`. This is the **idempotency-key store** pattern from rule 2.
3. All `Enrollment` rows for the checkout (one per selected program) are
   created in the same transaction as their `EnrollmentPayment`, referencing
   it via `paymentId`.
4. If the "Confirm Payment" request is retried (double-click, network retry,
   duplicate submit) with the same key, the second `INSERT` into
   `EnrollmentPayment` collides on `idempotencyKey` — the service catches
   the unique-violation and returns the **existing** payment/enrollment rows
   instead of creating new ones. No duplicate checkout, therefore no
   duplicate `Enrollment` rows, ever.
5. `Enrollment.@@unique([paymentId, programId])` is a second, defense-in-
   depth constraint: even if a client bug submitted the same program twice
   in one program-selection array against a *single* payment row, the DB
   still refuses to insert two `Enrollment` rows for the same
   (payment, program) pair.
6. Re-enrollment after graduation ("Re-Enrolling in a New Program",
   mobile-03) is a **new** `EnrollmentPayment` with its own new
   `idempotencyKey`, so it is not blocked by a prior, unrelated enrollment in
   the same program — the constraint only blocks *retries of the same user
   intent*, which is exactly what rule 2 asks for ("generated once per user
   intent, not per attempt").

This concretely answers requirement 4: the constraint that makes a
double-submitted enrollment impossible to insert twice is
`EnrollmentPayment.idempotencyKey @unique`, backed by
`Enrollment.@@unique([paymentId, programId])` for the multi-program edge
case, and it holds under concurrency for the same reason as the toggles
above — atomic unique-index enforcement, not a read-then-write check.

## 6. Requirements 5, 6, 7 — how they're satisfied

- **Requirement 5 (state transitions, not booleans):** every
  approval/moderation flow with more than two real states is an enum, not a
  boolean: `EnrollmentStatus` (4), `EnrollmentPaymentStatus` (3),
  `CertificateStatus` (3), `PostStatus` (3), `MembershipStatus` (3),
  `PostReport.status` (3), `UserStatus` (3), `TrainerStatus` (3). Each of
  these is designed to be guarded by a conditional `UPDATE ... WHERE status
  = <expected-current-state>` so two moderators acting on the same row at
  once cannot both fire side effects — only the winning UPDATE affects a
  row, the other affects zero rows and the service treats that as "already
  handled." `isPinned`/`isTrending` on `ForumPost` are correctly booleans,
  not enums, because the spec explicitly calls them out as **independent**
  flags rather than a state machine.
- **Requirement 6 (money):** every amount field is `Decimal @db.Decimal(12,
  2)` — `Program.priceAmount`, `Enrollment.amount`,
  `EnrollmentPayment.totalAmount`. No `Float`/`Int` money anywhere.
- **Requirement 7 (audit log coverage):** `AuditLog.category` covers all 9
  confirmed categories (user, enrollment, payment, certificate, calendar,
  module, system, forum, community), and every mutation the Audit Log screen
  shows has a home: role/status change -> `USER`; enrollment
  approve/reject/re-enroll -> `ENROLLMENT`; payment verify -> `PAYMENT`;
  certificate approve -> `CERTIFICATE`; session create -> `CALENDAR`; module
  upload -> `MODULE`; forum post approve -> `FORUM`; community join approve
  / community edit -> `COMMUNITY`.

## 7. Open questions (flagged, not silently resolved)

1. **`TrainerStatus.ON_LEAVE`** is evidenced only by mobile-02 help copy
   ("filter by status: Active, On Leave, Suspended"), not by the
   confirmed-facts list (which only names the generic `UserStatus` 3
   values). Recommended default: keep `TrainerStatus` as its own enum,
   separate from `UserStatus`, as modeled — but confirm with product whether
   a suspended *trainer* should also flip their underlying `User.status`, or
   whether the two are meant to vary independently (e.g. a trainer "on
   leave" whose login should still work).
2. **`Enrollment` vs. the marketing `Program` content mismatch**
   (desktop-01 open question #5): `/programs` lists Computer Hardware
   Servicing as "3 Months (120 hrs)" while `/enroll` Step 1 shows the same
   program as "40 hrs / 5 weeks" with a *different* curriculum-topic list.
   The schema treats these as the **same** `Program` row with **one**
   canonical `ProgramCurriculumTopic` set (taken from the fuller
   `/programs` marketing content). If product actually intends `/enroll` to
   sell a shorter "module" variant of the program, that is a distinct
   product decision this ADR is deliberately not inventing a new entity for
   — flagging it here rather than guessing.
3. **Trainer-to-trainee program mismatch** (desktop-02 open question #2):
   Trainer Management shows Henry Gomata Lopez's trainees all under
   "Cellphone Repair," while User Management shows two of the same trainees
   enrolled in "Computer Hardware." The schema supports the *correct*
   multi-program reality (`Program.primaryTrainerId` lets one trainer be
   linked from several `Program` rows; `Batch`/`Enrollment` are the real
   source of truth for who's actually enrolled where) plus a simplified
   `TrainerProfile.primaryProgramId` for the Trainer Management card's
   single-program display. Recommend the builder treat `Enrollment`/`Batch`
   as authoritative and treat the Trainer Management card's single-program
   label as a display simplification, not a constraint.
4. **Reputation/leaderboard ranking formula** (mobile-04 help: "ranks users
   by reputation points, post count, upvotes received, and helpful
   replies") is never shown as a literal formula in any screenshot. No
   `reputationScore` column was added — the schema computes ranking from
   existing rows (`AuthorRating` average, `ForumPost` count via `authorId`,
   `PostReaction` counts via post `authorId`). If this proves too slow at
   scale, recommend adding a cached `reputationScore` column or a
   materialized view later rather than guessing the formula now.
5. **Testimonial / GalleryPhoto / Faq have no observed admin CRUD screen.**
   All three are modeled as plain tables (not hardcoded frontend content)
   because they are dynamic-looking, orderable content sections; but no
   screenshot shows an admin creating/editing a testimonial, gallery photo,
   or FAQ entry. Recommended default: keep them as tables (seed via
   migration/script), and flag to the product owner that an admin screen
   for these may be a real gap, not an intentional omission.
6. **Free-text search** ("Search users...", "Search posts, authors, or
   tags...") is modeled with no trigram/GIN index — Postgres `ILIKE` search
   works without one at the row counts implied by the screens (single/low
   double digits), but will not scale. Recommended default: add a `pg_trgm`
   extension + GIN index in a later migration if/when search performance
   becomes a real problem; not added now because no screen's data volume
   justifies it yet, per the instruction not to add speculative indexes.
7. **`AnnouncementType` copy inconsistency**: the actual UI chip group shows
   `Update` / `Notice` / `Info` (desktop-02 #10), but the `/help` Filipino
   walkthrough copy says "select the type (Info / Warning / Success)" — a
   different 3-word set. The enum follows the literal UI screenshot
   (`UPDATE`, `NOTICE`, `INFO`) since that is the actual control users
   interact with; the help-page copy is flagged as inconsistent source
   content, not silently reconciled into the schema.
8. **`Help Center` content itself is out of scope for this schema.** The
   bilingual (EN/Filipino) 14/8/14-section walkthrough content
   (mobile-02/03/04) is treated as static app copy (i18n JSON), not a DB
   entity — no screen shows an admin editing Help Center text, and modeling
   translated rich-step content would be pure speculation.
9. **Program Mix donut counts (185/156/145) vs. marketing "2,400+ enrolled"
   badges are two different numbers** (flagged already in mobile-04 §
   Open Questions). `Program.marketingEnrolledLabel` is modeled as free-text
   marketing copy, deliberately **not** derived from `Enrollment` rows, so
   the two data sources are never conflated in the schema.

## 8. Constraints not expressible in Prisma schema

Prisma's schema DSL has no `CHECK` constraint syntax — self-review of
`schema.prisma` found two real integrity gaps that only exist as raw SQL:
`AuthorRating` permitted self-rating, and `AuthorRating.stars` had no range
guard. Sweeping the rest of the schema for the same two problem classes
(implied numeric ranges; self-referential relations where a row pointing at
itself is nonsense) surfaced two more of the same bug class. All four are
fixed in `prisma/migrations/20260729173000_author_rating_integrity/migration.sql`,
alongside a full non-negative sweep of every counter/size/order column and
every non-negative money column. `schema.prisma` carries a short pointer
comment next to each affected field so a reader of the schema alone isn't
surprised by a DB-level rule living in a migration.

**These CHECKs are the durable backstop, not the UX.** The service layer
must still validate at the boundary (reject a 0-star or 6-star rating, a
self-rate attempt, a self-approval attempt, etc.) so the user gets a proper
4xx/validation error instead of a raw Postgres constraint-violation message.
The constraint exists so that a missed or buggy service-layer check still
cannot write permanently bad data — not so the service layer can skip
validating.

| Constraint | Model | Prevents | Screen that makes it matter |
|---|---|---|---|
| `AuthorRating_no_self_rating` | AuthorRating | `ratedUserId = raterUserId` | Rating Leaderboard is a visible ranked feature (desktop-01 #11-13, desktop-02 #28); unguarded self-rating lets any user take the top slot |
| `AuthorRating_stars_range` | AuthorRating | `stars` outside 1..5 | the rating control is a 5-star widget everywhere it appears |
| `Reply_no_self_parent` | Reply | `parentReplyId = id` | Reply's self-relation (mobile-01 #29-30) has no legitimate case where a reply is its own parent |
| `ForumPost_no_self_approval` | ForumPost | `authorId = approvedByUserId` | "Trainee posts require approval" (desktop-01 forum guideline 5) is meaningless if a post can be self-approved |
| `EnrollmentPayment_no_self_verification` | EnrollmentPayment | `traineeId = verifiedByUserId` | admin "Verify & Approve" (desktop-02 #3) is a financial control; a trainee (possibly later promoted via User Management "Update role") must never be recorded as verifying their own payment |
| `Program_price_amount_non_negative` | Program | `priceAmount < 0` | `/programs`, `/enroll` Step 1 prices |
| `Enrollment_amount_non_negative` | Enrollment | `amount < 0` | Enrollment review cards (desktop-02 #3) |
| `Enrollment_progress_percent_range` | Enrollment | `progressPercent` outside 0..100 | every "Program Progress"/"Overall Progress" bar (desktop-02 #16, #22, #25) |
| `EnrollmentPayment_total_amount_non_negative` | EnrollmentPayment | `totalAmount < 0` | receipt "Amount Paid" (desktop-01 #30-31) |
| `ForumPost_view_count_non_negative` | ForumPost | `viewCount < 0` | post footer view count |
| `ForumPost_upvote_count_non_negative` | ForumPost | `upvoteCount < 0` | post footer upvote count |
| `ForumPost_helpful_count_non_negative` | ForumPost | `helpfulCount < 0` | post footer helpful count |
| `ForumPost_insightful_count_non_negative` | ForumPost | `insightfulCount < 0` | post footer insight marker |
| `ForumPost_reply_count_non_negative` | ForumPost | `replyCount < 0` | post footer reply count / "Most Active" sort |
| `ForumPost_bookmark_count_non_negative` | ForumPost | `bookmarkCount < 0` | bookmark icon count |
| `ForumPost_report_count_non_negative` | ForumPost | `reportCount < 0` | report icon count |
| `Reply_upvote_count_non_negative` | Reply | `upvoteCount < 0` | reply reaction footer (mobile-01 #30) |
| `Reply_helpful_count_non_negative` | Reply | `helpfulCount < 0` | reply reaction footer |
| `Reply_insightful_count_non_negative` | Reply | `insightfulCount < 0` | reply reaction footer |
| `Module_file_size_bytes_non_negative` | Module | `fileSizeBytes < 0` | Modules/Materials list file-size display (desktop-02 #21, #26) |
| `ProgramCurriculumTopic_sort_order_non_negative` | ProgramCurriculumTopic | `sortOrder < 0` | "COURSE MODULES" checklist order |
| `GalleryPhoto_sort_order_non_negative` | GalleryPhoto | `sortOrder < 0` | `/gallery` grid order |
| `Testimonial_sort_order_non_negative` | Testimonial | `sortOrder < 0` | testimonial grid order (desktop-01 #4-5) |
| `Faq_sort_order_non_negative` | Faq | `sortOrder < 0` | `/contact` FAQ accordion order |

**Considered and deliberately not added** (same sweep, different conclusion):

- `PostReport.reporterId` vs. `resolvedByUserId` — both FK to `User`, the
  same shape as `AuthorRating`'s pair, but not the same bug class. Reporter
  and resolver are different functional roles (any user vs. a moderator/
  admin), not a symmetric peer relationship where self-reference is
  definitionally meaningless. No screen states a rule against the same user
  filing and resolving a report, and a blanket `CHECK` here could reject a
  legitimate edge case (e.g. an admin resolving a report they themselves
  filed against their own test content). Left to authorization (only
  admins/moderators can resolve) rather than a table CHECK.
- `Evaluation.trainerId` vs. `revokedByUserId` — the "Undo Evaluation"
  button (desktop-02 #16) is shown on the same trainer's own trainee card,
  i.e. **self-revocation by the same trainer is the expected, normal path**,
  not a bug. Adding a self-reference guard here would block a real feature.
- `CertificateRequest` "self-approval" (a trainee approving their own
  certificate) is conceptually the same class of bug as `ForumPost`'s, but
  `CertificateRequest` doesn't store the trainee's id directly — only
  `enrollmentId`, one hop away from the trainee via `Enrollment.traineeId`.
  A single-table Postgres `CHECK` cannot reach across that join. Enforcing
  this would need a trigger (a bigger step than a `CHECK`) or an
  application-layer guard; flagged here as a real but not-CHECK-able gap
  rather than forcing a mismatched fix.
