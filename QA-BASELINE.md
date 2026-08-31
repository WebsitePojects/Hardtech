# Codex baseline QA log

Date: 2026-08-15
Branch: `codex`
Scope: read-only frontend, backend, and security review before implementation

## Findings

### QA-001 — custom cursor ring is not centered on the pointer

- Severity: medium; reproducible visually on fine-pointer devices.
- Evidence: `src/components/motion/custom-cursor.tsx` applies
  `translate(-50%, -50%)` to both cursor elements. `src/app/globals.css` then
  applies `margin: -13px 0 0 -13px` to the 32px ring and `-23px` to the 52px
  hover ring. Those offsets are added after the shared centering transform,
  shifting the ring up/left instead of centering it on the pointer.
- Expected: the dot and ring share the exact pointer center at rest, hover,
  and active states.

### QA-002 — homepage program carousel clips its cards on small viewports

- Severity: high; reproducible at mobile widths.
- Evidence: `src/features/home/programs-carousel.tsx` uses a fixed
  `h-[106px]` track and `h-[100px] w-[190px]` cards, while each card contains
  an icon tile, a title, and two badges. The same file puts the card content in
  a non-scrolling `overflow-hidden` article. The content cannot reliably fit
  the 100px card height, so titles/badges are clipped and cards do not present
  as complete cards.
- Expected: every active card is fully readable at mobile and desktop widths;
  neighbors may peek, but the active card must not be cropped.

### QA-003 — program imagery is incomplete for seeded catalog entries

- Severity: medium; visible on the homepage and programs catalog.
- Evidence: `src/features/programs/program-visuals.tsx` maps photos only for
  Computer Hardware Servicing and Cellphone Hardware Servicing. Networking
  Basics and CCTV Installation deliberately resolve to an icon panel. This
  avoids a blank card, but it still violates the product expectation that
  every program card has a training image.
- Expected: every seeded program has a stable local image asset, or the UI
  clearly treats an intentionally designed illustration as the program visual.

### QA-004 — visual finish is inconsistent with the requested premium motion language

- Severity: medium; design review finding.
- Evidence: the carousel uses inline transform math and opacity changes but no
  coherent enter/exit choreography, and the gallery grid uses fixed tile spans
  without a tested layout contract for all photo counts. Existing motion tokens
  are present in `src/components/motion/easing.ts`, but the reviewed carousel
  does not use a named easing system beyond a generic Tailwind duration.
- Expected: consistent interaction curve, intentional reveal states, responsive
  geometry, reduced-motion behavior, and no clipping or dead visual states.

### QA-005 — backend mutation surface requires full regression verification

- Severity: verification item, not yet a confirmed vulnerability.
- Evidence: the project has multiple server actions/services and upload route
  handlers. Existing source shows boundary schemas, session checks, and several
  idempotency paths, but the isolated worktree currently has no installed
  dependencies, so typecheck, lint, mutation tests, and production build have
  not yet executed in this baseline pass.
- Expected: all baseline commands pass, including duplicate-fire tests and
  upload/auth boundary tests, before any implementation is called complete.

## Baseline commands

- `git diff --check`: passed.
- Static source review: completed.
- `npm ci --ignore-scripts`: running in the isolated worktree; results pending.
- Typecheck/lint/mutation tests/build: pending dependency installation.

## Post-fix verification log

- `npm run typecheck`: passed after Prisma client generation and messaging
  service implementation.
- `npm run lint`: passed with one pre-existing warning in
  `src/components/image-lightbox.tsx` for its intentional user-upload `<img>`.
- `npm run build`: passed on Next.js 16.2.12; all 27 routes compiled and
  generated successfully.
- Playwright `/messages/dev-preview` at 390px: passed with `scrollWidth=390`
  and `viewport=390` (no horizontal overflow).
- Playwright cursor geometry at 1280px: passed; the 32px ring rect centered at
  the pointer and computed margin is `0px`.
- `npm run test`: blocked by missing `DATABASE_URL`/`TEST_DATABASE_URL`; 11 of
  12 suites failed during database bootstrap, while the initials test passed.
- `npm run test:db`: blocked because no test database with migrations is
  configured in the isolated worktree.
- `npm audit --omit=dev --audit-level=high`: reports 7 high and 1 moderate
  transitive vulnerabilities, including Next's PostCSS/sharp chain. Do not
  force-upgrade blindly; resolve against the project's pinned Next 16.2.12
  compatibility requirements.

## Security findings confirmed during implementation

### QA-006 — messaging attachments were not ownership-scoped

- Severity: high before fix; fixed in `messaging.repository.ts`.
- The first messaging write path connected arbitrary submitted asset IDs to a
  message. It now requires every attachment to be an active, unclaimed asset
  uploaded by the authenticated sender, inside the same transaction as the
  message insert.

### QA-007 — messaging backend was absent from the inherited worktree

