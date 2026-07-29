# Mobile Screenshot Spec — Batch 05 (items 141–175)

Source folder: `D:\Win10_UserData\Downloads\Hardtech\Mobile`
All 35 files in this slice are `Screenshot_20260728_HHMMSS_Messenger.jpg` — captured from inside the
**Facebook Messenger in-app browser** (Android). Every screenshot therefore carries the same OS/browser
chrome at the very top, which is **not part of the HardTech app** and must be ignored by the builder:

- Android status bar (time, icons, battery %)
- Messenger in-app-browser bar: `X` close button, padlock icon, `slot-pear-69660733.figma.site` URL,
  "Messenger" caption, `⋯` overflow menu

The actual app viewport starts directly below that browser bar. App background is near-black
(`--bg-main` dark ≈ `#080d12`) in every shot — this whole slice is a **logged-in admin session**
that later shows the public landing page (still with the admin's notification bell) and then a
**trainer session** dashboard. No login screen appears in this slice (see Open Questions).

Viewport: portrait phone, ~1080×2340 physical (captured/displayed at 923×2000 by the tool).

## Summary table

| # | Timestamp | Route | Section / state |
|---|---|---|---|
| 1 | 14:25:44 | `/dashboard/admin` | Enrollments tab — stat cards + first pending card (top) |
| 2 | 14:25:47 | `/dashboard/admin` | Hamburger nav Sheet open — "Admin Console" menu |
| 3 | 14:25:53 | `/dashboard/admin` | Enrollments tab, scrolled — updated stats + success toast |
| 4 | 14:25:57 | `/enroll` (embedded) | Lightbox showing trainee's uploaded payment-proof screenshot |
| 5 | 14:26:45 | `/dashboard/admin` | User Management — table cols USER / EMAIL / ROLE |
| 6 | 14:26:48 | `/dashboard/admin` | User Management — table scrolled right, STATUS / ACTIONS |
| 7 | 14:26:53 | `/dashboard/admin` | User Management — "All roles" Select open |
| 8 | 14:27:05 | `/dashboard/admin` | User Management — ROLE / PROGRAM cols, Program Select open |
| 9 | 14:27:06 | `/dashboard/admin` | Same as #8 + Android screenshot-markup toolbar overlay |
| 10 | 14:27:12 | `/dashboard/admin` | User Management — PROGRAM / STATUS cols, Program Select open |
| 11 | 14:27:17 | `/dashboard/admin` | User Management — Status Select open (active/pending/suspended) |
| 12 | 14:27:32 | `/dashboard/admin` | Trainer Management — trainer cards (top) |
| 13 | 14:27:36 | `/dashboard/admin` | Trainer Management — scrolled, assigned-trainee list |
| 14 | 14:27:38 | `/dashboard/admin` | Trainer Management — scrolled further, Jam Fu card |
| 15 | 14:27:42 | `/dashboard/admin` | Certificate Approvals list |
| 16 | 14:27:46 | `/dashboard/admin` | Announcements — New Announcement form (top) |
| 17 | 14:27:50 | `/dashboard/admin` | Announcements — form bottom + posted announcements list |
| 18 | 14:27:56 | `/dashboard/admin` | Analytics — stat cards + Enrollments chart w/ tooltip |
| 19 | 14:28:00 | `/dashboard/admin` | Analytics — Enrollments chart + Revenue Trend w/ tooltip |
| 20 | 14:28:04 | `/dashboard/admin` | Reports & Analytics — top (New Signups/Activation Rate) |
| 21 | 14:28:27 | `/dashboard/admin` | Payment Methods — GCash card |
| 22 | 14:28:30 | `/dashboard/admin` | Payment Methods — Maya + Bank Transfer (top) |
| 23 | 14:28:33 | `/dashboard/admin` | Payment Methods — Bank Transfer + Credit/Debit Card (top) |
| 24 | 14:28:35 | `/dashboard/admin` | Payment Methods — Bank Transfer + Credit/Debit Card (full) |
| 25 | 14:28:39 | `/dashboard/admin` | Audit Log — entry list (top) |
| 26 | 14:28:42 | `/dashboard/admin` | Audit Log — entry list (scrolled) |
| 27 | 14:28:48 | `/dashboard/admin` | Audit Log — filter Select open (user/enrollment/payment/…) |
| 28 | 14:28:51 | `/dashboard/admin` | Audit Log — filter Select scrolled, "system" option visible |
| 29 | 14:28:57 | `/` | Home hero + Core Programs carousel (admin session, bell badge 4) |
| 30 | 14:28:59 | `/` | Notifications dropdown open over home page |
| 31 | 14:29:52 | `/dashboard/trainer` | Trainer Overview — welcome + stat cards + Upcoming Sessions (top) |
| 32 | 14:29:55 | `/dashboard/trainer` | Trainer Overview — scrolled, full Upcoming Sessions list |
| 33 | 14:29:59 | `/dashboard/trainer` | Training Calendar — July 2026 month grid |
| 34 | 14:30:03 | `/dashboard/trainer` | New Session dialog (from calendar) |
| 35 | 14:30:06 | `/dashboard/trainer` | New Session dialog — Type Select open |

Route note: the known route map lists a single `/dashboard/admin` URL. All admin sections seen here
(Overview, Enrollments, User Management, Trainer Management, Certificates, Announcements, Analytics,
Payment Methods, Audit Log) render as **internal view state driven by the hamburger Sheet nav**, not
separate URLs — the address bar never changes across screenshots #1–28.

---

## Screenshot #1 — 14:25:44 — `/dashboard/admin` — Enrollments (top)

Route: `/dashboard/admin`, Enrollments section. Scroll position: top of section content (page header
"ADMIN PORTAL" pill visible, hamburger button visible, no bottom nav).

Header row: hamburger icon button (rounded square, dark) at left, purple dot + `ADMIN PORTAL` label
(all-caps, tracked-out) to its right. This header bar is sticky.

Heading block:
- H1: **"Enrollments & Payment Verification"**
- Body copy: **"Review each uploaded receipt and approve to officially enroll the trainee. Approval also verifies their payment."**

Stat grid — 2×2 grid of Cards, each: icon in a rounded colored circle (top-left), large bold number,
muted label below:
1. Green circle, credit-card icon → **"₱10.0k"** → **"Total Verified"**
2. Amber/brown circle, person+ icon → **"6"** → **"Pending Review"**
3. Red circle, image/photo icon → **"0"** → **"Missing Proof"**
4. Green circle, checkmark icon → **"2"** → **"Approved"**

Below the grid, a pending-enrollment Card begins (cut off at bottom of shot):
- Small thumbnail/receipt preview image at left
- Applicant name **"Juan Dela Cruz"**
- Badge: **"pending"** (amber/outline)
- Two pill buttons: **"Verify & Approve"** (green outline, checkmark icon) and **"Reject"** (red
  outline, X icon) — these two buttons visually overlap the name text in this capture (rendering
  artifact from the screenshot tool, not the real layout — the buttons sit to the right of / below
  the name in the real card, matching the layout confirmed in screenshot #3)
- Reference code **"ENR-ms49u61n-7ntf"**
- Program name **"I.T. Software Development"**
- Payment-method row: card icon + **"GCash"**
- Amount **"₱5,000"**
- Calendar-badge icon "Jul 17" + full date **"Jul 28, 2026"**

Component vocabulary: Card (stat tiles + enrollment row card), Badge (pending/approved status),
Button (pill, outline variant, green/red semantic colors).

## Screenshot #2 — 14:25:47 — `/dashboard/admin` — hamburger nav Sheet

A left-edge navigation panel is open, sliding from left over a dimmed backdrop (Sheet/Drawer
component). Structure top to bottom:
- Header row: purple circular avatar with initials **"AD"**, name **"Admin Console"**, sub-label with
  purple dot + **"Super Admin"**, and a small `X` close button at far right.
- Section label (all-caps, muted): **"ADMIN PORTAL"**
- Nav list, each row = icon + label, some with a trailing count Badge:
  1. Green dashboard-grid icon — **"Overview"**
  2. Blue person+ icon — **"Enrollments"** — Badge **"6"**
  3. Purple people icon — **"User Management"**
  4. Pink person-gear icon — **"Trainer Management"**
  5. Yellow medal icon — **"Certificates"** — Badge **"1"**
  6. Cyan megaphone icon — **"Announcements"**
  7. Orange bar-chart icon — **"Analytics"**
  8. Red credit-card icon — **"Payment Methods"**
  9. Green history/clock icon — **"Audit Log"**
- Divider, then footer actions:
  - House icon — **"Back to Landing"**
  - Red arrow-out icon — **"Logout"** (red text)

The currently-active row ("Enrollments") is visually highlighted with a subtle border/glow, confirming
this is the section shown in screenshot #1. This is the mobile relocation of what on desktop is
presumably a persistent left rail — on mobile it collapses into this hamburger-triggered Sheet.

## Screenshot #3 — 14:25:53 — `/dashboard/admin` — Enrollments, scrolled + success toast

Same Enrollments section, scrolled down. Stat grid now reads: **"₱15.0k" Total Verified**, **"5"
Pending Review**, **"0" Missing Proof**, **"3" Approved** — i.e. the previous screenshot's pending
item was just approved (Verified went 10.0k→15.0k, Pending 6→5, Approved 2→3).

Below, a different enrollment Card is visible (partially, top cut off):
- Reference **"ENR-ms49u61n-ddp2"**
- Program **"Cellphone Hardware Servicing"**
- Payment method row: card icon + **"GCash"**
- Amount **"₱5,000"**
- Date badge "Jul 17" + **"Jul 28, 2026"**
- Badge **"pending"**
- Link with external-link icon: **"View uploaded receipt"** (green text, this is the trigger for
  screenshot #4's lightbox)

At the very bottom, a **Sonner toast** notification is visible, overlapping the next card ("Cruz"
text bleeds through behind it):
- White checkmark-in-circle icon + text: **"Enrollment approved — payment verified."**

This confirms the approve action's exact toast copy and that the toast renders as a bottom-anchored
overlay bar with rounded corners and a green-tinted border.

## Screenshot #4 — 14:25:57 — lightbox over `/dashboard/admin`, content is a screenshot of `/enroll`

Timestamp inside the embedded image reads 2:24 (i.e. captured a minute earlier than the admin's own
clock) — this is an **image viewer/lightbox** opened by tapping "View uploaded receipt": it shows the
full-screen screenshot the trainee uploaded as payment proof. That inner screenshot is itself a
capture of the **`/enroll`** flow's payment step, complete with its own (nested) browser chrome. Its
content:
- Header: HardTech logo mark + **"HardTech"** / **"IT CORP."** wordmark, hamburger icon at right
- Field row **"Amount"** → **"₱15,000"** with a copy icon
- Field row **"Reference"** → **"HT-ENR-772238"** with a copy icon
- Warning/info callout (amber icon + amber-tinted box): **"Include the Reference No. in your payment
  remarks so we can match your payment quickly."**
- Section **"Upload Proof of Payment"**, helper text: **"Screenshot or photo of your GCash payment
  receipt. The admin will check this before approving."**
- Dashed-border drop-zone Card with upload-cloud icon: **"Click to upload screenshot"**, sub-text
  **"PNG or JPG · up to 5 MB"**
- Footer buttons: **"Back"** (outline, chevron-left icon) and **"Confirm Payment"** (green filled,
  chevron-right icon) — Confirm Payment renders in a dimmed/disabled-looking state here (grey text on
  green), consistent with the form not yet having an uploaded file attached in this particular capture.

Note the reference/amount here (`HT-ENR-772238` / ₱15,000) do not match the `ENR-ms49u61n-7ntf` /
₱5,000 record from screenshot #1 — flagged in Open Questions.

## Screenshot #5 — 14:26:45 — `/dashboard/admin` — User Management (USER/EMAIL/ROLE)

H1: **"User Management"**. Subtitle: **"Update roles, statuses and account details"**.

Filter row: a Select trigger **"All roles"** (chevron-down) and a Search Input with search icon,
placeholder **"Search users..."** — side by side.

Below, a horizontally-scrollable **Table** (columns overflow the viewport — confirmed by the visible
horizontal scrollbar track at the bottom of the table Card). Header row: **USER**, **EMAIL**, **ROLE**
(all-caps, muted). Each data row: circular Avatar with 2-letter initials on a green-tinted background,
full name, email, and a role value cut off as "train…" at the right edge. Rows visible:
- CR — Carlos Reyes — carlos@gmail.com
- MS — Maria Santos — maria@gmail.com
- AP — Prof. Adelan P. Sistoso — adelan@hardtech.ph
- HL — Mr. Henry Gomata Lopez — henry@hardtech.ph
- PO — Patricia Ocampo — patricia@gmail.com
- JF — Mr. Jam Fu — jamfu@hardtech.ph
- RF — Rico Fernandez — rico@gmail.com

## Screenshot #6 — 14:26:48 — `/dashboard/admin` — User Management (STATUS/ACTIONS)

Same table, scrolled horizontally right. Visible columns (partial name col + full): a program/role
value cut off at left edge ("...uter Hardware", "...one Repair", "...are Dev"), **STATUS** Select
per row, **ACTIONS** column with a red outline **"Remove"** Button per row.

Status values by row (top→bottom): active, active, active, active, pending, active, suspended —
mapping 1:1 to the 7 users listed in screenshot #5. Confirms three status enum values: `active`,
`pending`, `suspended`.

## Screenshot #7 — 14:26:53 — `/dashboard/admin` — Role filter Select open

The **"All roles"** Select at the top is expanded (open state, border glows green, chevron flipped to
point up). Dropdown options list, with a checkmark next to the currently-selected item:
- ✓ **All roles**
- **Admins**
- **Trainers**
- **Trainees**

## Screenshot #8 — 14:27:05 — `/dashboard/admin` — table ROLE/PROGRAM, Program Select open

Table scrolled to show **ROLE** and **PROGRAM** columns. Role values top→bottom: trainee, trainee,
trainer, trainer, trainee, trainer, trainee. The first row's Program Select is open (green border,
chevron up), option list with checkmark on current value:
- ✓ **Computer Hardware**
- **Cellphone Repair**
- **Software Dev**
- **Networking Basics**
- **CCTV Installation**

These are the five program names as they appear inside admin dropdowns (shorter than the full program
titles used elsewhere, e.g. "Computer Hardware" vs. "Computer Hardware Servicing").

## Screenshot #9 — 14:27:06 — same as #8, with OS screenshot-markup toolbar

Identical app state to #8. Additionally, the Android/Samsung post-screenshot markup overlay is visible
at the bottom: a small floating thumbnail of the just-taken screenshot plus four tool icons (crop/scan
text, pen/draw, hashtag/tag, share). **This is OS chrome, not app UI** — no new information beyond #8.

## Screenshot #10 — 14:27:12 — `/dashboard/admin` — PROGRAM/STATUS, Program Select open

Table scrolled slightly further right: **PROGRAM** and **STATUS** columns visible together. Row 1's
Program Select open again with the same 5 options (Computer Hardware ✓ / Cellphone Repair / Software
Dev / Networking Basics / CCTV Installation). Status column values visible behind the dropdown: active
×4 (rows 1–4 roughly), pending, active, suspended.

## Screenshot #11 — 14:27:17 — `/dashboard/admin` — Status Select open

Row 1's **STATUS** Select is open instead: option list with checkmark:
- ✓ **active**
- **pending**
- **suspended**

Confirms the exact lower-case enum labels used in the Select (vs. Title Case anywhere else).

## Screenshot #12 — 14:27:32 — `/dashboard/admin` — Trainer Management (top)

H1: **"Trainer Management"**. List of trainer Cards, each showing: circular initials Avatar, name,
program (muted, under name), a 2-up stat row (**Trainees** count / **Status** value in green bold),
a Separator, then **"ASSIGNED TRAINEES"** label (all-caps muted) and either a trainee list or empty text.

- **Prof. Adelan P. Sistoso** — Computer Hardware — Trainees: **0**, Status: **active** — "No trainees
  assigned yet"
- **Mr. Henry Gomata Lopez** — Cellphone Repair — Trainees: **5**, Status: **active** — assigned list
  begins: Carlos Reyes (Cellphone Repair), Maria Santos (Cellphone Repair), Juan Dela Cruz (Cellphone
  Repair), Liza Cruz (partially visible)

## Screenshot #13 — 14:27:36 — `/dashboard/admin` — Trainer Management, scrolled

Same page, scrolled down. Henry Gomata Lopez's assigned-trainees list fully visible in a scrollable
sub-list (green scroll-thumb indicator at right edge of the list, confirming an internal scroll
container, not full-page): Carlos Reyes, Maria Santos, Juan Dela Cruz, **Liza Cruz** (with a red
circular "X" remove-icon button at the row's right edge — the only row with a visible remove action
in this shot), Patricia Ocampo. Card for **Mr. Jam Fu** begins below.

## Screenshot #14 — 14:27:38 — `/dashboard/admin` — Trainer Management, Jam Fu card

Scrolled further: Henry's trainee sub-list bottom (Juan Dela Cruz, Liza Cruz w/ remove-X, Patricia
Ocampo), then full **Mr. Jam Fu** card — Software Dev, Trainees: **0**, Status: **active**, "No
trainees assigned yet".

## Screenshot #15 — 14:27:42 — `/dashboard/admin` — Certificate Approvals

H1: **"Certificate Approvals"**. List of Cards, each: name + " · " + certificate code, meta line
"Program · Trainer: Name · Completed [date]", then a Badge for status plus (when pending) inline
green-check and red-X icon Buttons for approve/reject.

- **Liza Cruz** · CRT-1004 — "Cellphone Repair · Trainer: Mr. Henry Gomata Lopez · Completed May 09,
  2026" — Badge **"pending"** + green check button + red X button
- **Ben Padilla** · CRT-1003 — "Cellphone Repair · Trainer: Mr. Henry Gomata Lopez · Completed May 06,
  2026" — Badge **"approved"** (no action buttons — terminal state)

## Screenshot #16 — 14:27:46 — `/dashboard/admin` — Announcements (new form, top)

H1: **"Announcements"**. Subtitle: **"Post public announcements shown on the landing page. Pin
important notices to display them first."**

"New Announcement" Card (green-outlined, i.e. an active/focused creation panel):
- Label **"TITLE"** → Input, placeholder **"e.g. New batch opening June 2026"**
- Label **"BODY"** → Textarea, placeholder **"Announcement details visible to site visitors..."**
- Label **"MEDIA — optional image or video"** → dashed drop-zone with 3 icons (image, upload, film/video)
  → **"Click to attach image or video"** → sub-text **"PNG, JPG, MP4, MOV · max 20 MB"**
- Label **"TYPE"** → three toggle chips: **"Update"**, **"Notice"**, **"Info"** (Info shown selected,
  blue outline/text)
- Checkbox + pin icon + **"Pin to top"** label, to the right of the type chips
- Button (full width, outline/muted look pre-fill): megaphone icon + **"Post Announcement"**

## Screenshot #17 — 14:27:50 — `/dashboard/admin` — Announcements list

Scrolled down: bottom of the New Announcement form (Type chips, Pin to top, Post Announcement button),
then the list of already-posted announcements as Cards:

1. Pin icon (green) + trash/delete icon button at top-right. Title **"June 2026 Batch Enrollments Now
   Open!"**. Badge **"Update"**. Body: **"New batches for all programs are accepting enrollments.
   Limited slots — secure yours before they fill up."** Meta: **"Posted May 25, 2026"**. Card has a
   green-tinted border/background (pinned = visually distinct, matching the pin icon).
2. Title **"Holiday Schedule — June 12"** with Badge **"Notice"** inline, trash icon button at
   right. Body: **"Classes are suspended on June 12 (Independence Day). Regular schedule resumes on
   June 13, 2026."** Meta: **"Posted May 20, 2026"**. Card has an amber-tinted border (Notice type
   color-codes the card border).