- Severity: high before fix; fixed in the codex worktree.
- The inherited routes imported `messaging.service.ts` and the action file was a
  screenshot-only stub. The codex worktree now has repository/service/action
  implementations with session auth, boundary parsing, participant scoping,
  idempotent message replay, duplicate-safe conversation creation, and atomic
  unread-counter updates.

## System-wide browser/design pass

- Local browser sweep on port 3000 returned HTTP 200 for `/`, `/about`,
  `/programs`, `/gallery`, `/contact`, `/help`, `/login`,
  `/messages/dev-preview`, `/communities`, and `/forum` at desktop and mobile
  viewports.
- The same sweep measured `scrollWidth === viewportWidth` for every route at
  1440px and 390px, so no horizontal overflow was found.
- Playwright visual review found a mobile first-paint defect: the hero's VGL
  masked-line animation briefly hid the primary headline on narrow viewports.
  The mobile breakpoint now renders hero content immediately while desktop keeps
  the choreography.
- External reference check through Playwright confirmed Linear and Apple were
  reachable; the redesign direction borrows their discipline around restrained
  surfaces, clear hierarchy, and motion that supports orientation, while
  preserving HardTech's green brand identity and existing route IA.

## Database integration follow-up

- The Vercel-formatted `.env.vercel` available in the original checkout points
  to `hardtech.pro` and the production Supabase project; it was not used for
  mutation testing.
- A local PostgreSQL 17 service is listening on `localhost:5432`, but the
  checked-in local connection string has no password and the server requires
  SCRAM authentication. `npm run test:db` therefore stops at connection setup
  with `client password must be a string`.
- No Vercel preview/staging credentials or linked Vercel project metadata are
  present in the worktree, so staging integration remains pending a real
  staging connection string. Production was intentionally left untouched.

## Role-based product QA

- Admin, trainer, and trainee seeded accounts all completed real login against
  the Supabase project and rendered their role-specific dashboard surfaces.
- Cross-role dashboard access is fail-closed: each role was redirected away
  from the other role's dashboard route back to its own dashboard.
- `/messages` initially returned HTTP 500 for every authenticated role because
  the new repository selected a nonexistent `User.avatarUrl` Prisma field.
  Fixed by selecting only schema-backed user fields and supplying the UI's
  nullable avatar contract as `null`; all three roles then returned HTTP 200.
- Direct-message creation was exercised twice from the admin account to the
  trainer account. Both requests resolved to the same conversation ID,
  proving the direct-key path is duplicate-safe. The synthetic conversation
  was deleted after verification.
- Mobile role checks found no horizontal overflow at 390px. The empty inbox
  is understandable but has only a text hint to start from a forum post; a
  first-message CTA or searchable people directory would reduce dead ends.
- Admin browser QA exposed a duplicate React key (`Certificate
  Chain-Computer Hardware`) when pending and approved certificate rows share
  an ID. Fixed by including status in the rendered key.
- Admin analytics emits Recharts `width(0)/height(0)` warnings during hidden
  section mounts. This is a resilience/visual QA issue to address with an
  explicit measurable chart container before production polish.
- Supabase security advisors report RLS enabled with no policies on many
  public tables, including messaging and dashboard tables. This is a high
  priority authorization review item before exposing any direct Data API
  access; the application currently relies on server-side Prisma access.
- The aggregate mutation run timed out after 180 seconds. The isolated role
  verification suite passed 10/10; the DB integrity suite connected but its
  fixture aborts on an existing program name because it only handles ID
  conflicts. The fixture should be made namespace-safe before treating the
  full suite as a reliable gate.

## Enrollment-to-graduation role play

- Anonymous visitor can browse marketing pages, programs, gallery, help,
  forum, and communities. Protected dashboard, messaging, posting, and direct
  messaging correctly require login.
- Anonymous enrollment successfully reached account creation, payment method
  selection, screenshot proof upload, and receipt generation using the latest
  QA screenshot as the proof file. The resulting payment was persisted as
  `SUBMITTED` with a real Cloudinary asset and the new account remained unable
  to sign in before verification, which is the intended gate.
- Admin login with `admin@gmail.com` / `admin@2026` displayed the new payment in
  Enrollments & Payment Verification, including the “View uploaded receipt” and
  “Verify & Approve” controls. The admin approval was exercised through the UI;
  Supabase then showed the payment as `VERIFIED`, the enrollment as `ACTIVE`,
  and `verifiedAt` populated.
- The synthetic user, enrollment, payment, and Cloudinary proof were removed
  after verification. No test residue remains for that identity.
- A seeded graduate persona (`Liza Cruz`) was exercised locally and showed
  completed-training status, 92% progress, no active sessions, the graduate
  state, and the credentials surface. The fresh-trainee path was not advanced
  all the way through trainer-created assignments, completion, and certificate
  issuance because the dev server became unresponsive during repeated
  post-approval login attempts; those transitions remain an open end-to-end
  gate rather than being claimed as passed.
- Product gap: a newly approved trainee has no explicit “what happens next”
  onboarding state explaining when a trainer will assign sessions, modules,
  and assignments. Add a visible next-step timeline and notification state.
- Product gap: the trainee experience does not yet prove the full learner loop
  in this run—receive assignment, upload submission, trainer evaluate, reach
  100%, request certificate, admin approve, and download e-certificate. These
need a dedicated seeded fixture or stable staging run before release.

## Navigation polish verification (2026-08-15)

- Custom cursor now computes at `z-index: 110000`, above the fixed glass
  navbar at `100000`; Playwright confirmed the cursor layer is rendered and
  centered on the pointer.
- Shared navbar hides after downward scrolling beyond the initial reading
  area and returns on upward scrolling. Desktop and mobile browser checks
  observed `data-hidden=true` while scrolling down and `false` after scrolling
  up.
- Mobile hamburger opens a full-height drawer from the viewport top (`top: 0`,
  `height: 844px` at a 390x844 viewport). The navbar fades out and disables
  pointer events while the drawer is open, preventing overlap.
- `npm run typecheck`, `npm run lint` (one existing intentional `<img>` warning),
  `npm run build`, and `git diff --check` passed. Local production server is
running on port 3000 for visual review.

## Messaging canvas verification (2026-08-15)

- Messaging routes now render as a dedicated full-viewport canvas with no
  visible inherited navbar or footer.
- The conversation list and thread are flat workspace panes rather than one
  rounded container card; the list keeps its own sidebar boundary and the
  thread owns the remaining canvas.
- Mobile preview measured at 390x844: canvas is x=0, y=0, width=390,
  height=844, overflow hidden; navbar display is `none`, footer count is 0.
- Mobile thread preview retains the back-to-conversations control and composer
  while remaining inside the same full canvas.

## Enrollment responsive verification (2026-08-15)

- Program selection cards now use a fluid mobile type scale, stack title and
  price below the compact breakpoint, and add `min-w-0` constraints so long
  program names cannot push pricing out of the card.
- Curriculum badges allow natural wrapping instead of preserving a single-line
  chip that can clip on narrow screens. The wizard surface uses smaller mobile
  padding while retaining the more spacious tablet/desktop rhythm.
- Playwright verified 320px, 375px, and 768px viewports with zero document
  overflow. Selecting the first program preserved `aria-checked=true` and
  produced no badge overflow at any tested width.
- Follow-up fix: long curriculum labels now override the shared badge's fixed
  `h-5` and `overflow-hidden` defaults with automatic height, visible overflow,
  and readable line-height. The longest label measured 43px high at 375px with
  no clipping or document overflow.

## Announcement and responsive shell verification (2026-08-15)

- The live-updates announcement is now fixed at the desktop top-right rail
  (`position: fixed`, y=84px), remains above page content, fades after the
  downward threshold, and returns on upward scroll. Playwright observed
  `data-hidden=true/opacity=0` down and `false/opacity=1` up.
- Messaging desktop keeps the 340px conversation rail visible while the
  selected conversation renders in the remaining content area. Conversation
  rows now measure inside the rail (307px row width within a 315px viewport),
  avoiding intrinsic Radix scroll-wrapper expansion.
- Both message index and thread expose a history-aware back button. Mobile
  thread preview retains the composer and back control.
- Global page overflow is now explicit: vertical document scrolling remains
  native, horizontal overflow is clipped, and the shared dashboard shell uses
  `min-w-0` plus responsive mobile padding. At 390px, home scroll advanced
  from 0 to 860px with no horizontal overflow; login rendered at 390px with
  a 358px form card and no overflow.
- The announcement fallback is now removed from normal flow; the single card
  is fixed at the top-right at every breakpoint. At 390px it measured x=18,
  y=76, width=360, then faded at the downward threshold and returned on upward
  scroll.
- Authenticated mobile navigation now includes both the role-specific
  `Back to dashboard` link and the existing pending/disabled-safe `Logout`
  server action. Exercised with the seeded admin login.

## Forum contained-scroll verification (2026-08-15)

- Forum index post feed now has a bounded, keyboard-focusable scroll region.
  At 390px it measured 574px high with 2,219px of post content and native
  `overflow-y:auto`, leaving the page footer outside the feed.
- Forum post detail replies now use their own bounded, keyboard-focusable
  scroll region. The existing `Back to Forum` controls remain outside the
  reply viewport and available after the reading area.
- Browser QA confirmed the forum index and a real post detail route render the
  scroll containers without horizontal overflow. Build, typecheck, and lint
  remain passing (lint retains the existing intentional `<img>` warning).

## Forum nested-scroll and rail-card verification (2026-08-15)

- Forum post and reply scroll regions now carry `data-lenis-prevent`, allowing
  wheel input over the contained region to scroll that region instead of the
  Lenis document scroller.
- Trending, My Bookmarks, and Rating Leaderboard are now dedicated cards in a
  full-width stacked rail on mobile and a fixed 220px rail on desktop. At
  390px, the three cards measured 358px wide with no horizontal overflow.
- Desktop feed still exposes the nested-scroll escape attribute, and the
  responsive rail remains outside the post-feed content column.