## Screenshot #18 — 14:27:56 — `/dashboard/admin` — Analytics, charts (mid-scroll)

Two more stat Cards visible (top cut off, prior two — "New Signups"/"Activation Rate" — scrolled just
above frame): green people icon → **"5"** → **"Daily Active"**; blue card icon → **"₱5,000"** →
**"ARPU"**.

**"Enrollments by Month"** Card containing a Recharts bar chart: y-axis 0/0.75/1.5/2.25/3, x-axis Dec
Jan Feb Mar Apr May. Bars only at Mar (~2) and May (3, tallest). A tooltip Card is open on the Mar bar:
**"Mar"** (bold, green) / **"enrollments: 2"**.

**"Revenue Trend"** Card begins below with a line/area chart, y-axis 0/4/8/12/16, x-axis Dec–May —
line stays flat at 0 through Feb, rises to a peak ~10 around Mar, dips back to ~0 at Apr, then rises
steeply toward ~15 at May (area fill under the line, green gradient).

## Screenshot #19 — 14:28:00 — `/dashboard/admin` — Analytics, Revenue Trend tooltip

Same two charts, scrolled slightly: Enrollments by Month bar chart with no tooltip open (bars at Mar
~2 and May 3). Revenue Trend chart now shows an active tooltip at the Mar peak — a vertical guide line
plus a dot marker at the peak point, tooltip Card: **"Mar"** (green bold) / **"revenue: 10"**.

## Screenshot #20 — 14:28:04 — `/dashboard/admin` — Reports & Analytics (top)

H1: **"Reports & Analytics"**. Subtitle: **"Cohort, revenue and engagement breakdowns"**.

Stat grid 2×2: green trending-up icon → **"8"** → **"New Signups"**; green shield-check icon →
**"38%"** → **"Activation Rate"**; green people icon → **"5"** → **"Daily Active"**; blue card icon →
**"₱5,000"** → **"ARPU"**. Below, the same **"Enrollments by Month"** bar chart begins (Mar ~2, May 3)
and the top edge of **"Revenue Trend"** peeks in at the very bottom.

This confirms the page's real H1 is "Reports & Analytics" (screenshots #18–19 are lower scroll
positions of this same page/section, not a separate "Analytics" page — the sidebar item is labelled
"Analytics" in the nav Sheet but the page content heading reads "Reports & Analytics").

## Screenshot #21 — 14:28:27 — `/dashboard/admin` — Payment Methods, GCash

H1: **"Payment Methods"**. Subtitle: **"Update the numbers, account names, and details that appear in
the enrollment payment page. Changes apply instantly."**

Repeating Card pattern per payment method: title + **Checkbox "Enabled"** (checked, blue) at top-right,
then stacked Inputs with labels **Display Name**, **Number** (or **Bank**/blank depending on method),
**Account Name**, **Note (optional, admin-only)** with placeholder **"e.g. limit ₱50k/day"**, then a
**"Save changes"** Button (outline, checkmark icon).

**GCash** card: Enabled ✓ · Display Name "GCash" · Number "0917-123-4567" · Account Name "HardTech IT
Corp" · Note empty · Save changes.

**Maya** card begins below (Enabled checkbox visible, Display Name field "Maya" starting).

## Screenshot #22 — 14:28:30 — `/dashboard/admin` — Maya + Bank Transfer

**Maya** card (full): Enabled ✓ · Display Name "Maya" · Number "0961-987-6543" · Account Name
"HardTech IT Corp" · Note empty · Save changes.

**Bank Transfer** card begins: Enabled ✓ · Display Name "Bank Transfer" · Bank "BDO Unibank" (label
here is **"Bank"** instead of "Number", confirming per-method field variants).

## Screenshot #23 — 14:28:33 — `/dashboard/admin` — Bank Transfer + Credit/Debit Card

**Bank Transfer** card (full): Enabled ✓ · Display Name "Bank Transfer" · Bank "BDO Unibank" ·
Account Number "0012-3456-7890" · Account Name "HardTech IT Corp" · Note empty · Save changes.

**Credit / Debit Card** card begins: Enabled ✓ (checkbox) · Display Name "Credit / Debit Card".

## Screenshot #24 — 14:28:35 — `/dashboard/admin` — Credit/Debit Card (full, end of list)

Scrolled slightly further: Bank Transfer card's tail (Bank, Account Number, Account Name, Note, Save
changes) then **Credit / Debit Card** card (full): Enabled ✓ · Display Name "Credit / Debit Card" ·
**no Number/Bank field at all** (card payment method skips straight to Note) · Note (optional,
admin-only) empty · Save changes. This is the last payment method — page ends here (no 5th method).

## Screenshot #25 — 14:28:39 — `/dashboard/admin` — Audit Log (top)

H1: **"Audit Log"**. Subtitle: **"All changes captured chronologically"**. Filter Select showing
**"all"**. Below, a reverse-chronological list of entries, each: a colored type Badge, a short verb
phrase, a "· " + record id/detail line, and a right-aligned "Actor · timestamp" line:

- Badge **payment** — "Verified payment" · "ENR-ms49u61n-7ntf" — Admin · Jul 28, 2026, 14:25
- Badge **enrollment** — "Enrollment approved" · "ENR-ms49u61n-7ntf" — Admin · Jul 28, 2026, 14:25
- Badge **enrollment** — "Re-enrolled in program" · "ENR-ms49u61n-7ntf — I.T. Software Development" —
  Juan Dela Cruz · Jul 28, 2026, 14:25
- Badge **enrollment** — "Re-enrolled in program" · "ENR-ms49u61n-ddp2 — Cellphone Hardware
  Servicing" — Juan Dela Cruz · Jul 28, 2026, 14:25
- Badge **enrollment** — "Re-enrolled in program" · "ENR-ms49u61k-ke8k — Computer Hardware Servicing"
  — Juan Dela Cruz · Jul 28, 2026, 14:25
- Badge **enrollment** — "Approved enrollment" (row continues below the fold)

Note the "Re-enrolled in program" entries are attributed to the trainee ("Juan Dela Cruz") as actor,
while approvals/verifications are attributed to "Admin" — the log records both user-initiated and
admin-initiated events in one unified feed.

## Screenshot #26 — 14:28:42 — `/dashboard/admin` — Audit Log, scrolled

Continues the list:
- Badge **enrollment** — "Re-enrolled in program" · "ENR-ms49u61n-ddp2 — Cellphone Hardware
  Servicing" — Juan Dela Cruz · Jul 28, 2026, 14:25
- Badge **enrollment** — "Re-enrolled in program" · "ENR-ms49u61k-ke8k — Computer Hardware Servicing"
  — Juan Dela Cruz · Jul 28, 2026, 14:25
- Badge **enrollment** — "Approved enrollment" · "ENR-0086 — Carlos Reyes" — Admin · May 14, 2026 09:12
- Badge **payment** — "Verified payment" · "ENR-0086 — ₱5,000" — Admin · May 14, 2026 09:13
- Badge **calendar** — "Created event" · "EV-3 — Board Diagnostics Assessment" — Mr. Henry Gomata
  Lopez · May 13, 2026 16:40
- Badge **user** — "Updated role" · "U-007 → trainer" — Admin · May 12, 2026 10:05

Confirms record-id prefixes: `ENR-` (enrollment), `EV-` (calendar event), `U-` (user), `CRT-`
(certificate, from screenshot #15).

## Screenshot #27 — 14:28:48 — `/dashboard/admin` — Audit Log filter Select open

The **"all"** Select at top is expanded, dropdown options (list begins to scroll — a visible
scrollbar thumb at the dropdown's right edge):
- **user**
- **enrollment**
- **payment**
- **certificate**
- **calendar**
- **module**

## Screenshot #28 — 14:28:51 — `/dashboard/admin` — Audit Log filter Select, more options

Same dropdown, scrolled one row further, revealing a 7th option below "module":
- **user**, **enrollment**, **payment**, **certificate**, **calendar**, **module**, **system**

Confirms the full audit-log category enum: `user`, `enrollment`, `payment`, `certificate`,
`calendar`, `module`, `system` (7 values) plus the `all` default.

## Screenshot #29 — 14:28:57 — `/` — Home hero (admin session)

Route: `/` (public landing home). Top navbar (floating glass style per design tokens): HardTech logo
mark (small circuit/chip icon) + wordmark **"HardTech"** / **"IT CORP."** (green) on the left; on the
right, a notification **Bell** icon button with a green count Badge **"4"**, and a hamburger menu
button. This confirms the bell + hamburger persist on the public landing page while an admin/staff
session is active (i.e. the top bar is global/shared across roles and routes, not admin-portal-only).

Below the navbar:
- Pill Badge with green dot: **"ENROLLMENTS OPEN — 2026"**
- H1 (two lines, second line's "Modern Technology" in green): **"Build Your Future in Modern
  Technology"**
- Paragraph: **"Get professionally trained in Computer Hardware Servicing, Cellphone Repair, and I.T.
  Software Development through immersive hands-on learning."**
- Two buttons stacked/side by side: **"Enroll Now →"** (green filled, arrow-right icon) and
  **"Explore Programs ›"** (outline, chevron-right icon)
- Feature checkmarks row: green check + **"Skills-First Training"**, blue check + **"QR
  Certificates"**, then on its own line, purple check + **"Job Placement Assist"**
- Eyebrow label **"WHAT WE OFFER"**, H2 **"Core Programs"** (green)
- A horizontally-scrollable **carousel** of program cards (peeking neighbors visible left/right,
  center card fully in focus with a colored border): center card shows a chip/CPU icon badge, photo
  background, title **"Computer Hardware Servicing"**, two small pill stats **"120 hrs"** and
  **"2,400+ enrolled"**. Round prev/next chevron arrow buttons overlay left/right edges. Dot-indicator
  row below (3 dots, first active/elongated).
- Sticky/pinned ticker bar at the very bottom of the viewport: green dot + **"LIVE UPDATES"** label,
  **"UPDATE"** Badge, prev/next chevron controls either side of a progress-dot indicator, and page
  counter **"1/2"** at far right — this is a horizontally-paged announcements ticker fed by the
  Announcements admin data (screenshot #17).

## Screenshot #30 — 14:28:59 — `/` — Notifications dropdown open

Same home page, now with the bell icon's dropdown/panel open, overlaying the hero (hero content dims/
blurs behind it). Panel:
- Header row: bell icon + **"Notifications"** + green Badge **"4 new"**, and at far right a
  double-check icon + **"Mark all read"** link
- **Tabs**: **"Unread"** (active, green underline, count Badge "4") and **"Read"**
- List of notification rows, each: amber circular icon (exclamation mark), bold title, muted
  description, muted relative-time stamp, and a green unread-dot at the far right:
  1. **"New enrollment to review"** — "Juan Dela Cruz enrolled in I.T. Software Development." — "3m
     ago"
  2. **"New enrollment to review"** — "Juan Dela Cruz enrolled in Cellphone Hardware Servicing." —
     "3m ago"
  3. **"New enrollment to review"** — "Juan Dela Cruz enrolled in Computer Hardware Servicing." — "3m
     ago"
  4. **"3 enrollments awaiting approval"** — "Review the pending queue under Enrollments." — "8h ago"
- Footer link, right-aligned, red/muted: **"Clear all"**

Behind the panel, the Core Programs carousel has auto-advanced/been swiped to its 2nd card:
**"Cellphone Hardware Servicing"**, phone icon badge, **"80 hrs"** / **"1,200+ enrolled"** stat pills.

This screenshot ties directly to the Enrollments admin data seen earlier (Juan Dela Cruz's 3
simultaneous program applications from screenshots #1/#3/#25–26).

## Screenshot #31 — 14:29:52 — `/dashboard/trainer` — Overview (top)

Route: `/dashboard/trainer`. Header: hamburger + green dot + **"TRAINER PORTAL"** label (same pattern
as Admin Portal's header, confirming a shared shell/header component that swaps the portal-name label
and dot color per role — purple dot for admin, green dot for trainer).

H1: **"Welcome, Mr. Henry Gomata Lopez"**. Subtitle: **"Cellphone Repair · Batch 2026-A"**.

Stat grid 2×2: green people icon → **"5"** → **"Assigned Trainees"**; green calendar icon → **"4"** →
**"Upcoming Sessions"**; green document icon → **"4"** → **"Modules Uploaded"**; green star icon →
**"0"** → **"Evaluations"**.

**"Upcoming Sessions"** Card begins: list rows, each with a bold green time (e.g. **"01:00 PM"**), a
date below it (**"2026-05-14"**), a session title (truncated with ellipsis, e.g. **"Battery &
Ch..."**), a location (**"Lab A"**), and a right-aligned type Badge:
- 01:00 PM / 2026-05-14 — "Battery & Ch…" — Lab A — Badge **"Workshop"** (blue)
- 08:00 AM / 2026-05-14 — "Screen & Dig…" — Lab A — Badge **"Hands-on"** (green)
- 09:00 AM / 2026-05-16 — "Unit 3 Ass…" — Lab A — Badge **"Assessment"** (amber)
- 08:00 AM / 2026-05-19 — "Micro-Solderin…" — Lab A — Badge **"Lecture"** (grey/neutral)

Truncated titles indicate fixed-width text with ellipsis on mobile — full titles are not recoverable
from this slice (flagged in Open Questions).

## Screenshot #32 — 14:29:55 — `/dashboard/trainer` — Overview, scrolled

Same page, scrolled slightly (header now overlaps the "Cellphone Repair · Batch 2026-A" subtitle,
which is partly cut by the sticky header). All 4 stat cards and the full 4-row Upcoming Sessions list
are visible in one frame, confirming the list has exactly 4 items (matches the "Upcoming Sessions: 4"
stat) with no visible "see all" / pagination control below.

## Screenshot #33 — 14:29:59 — `/dashboard/trainer` — Training Calendar

H1: **"Training Calendar"**. Subtitle: **"Philippine Standard Time · Hover a date and click + to
schedule a session. Trainees see it instantly."** (desktop-authored copy — "Hover" doesn't really apply
on mobile touch, flagged in Open Questions/mobile-layout notes).

Month navigation row: **‹** chevron button, **"July 2026"** label, **›** chevron button, and a pill
Button **"Today (PH)"** (green outline/tint, active-looking).

Calendar grid: 7-column header **Sun Mon Tue Wed Thu Fri Sat**, then date cells 1–31 (leading empty
cells for the days before the 1st, since July 1 2026 falls on Wednesday). Each date cell is a rounded
square Button. Today (the 28th) is highlighted with a green border and green text, distinct from all
other plain-dark cells.

**"Sessions This Month"** Card below the grid: empty state text — **"No sessions scheduled this
month."**

## Screenshot #34 — 14:30:03 — `/dashboard/trainer` — New Session dialog

A modal Card overlays the (blurred) calendar page — vertically centered-ish, not a bottom sheet with a
drag handle, closer to a **Dialog**. Rounded corners on all sides, black background with visible
border, blurred/dimmed page content above and below it. Contents:
- Row: H3 **"New Session"** + a round **X** close icon button at top-right
- Green date label: **"2026-07-09"** (i.e. this dialog was opened from a *different* date cell than
  "today", not the 28th — the trainer tapped a future date's "+"/add affordance per the calendar's
  subtitle instructions)
- Input, placeholder **"Session title..."** (currently focused — visible text-cursor + highlighted
  border)
- Two fields side by side: a time value **"08:00 AM"** (Input or time-picker trigger) and a Select
  showing **"Lecture"**
- Input showing **"Lab A"** (location, pre-filled/default)
- Helper text: **"Visible to 5 enrolled trainees once published."**
- Full-width green **"Publish Session"** Button

## Screenshot #35 — 14:30:06 — `/dashboard/trainer` — New Session dialog, Type Select open

Same dialog; the session-type Select ("Lecture") is now open, dropdown option list with checkmark on
current value:
- ✓ **Lecture**
- **Hands-on**
- **Workshop**
- **Assessment**

These four values match the Badge labels seen on the Upcoming Sessions list (screenshots #31–32) and
the Trainer Management page — confirming a single shared session-type enum:
`Lecture | Hands-on | Workshop | Assessment`.

---

## Flows observed

1. **Admin enrollment approval flow** (#1 → #3 → #4): admin views a pending enrollment card with
   stats (Total Verified / Pending Review / Missing Proof / Approved) → taps "Verify & Approve" →
   stats update instantly (Total Verified ₱10.0k→₱15.0k, Pending 6→5, Approved 2→3) and a Sonner toast
   **"Enrollment approved — payment verified."** appears bottom-anchored → admin can tap **"View
   uploaded receipt"** on a still-pending card to open a full-screen image lightbox showing the
   trainee's uploaded payment-proof screenshot (which is itself a capture of the `/enroll` payment
   step UI).

2. **User Management drill-down** (#5 → #6 → #7 → #8 → #10 → #11): the User Management table is wider
   than the viewport and scrolls horizontally to reveal USER/EMAIL/ROLE → ROLE/PROGRAM → PROGRAM/
   STATUS → STATUS/ACTIONS column groups. Each of ROLE, PROGRAM, and STATUS is independently editable
   via an inline Select per row, each opening its own dropdown (roles: admin/trainer/trainee context
   via the top filter; programs: 5 named programs; status: active/pending/suspended).

3. **Trainer roster drill-down** (#12 → #13 → #14): Trainer Management renders one Card per trainer
   with a nested, independently-scrollable "Assigned Trainees" sub-list, each trainee row having its
   own remove (X) action.

4. **Same person, three simultaneous enrollments**: Juan Dela Cruz appears across the Enrollments tab
   (#1, #3), the notification bell panel (#30 — three separate "New enrollment to review" entries),
   and the Audit Log (#25–26 — three "Re-enrolled in program" entries) all referencing the same three
   programs (I.T. Software Development, Cellphone Hardware Servicing, Computer Hardware Servicing).
   This is a single coherent data thread running through the whole admin slice.

5. **Role/session switch** (#28 → #29): the timestamps jump from the Admin Portal's Audit Log
   (14:28:51) straight to the public home page still showing the admin's notification bell (14:28:57),
   then roughly a minute later (14:29:52) land on a **Trainer** dashboard for a different named user
   (Mr. Henry Gomata Lopez). No login/logout screen is captured in this slice — the transition is
   inferred, not observed (see Open Questions).

6. **Trainer session creation** (#33 → #34 → #35): trainer taps a date cell on the Training Calendar →
   a "New Session" Dialog opens pre-filled with that date, a default time (08:00 AM), default type
   (Lecture), and default location (Lab A) → trainer can change the type via a Select
   (Lecture/Hands-on/Workshop/Assessment) → "Publish Session" commits it, with a stated audience size
   ("Visible to 5 enrolled trainees once published.").

## Mobile layout rules

- **No bottom tab bar / no FAB observed anywhere in this slice.** Navigation on both the admin and
  trainer dashboards is exclusively via a hamburger button (top-left of a sticky header) that opens a
  full-height Sheet/Drawer sliding in from the left, covering the majority of the viewport width and
  dimming the rest.
- The sticky in-app header pattern is shared across roles: `[hamburger] [colored dot] [ROLE PORTAL
  label]`, all-caps tracked-out label, dot color coded by role (purple = admin, green = trainer).
- The public home page's navbar is a separate, distinct component: logo lockup on the left, Bell
  (with unread-count Badge) + hamburger on the right — no "ROLE PORTAL" label since it's the public
  route, but the Bell persists there if a staff session is active.
- **Stat cards always tile 2 columns × N rows** on mobile (never 4-across) — confirmed identically on
  Enrollments, Trainer Management (per-card 2-up), Reports & Analytics, and Trainer Overview.
- **Tables that are wider than the viewport scroll horizontally** rather than reflowing to stacked
  cards — seen clearly in User Management, where column groups (USER/EMAIL/ROLE →
  PROGRAM/STATUS/ACTIONS) are paged into view by horizontal swipe, with a visible thin scrollbar track
  under the table.
- **Selects/dropdowns open as inline expanding panels anchored directly under their trigger**, not as
  bottom sheets — confirmed for role filter, program picker, status picker, audit-log category filter,
  and session-type picker. They push/overlay following content rather than growing the page.
- **Nested/independently-scrollable lists inside a card** appear at least once (Trainer Management's
  "Assigned Trainees" sub-list has its own scroll thumb distinct from the page scrollbar).
- **Modals for creation flows (e.g. "New Session") render as a centered Dialog-style card**, not a
  bottom Drawer/Sheet with a drag handle — rounded corners on all four sides, close via explicit `X`
  button, backdrop blurred/dimmed. (The bundle lists `vaul`, a Drawer/bottom-sheet library, at only 1
  reference — this slice's evidence suggests standard Dialog is the dominant mobile modal pattern, at
  least for this flow.)
- **Toasts (Sonner) are bottom-anchored, rounded, single-line, icon + message**, and can visually
  overlap/obscure the next list item briefly (seen overlapping the next enrollment card's name text).
- **Horizontal carousels** (Core Programs on the home page) show a peeking-neighbor style (partial
  cards visible left/right of the focused card) with round chevron overlay buttons and a dot-indicator
  strip — plus a second, independent horizontally-paged strip pinned to the very bottom of the
  viewport for "LIVE UPDATES" announcements (with its own prev/next chevrons and an "N/M" counter
  rather than dots).
- Long/truncated text uses **ellipsis clipping** rather than wrapping in space-constrained rows (seen
  in Upcoming Sessions titles: "Battery & Ch...", "Screen & Dig...", "Unit 3 Ass...",
  "Micro-Solderin...").
- Calendar grid on mobile keeps the full 7-column week layout (no agenda/list fallback view seen) with
  small square day cells; "today" is the only cell with distinct (green) styling in the empty-state.

## Open questions

1. **No login screen in this slice.** The transition from the admin session (#1–30) to a Trainer
   session under a different name (#31 onward) is not directly observed — no `/login` screenshot, no
   logout confirmation. It's unclear whether this was a manual logout/login, an impersonation/"view
   as" feature, or simply a separate capture session stitched into the same chronological folder.
   Needs corroboration from `/login` screenshots elsewhere in the corpus.
2. **Reference/amount mismatch in the payment-proof lightbox** (#4): the enrollment card underneath
   references `ENR-ms49u61n-7ntf` / ₱5,000, but the uploaded proof image shows Reference
   `HT-ENR-772238` and Amount ₱15,000. Unclear if this is a stand-in/placeholder proof image reused
   across enrollments in the design mock, or a genuine data association that a full rebuild needs to
   preserve exactly.
3. **Full session titles are truncated** ("Battery & Ch...", "Screen & Dig...", "Unit 3 Ass...",
   "Micro-Solderin...") — the untruncated strings aren't recoverable from this slice; check
   wider/desktop screenshots or other mobile batches for the same batch (2026-05-14 to 05-19, Lab A)
   to recover full titles.
4. **Calendar subtitle copy ("Hover a date and click + to schedule a session") is desktop-mouse
   language** shipped verbatim to the mobile build — worth flagging to the builder as literal source
   copy to preserve (per the "verbatim copy" instruction) even though it's arguably a UX mismatch on a
   touch device; no mobile-specific alternate copy was observed.
5. **"Analytics" (sidebar label) vs. "Reports & Analytics" (H1)** — confirmed same page/section across
   screenshots #18–20, but worth double-checking against other slices/desktop docs in case there are
   in fact two distinct admin sections that happen to show similar chart cards.
6. Payment Methods only shows 4 methods (GCash, Maya, Bank Transfer, Credit/Debit Card) with the list
   ending cleanly after Credit/Debit Card in screenshot #24 — confirm no 5th method exists elsewhere
   in the corpus (e.g. Cash/Over-the-counter).
