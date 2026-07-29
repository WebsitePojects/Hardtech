# Desktop Screenshots — Slice 02 (items 33–63)

Source folder: `D:\Win10_UserData\Downloads\Hardtech\Desktop\*.png`
31 screenshots covering: `/login`, `/dashboard/admin` (full), `/dashboard/trainer` (full),
`/dashboard/trainee` (full), `/forum` (Communities / All Posts / Trending tabs).

All screenshots are full 2880x1800 desktop captures inside a Chrome browser chrome (tabs,
bookmarks bar) — the actual app viewport starts below the browser bookmarks bar in every image.

**Note on a recurring artifact:** many admin/trainer/trainee screenshots show a small
picture-in-picture thumbnail image floating in the bottom-right corner of the browser viewport
(a miniature copy of the page). This is a screen-capture/recording-tool overlay, NOT part of the
HardTech application UI. Ignore it when rebuilding.

## Summary table

| # | Filename (time) | Route | Section / state |
|---|---|---|---|
| 1 | 11.31.33 PM | `/login` | Default — login form + hero copy |
| 2 | 11.31.50 PM | `/dashboard/admin` | Overview |
| 3 | 11.32.00 PM | `/dashboard/admin` | Enrollments & Payment Verification (+ success toast) |
| 4 | 11.32.04 PM | `/dashboard/admin` | User Management (table, default) |
| 5 | 11.32.09 PM | `/dashboard/admin` | User Management — Role select open |
| 6 | 11.32.12 PM | `/dashboard/admin` | User Management — Program select open |
| 7 | 11.32.16 PM | `/dashboard/admin` | User Management — Status select open |
| 8 | 11.32.20 PM | `/dashboard/admin` | Trainer Management |
| 9 | 11.32.24 PM | `/dashboard/admin` | Certificate Approvals |
| 10 | 11.32.28 PM | `/dashboard/admin` | Announcements (create form + list) |
| 11 | 11.32.32 PM | `/dashboard/admin` | Reports & Analytics |
| 12 | 11.32.43 PM | `/dashboard/admin` | Payment Methods |
| 13 | 11.32.51 PM | `/dashboard/admin` | Audit Log — type filter open |
| 14 | 11.33.06 PM | `/dashboard/trainer` | Overview |
| 15 | 11.33.10 PM | `/dashboard/trainer` | Training Calendar (empty month) |
| 16 | 11.33.14 PM | `/dashboard/trainer` | My Trainees (grid, default) |
| 17 | 11.33.20 PM | `/dashboard/trainer` | My Trainees — Evaluate form, rating select open |
| 18 | 11.33.22 PM | `/dashboard/trainer` | My Trainees — Evaluate form, complete |
| 19 | 11.33.29 PM | `/dashboard/trainer` | Assignments — empty state |
| 20 | 11.33.32 PM | `/dashboard/trainer` | Assignments — Create Assignment form open |
| 21 | 11.33.36 PM | `/dashboard/trainer` | Modules |
| 22 | 11.33.49 PM | `/dashboard/trainee` | My Dashboard (+ DEMO persona switcher) |
| 23 | 11.33.53 PM | `/dashboard/trainee` | Session Schedule (empty day selected) |
| 24 | 11.33.57 PM | `/dashboard/trainee` | Assignments — empty state |
| 25 | 11.33.59 PM | `/dashboard/trainee` | Enrolled Programs |
| 26 | 11.34.04 PM | `/dashboard/trainee` | Materials (Learning Materials) |
| 27 | 11.34.08 PM | `/dashboard/trainee` | Credentials (My Credentials) |
| 28 | 12.48.13 AM | `/forum` | Communities tab, filtered by Q&A Help (top) |
| 29 | 12.48.22 AM | `/forum` | Communities tab, filtered by Q&A Help (scrolled, full grid) |
| 30 | 12.48.39 AM | `/forum` | All Posts tab, filtered by Career & Jobs |
| 31 | 12.48.50 AM | `/forum` | Trending tab, filtered by Announcements |

---

## 1. `11.31.33 PM` — `/login`

**Layout:** Two-column split screen on a dark background with faint green grid texture. Floating
glass navbar spans the top.

**Navbar:** Logo mark (shield/circuit icon) + wordmark "HardTech" (bold) / "IT CORP." (small caps,
green, subtitle under wordmark). Center nav links: `Home`, `About`, `Forum`, `Explore` (with a
chevron-down, indicating a dropdown). Right side: `Login` button (outline/ghost) and `Enroll Now`
button (solid neon green, pill-shaped).

**Left column (marketing copy):**
- Pill Badge, green dot + text: `SYSTEM ONLINE · 2026 BATCHES OPEN` (dark bg, green border/text)
- H1, two lines: "Continue Your" (white) / "Tech Journey" (neon green)
- Paragraph: "Access your personalized training dashboard and track your progress in real time."
- Three feature rows, each a small rounded-square icon tile + one line of text:
  - (lightning-bolt icon) "Real-time progress tracking & analytics"
  - (badge/award icon) "Download your QR-verified certificates"
  - (shield icon) "Secure, role-based account access"
- Footer line, small gray: "© 2026 HardTech IT Corp. All rights reserved."

**Right column — login Card** (glass/dark card, rounded corners):
- H2: "Welcome Back"
- Line: "Want to join HardTech? " + link (green) "Enroll in a program"
- Label (uppercase, small, gray): "EMAIL ADDRESS"
- Input, pre-filled value: `admin@gmail.com`
- Row: label "PASSWORD" (left) / link "Forgot password?" (right, green)
- Password Input, masked dots, pre-filled 7 chars, eye icon (show/hide toggle) inside field on the
  right
- Checkbox (unchecked): "Remember me for 30 days"
- Button, full width, solid neon green, icon (sign-in arrow) + text: "Sign In to Dashboard"
- Secondary box below the form, subtle border, heading (uppercase small): "TEST CREDENTIALS"
  - Bulleted list (green dot bullets), bold label + value:
    - "Admin: admin@gmail.com"
    - "Trainer: trainer@gmail.com"
    - "Trainee: trainee@gmail.com"
  - Small gray line: "Password: any value"

**Components:** Card, Input, Checkbox, Button, Badge (pill).
**State:** default/filled — this is effectively a "pre-filled demo" state, not a blank form.

---

## 2. `11.31.50 PM` — `/dashboard/admin` (Overview)

**Layout:** Fixed left Sidebar (dark) + main content area. This sidebar/shell is shared across all
admin pages (see below), only the main content changes.

**Sidebar (shared admin chrome):**
- Header row: Avatar "AD" (violet/purple circle) + "Admin Console" (bold) / "Super Admin" (small
  gray, green status dot before it). A small square button with "K" sits at the far right of this
  header (likely a collapse/keyboard-shortcut affordance).
- Section label (uppercase, small, gray): "ADMIN PORTAL"
- Nav list, icon + label, one item shows a numeric count Badge on the right:
  1. Overview (grid icon) — **active/selected**, green-tinted background
  2. Enrollments (person+ icon) — Badge `4`
  3. User Management (people icon)
  4. Trainer Management (people/gear icon)
  5. Certificates (ribbon/award icon) — Badge `1`
  6. Announcements (megaphone icon)
  7. Analytics (bar-chart icon)
  8. Payment Methods (card icon)
  9. Audit Log (clock/history icon)
- Bottom-pinned: "Back to Landing" (home icon) and "Logout" (exit icon, red/pink text)

**Main content — Overview:**
- H1: "System Overview"
- Subtext: "HardTech IT Corp — operations at a glance"
- Row of 4 stat Cards:
  1. icon tile (green) + `7` + "Total Users"
  2. icon tile (amber) + `4` + "Pending Enrolls"
  3. icon tile (green) + `₱10.0k` + "Revenue (MTD)"
  4. icon tile (blue) + `1` + "Cert Requests"
- Two-column row:
  - Left (larger) Card: "Revenue & Enrollments" / "Last 6 months". Combo Chart (recharts area +
    line): green filled area series peaking around Mar, second thinner blue line staying low. Y
    axis ticks 0,4,8,12,16. X axis: Dec, Jan, Feb, Mar, Apr, May.
  - Right Card: "Program Mix" / "Active enrollments". Donut Chart, 3 segments (green, light green,
    blue). Legend rows with colored dot + label + right-aligned value:
    - Computer Hardware — 185
    - Cellphone Repair — 156
    - Software Dev — 145
- Row of 4 quick-link Cards (icon + heading + subtext):
  - people icon, "Manage Users" / "7 total"
  - person+ icon, "Approve Enrolls" / "4 pending"
  - award icon, "Approve Certs" / "1 pending"
  - clock icon, "Audit Log" / "5 events"

**Components:** Sidebar nav, Card, Badge (nav count pills), Chart (area/line combo, donut).

---

## 3. `11.32.00 PM` — `/dashboard/admin` → Enrollments

- H1: "Enrollments & Payment Verification"
- Subtext: "Review each uploaded receipt and approve to officially enroll the trainee. Approval
  also verifies their payment."
- 4 stat Cards: `₱15.0k` "Total Verified" (green card icon) · `3` "Pending Review" (amber person+
  icon) · `0` "Missing Proof" (red image icon) · `3` "Approved" (green check icon)
- List of 3 enrollment review Cards, each containing:
  - Small receipt thumbnail image (white mock receipt) on the left
  - Name (bold) + " · " + enrollment ID, program name below (gray)
  - Row: payment-method icon + name, amount (green bold, ₱), calendar icon + date, status Badge
    `pending` (amber)
  - Link with external-link icon (green): "View uploaded receipt"
  - Right-aligned: status Badge `pending` (top), then two Buttons: green "✓ Verify & Approve" and
    red/outline "✕ Reject"
  - Entries:
    1. **Roberto Lim** · ENR-0087 — Computer Hardware — GCash · ₱5,000 · 📅 May 13, 2026 · pending
    2. **Anna Villanueva** · ENR-0088 — Cellphone Repair — Maya · ₱5,000 · 📅 May 12, 2026 · pending
    3. **Patricia Ocampo** · ENR-0089 — Cellphone Repair — Bank Transfer · ₱5,000 · 📅 May 11, 2026 ·
       pending
- **Sonner toast**, bottom-right, dark card with check icon: "Enrollment approved — payment
  verified." (this is captured mid-flight after an approve action)

**Components:** Card, Badge, Button, Sonner toast.
**State:** post-action success toast visible; all 3 rows still show `pending` (toast likely refers
to a 4th, now-approved row no longer pending — matches the "3 Approved" stat vs. 3 still listed as
pending, i.e. this list only shows the pending queue).

---

## 4. `11.32.04 PM` — `/dashboard/admin` → User Management (table, default)

- H1: "User Management"
- Subtext: "Update roles, statuses and account details"
- Top-right controls: Select `All roles`, Input (search icon) placeholder "Search users..."
- Table, columns: `USER | EMAIL | ROLE | PROGRAM | STATUS | ACTIONS`. Each USER cell = colored
  initials Avatar + full name. ROLE/PROGRAM/STATUS cells are Select dropdowns (closed). ACTIONS
  column = red "Remove" Button.
- Rows (8 total):

| Avatar | Name | Email | Role | Program | Status |
|---|---|---|---|---|---|
| CR | Carlos Reyes | carlos@gmail.com | trainee | Computer Hardware | active |
| MS | Maria Santos | maria@gmail.com | trainee | Computer Hardware | active |
| AP | Prof. Adelan P. Sistoso | adelan@hardtech.ph | trainer | Computer Hardware | active |
| HL | Mr. Henry Gomata Lopez | henry@hardtech.ph | trainer | Cellphone Repair | active |
| PO | Patricia Ocampo | patricia@gmail.com | trainee | Computer Hardware | **pending** |
| JF | Mr. Jam Fu | jamfu@hardtech.ph | trainer | Software Dev | active |
| RF | Rico Fernandez | rico@gmail.com | trainee | Computer Hardware | **suspended** |
| AZ | asda z | asda.z@gmail.com | trainee | *Select...* (placeholder, unset) | active |

**Components:** Table, Select, Input, Avatar, Button.

---

## 5. `11.32.09 PM` — User Management, Role select open (Carlos Reyes row)

Same table. The Role select for Carlos Reyes is open (focused ring, chevron flipped up), showing a
popover list with options: `trainee` (checked, green check + green text), `trainer`, `admin`.
**Role enum confirmed: trainee / trainer / admin.**

---

## 6. `11.32.12 PM` — User Management, Program select open (Carlos Reyes row)

Program select open, popover list with options: `Computer Hardware` (checked), `Cellphone Repair`,
`Software Dev`, `Networking Basics`, `CCTV Installation` (this last one shown in a hover/highlight
state, green background). **Program catalog confirmed (5 programs): Computer Hardware, Cellphone
Repair, Software Dev, Networking Basics, CCTV Installation.**

---

## 7. `11.32.16 PM` — User Management, Status select open (Carlos Reyes row)

Status select open, popover list: `active` (checked), `pending`, `suspended` (hover/highlight
state). **Status enum confirmed: active / pending / suspended.**

---

## 8. `11.32.20 PM` — `/dashboard/admin` → Trainer Management

- H1: "Trainer Management"
- 3 Cards side-by-side, one per trainer:
  1. Avatar "AP" **Prof. Adelan P. Sistoso** — "Computer Hardware". Two-tile stat row: `0`
     "Trainees" / `active` "Status". Section label "ASSIGNED TRAINEES" + empty-state italic gray
     text "No trainees assigned yet".
  2. Avatar "HL" **Mr. Henry Gomata Lopez** — "Cellphone Repair". `5` "Trainees" / `active`
     "Status". "ASSIGNED TRAINEES" list (scrollable, cut off at bottom of viewport), rows =
     avatar + name + program:
     - Carlos Reyes — Cellphone Repair
     - Maria Santos — Cellphone Repair
     - Juan Dela Cruz — Cellphone Repair
     - Liza Cruz — (row clipped by viewport bottom, name only partially visible)
  3. Avatar "JF" **Mr. Jam Fu** — "Software Dev". `0` "Trainees" / `active` "Status". "No trainees
     assigned yet".

Note: the program label shown against trainees inside Henry's assigned list is "Cellphone Repair"
for all of them, even though the User Management table (screenshot 4) shows Carlos Reyes and Maria
Santos enrolled in "Computer Hardware" — transcribed as literally shown; flagged in Open Questions.

**Components:** Card, Avatar, stat tiles, list rows, empty state.

---

## 9. `11.32.24 PM` — `/dashboard/admin` → Certificate Approvals

- H1: "Certificate Approvals"
- List of 2 Cards:
  1. **Liza Cruz** · CRT-1004 — "Cellphone Repair · Trainer: Mr. Henry Gomata Lopez · Completed
     May 09, 2026" — Badge `pending` (amber) + green circular check-Button + red circular X-Button
  2. **Ben Padilla** · CRT-1003 — "Cellphone Repair · Trainer: Mr. Henry Gomata Lopez · Completed
     May 06, 2026" — Badge `approved` (green), no action buttons (terminal state)

**Components:** Card, Badge, icon Buttons.

---

## 10. `11.32.28 PM` — `/dashboard/admin` → Announcements

- H1: "Announcements"
- Subtext: "Post public announcements shown on the landing page. Pin important notices to display
  them first."
- Card "New Announcement":
  - Label "TITLE" + Input, placeholder "e.g. New batch opening June 2026"
  - Label "BODY" + Textarea, placeholder "Announcement details visible to site visitors..."
  - Label "MEDIA — optional image or video" + dashed dropzone box: three icons (image / upload /
    film) + text "Click to attach image or video" + small gray "PNG, JPG, MP4, MOV · max 20 MB"
  - Label "TYPE" + segmented button group: `Update`, `Notice`, `Info` (Info is selected/active,
    blue highlight)
  - Checkbox (pin icon) "Pin to top" — aligned top-right of the button row
  - Button "📢 Post Announcement" — **disabled/grayed-out state** (fields are empty)
- Below, list of existing announcements, each a colored-left-border Card:
  1. 📌 pin icon + **"June 2026 Batch Enrollments Now Open!"** + Badge `Update` (green) — body:
     "New batches for all programs are accepting enrollments. Limited slots — secure yours before
     they fill up." — "Posted May 25, 2026" — a delete/trash icon top-right (red, partially
     visible)
  2. **"Holiday Schedule — June 12"** + Badge `Notice` (amber) — body: "Classes are suspended on
     June 12 (Independence Day). Regular schedule resumes on June 13, 2026." — "Posted May 20,
     2026"

**Components:** Card, Input, Textarea, dropzone, segmented Toggle group, Checkbox, Button
(disabled state), Badge.

---

## 11. `11.32.32 PM` — `/dashboard/admin` → Analytics

- H1: "Reports & Analytics"
- Subtext: "Cohort, revenue and engagement breakdowns"
- 4 stat Cards: `6` "New Signups" (green trending-up icon) · `50%` "Activation Rate" (green shield
  icon) · `6` "Daily Active" (blue people icon) · `₱5,000` "ARPU" (blue card icon)
- Two chart Cards:
  - "Enrollments by Month" — Bar Chart, green bars, Y axis 0/0.75/1.5/2.25/3, X axis Dec–May, bars
    only at Mar (~2.5) and May (~3), rest at 0.
  - "Revenue Trend" — Area Chart, green filled, Y axis 0/4/8/12/16, X axis Dec–May, peak ~9 at Mar,
    dips near 0 at Apr, rises to ~15 at May.

**Components:** Card, Chart (Bar, Area).

---

## 12. `11.32.43 PM` — `/dashboard/admin` → Payment Methods

- H1: "Payment Methods"
- Subtext: "Update the numbers, account names, and details that appear in the enrollment payment
  page. Changes apply instantly."
- 2x2 grid of Cards, each with a Checkbox "Enabled" (all checked) top-right:
  1. **GCash** — Display Name `GCash`, Number `0917-123-4567`, Account Name `HardTech IT Corp`,
     Note (optional, admin-only) placeholder "e.g. limit ₱50k/day", Button "✓ Save changes"
  2. **Maya** — Display Name `Maya`, Number `0961-987-6543`, Account Name `HardTech IT Corp`, Note
     placeholder, Button "✓ Save changes"
  3. **Bank Transfer** — Display Name `Bank Transfer`, Bank `BDO Unibank`, Account Number
     `0012-3456-7890`, Account Name `HardTech IT Corp` (Note field likely below, cut off by
     viewport)
  4. **Credit / Debit Card** — Display Name `Credit / Debit Card`, Note (optional, admin-only)
     placeholder, Button "✓ Save changes" (this method has no Number field — fewer inputs than the
     others)

**Components:** Card, Checkbox, Input, Button.

---

## 13. `11.32.51 PM` — `/dashboard/admin` → Audit Log

- H1: "Audit Log"
- Subtext: "All changes captured chronologically"
- Top-right: Select showing `all`, **open**, popover options: `all` (checked), `user`
  (hover/highlighted), `enrollment`, `payment`, `certificate`, `calendar`, `module` (cut off at
  bottom of list — list continues past viewport).
- List rows, each: category Badge (green pill, label = filter type) + action description + " · "
  + reference ID, right-aligned actor name + timestamp (only visible where not obscured by the
  open dropdown):
  1. Badge `payment` — "Verified payment · ENR-ms4tcbik-ukss"
  2. Badge `enrollment` — "Enrollment approved · ENR-ms4tcbik-ukss"
  3. Badge `enrollment` — "Re-enrolled in program · ENR-ms4tcbik-ukss — Computer Hardware
     Servicing"
  4. Badge `enrollment` — "Approved enrollment · ENR-0086 — Carlos Reyes"
  5. Badge `payment` — "Verified payment · ENR-0086 — ₱5,000"
  6. Badge `calendar` — "Created event · EV-3 — Board Diagnostics Assessment" — right: "Mr. Henry
     Gomata Lopez · May 13, 2026 16:40"
  7. Badge `user` — "Updated role · U-007 → trainer" — right: "Admin · May 12, 2026 10:05"

**Audit category enum (from dropdown): all, user, enrollment, payment, certificate, calendar,
module** (list may continue further — module is the last visible option, cut by viewport).

**Components:** Select, Badge, list rows.

---

## 14. `11.33.06 PM` — `/dashboard/trainer` (Overview)

**Sidebar (shared trainer chrome):** Avatar "HL" + "Mr. Henry Gomata Lopez" (bold) / "Owner & Lead
Trainer" (gray, green status dot). Section label "TRAINER PORTAL". Nav: Overview (active), Calendar,
My Trainees, Assignments, Modules. Bottom: "Back to Landing", "Logout".

**Main content:**
- H1: "Welcome, Mr. Henry Gomata Lopez"
- Subtext: "Cellphone Repair · Batch 2026-A"
- 4 stat Cards: `5` "Assigned Trainees" (people icon) · `4` "Upcoming Sessions" (calendar icon) ·
  `4` "Modules Uploaded" (document icon) · `0` "Evaluations" (star icon)
- Card "Upcoming Sessions", 4 rows, each = time (green bold) + date below (gray) on the left,
  title (bold) + location (gray, "Lab A") in the middle, type Badge on the right:
  1. **01:00 PM** / 2026-05-14 — "Battery & Charging Port Workshop" — Lab A — Badge `Workshop`
     (blue)
  2. **08:00 AM** / 2026-05-14 — "Screen & Digitizer Replacement" — Lab A — Badge `Hands-on`
     (green)
  3. **09:00 AM** / 2026-05-16 — "Unit 3 Assessment — Board Diagnostics" — Lab A — Badge
     `Assessment` (amber)
  4. **08:00 AM** / 2026-05-19 — "Micro-Soldering Fundamentals" — Lab A — Badge `Lecture` (neutral
     gray)

**Components:** Card, Badge (session-type variants: Workshop/blue, Hands-on/green,
Assessment/amber, Lecture/gray), stat tiles.

---

## 15. `11.33.10 PM` — `/dashboard/trainer` → Calendar

- H1: "Training Calendar"
- Subtext: "Philippine Standard Time · Hover a date and click + to schedule a session. Trainees see
  it instantly."
- Top-right: month navigator `‹ July 2026 ›` + Button "Today (PH)" (green)
- Full month Calendar grid, columns Sun–Sat. Day cells are mostly empty. Day 14 shows a small green
  "+" Button in the corner (hover-to-add-session affordance). Day 28 (today) is highlighted with a
  green-tinted background and green numeral.
- Right panel: "Sessions This Month" heading, empty-state text: "No sessions scheduled this
  month."

**Components:** Calendar grid (custom), Button.
**State:** empty month, hover-affordance shown on one cell.

---

## 16. `11.33.14 PM` — `/dashboard/trainer` → My Trainees (default grid)

- H1: "My Trainees"
- Grid of 5 Cards (3 columns, last row has 2):
  1. Avatar "CR" **Carlos Reyes** — carlos@gmail.com — Progress `68%` (Progress bar) — Badge
     `Paid` (green) — Button "☆ Evaluate" (green)
  2. Avatar "MS" **Maria Santos** — maria@gmail.com — Progress `54%` — Badge `Paid` — Button
     "☆ Evaluate"
  3. Avatar "JD" **Juan Dela Cruz** — jdc@gmail.com — Progress `41%` — Badge `Paid` — Button
     "☆ Evaluate" (shown in a lighter/hover fill, likely just a hover-state capture)
  4. Avatar "LC" **Liza Cruz** — liza@gmail.com — Progress `92%` — Badges `Paid` + `Trained`
     (blue) — Button "☆ Undo Evaluation" (red/destructive text — this trainee has already been
     evaluated)
  5. Avatar "PO" **Patricia Ocampo** — patricia@gmail.com — Progress `22%` — Badge `Paid` — Button
     "☆ Evaluate"

**Components:** Card, Progress, Badge, Button, Avatar.

---

## 17. `11.33.20 PM` — My Trainees, Evaluate form open (Patricia Ocampo), rating select open

Patricia Ocampo's card has expanded in place (her Evaluate button became this form):
- Button "☆ Cancel" (replaces the Evaluate button)
- Field showing `Diagnostics` (closed box, no visible chevron in this frame — likely a
  skill/category selector related to the evaluation)
- Field/select showing `Certified`, **open**, popover options: `Certified` (checked), `Competent`,
  `Needs Improvement`

**Evaluation rating enum confirmed: Certified / Competent / Needs Improvement.**

---

## 18. `11.33.22 PM` — My Trainees, Evaluate form open, complete (Patricia Ocampo)

Same card, dropdown now closed, full form visible:
- Button "☆ Cancel"
- Field `Diagnostics` (closed)
- Select `Certified` (closed, chevron visible)
- Textarea, placeholder "Notes..."
- Button "Submit Evaluation" — full width, bright neon green (visually the most prominent button
  on the page — primary CTA styling distinct from the outline-style Evaluate buttons on sibling
  cards)

**Components:** Select, Textarea, Button (primary/solid variant).

---

## 19. `11.33.29 PM` — `/dashboard/trainer` → Assignments (empty state)

- H1: "Assignments"
- Subtext: "Post tasks for your trainees. They'll get a real-time notification and can submit
  image, video, or document files."
- Top-right Button: "+ New Assignment" (green)
- Empty-state Card: clipboard icon (green tile), bold "No assignments yet", gray line "Click **New
  Assignment** to post one. Trainees will be notified instantly." (New Assignment shown bold
  inline)

---

## 20. `11.33.32 PM` — Assignments, Create Assignment form open

- Top-right Button toggles to "+ Close"
- Card "Create Assignment":
  - Input, placeholder "Title — e.g. Unit 3 Lab Report"
  - Textarea, placeholder "Instructions for trainees..."
  - Two-column row: "Due date" label + date Input showing `Jul 28, 2026` (calendar icon) / "Due
    time" label + Input showing `11:59 PM`
  - Label "Allowed submission types" + 3 selectable chips, all shown active/selected (green fill):
    "🖼 Image", "📹 Video", "📄 Document"
  - Button "Publish Assignment" — full width, solid green
- Below the form, the empty-state block ("No assignments yet" / "Click New Assignment...") is
  still shown, since no assignment has been published yet.

**Components:** Input, Textarea, date Input, time Input, multi-select chip Toggle group, Button.

---

## 21. `11.33.36 PM` — `/dashboard/trainer` → Modules

- H1: "Modules"
- Card "Upload New Module": Input placeholder "Title...", Select `PDF` (file-type), Input `1`
  (unit number, small numeric field), Button "⬆ Upload" (outline green)
- List of 4 module rows, each: green document icon, title (bold), subtext line "Unit N · TYPE ·
  size · date":
  1. **"Cellphone Repair Fundamentals — Unit 1"** — Unit 1 · PDF · 2.4 MB · Mar 12, 2026
  2. **"Logic Board Anatomy Video"** — Unit 2 · MP4 · 84 MB · Mar 20, 2026
  3. **"Micro-Soldering Tools Guide"** — Unit 2 · PDF · 1.1 MB · Apr 05, 2026
  4. **"Assessment Quiz — Unit 2"** — Unit 2 · DOCX · 0.3 MB · Apr 18, 2026

**Components:** Card, Input, Select, Button, list rows.

---

## 22. `11.33.49 PM` — `/dashboard/trainee` (My Dashboard)

**Sidebar (shared trainee chrome):** Avatar "CR" + "Carlos Reyes" (bold) / "Active Trainee" (gray,
green dot). Section label "TRAINEE PORTAL". Nav: My Dashboard (active), Session Schedule,
Assignments, Enrolled Programs, Materials, Credentials. Bottom: "Back to Landing", "Logout".

**Demo banner** (full-width, amber-bordered strip at the very top of the content area): Badge
`DEMO` (amber) + text "View as:" + two toggle Buttons: **"Carlos Reyes · In Progress"** (selected,
green fill) and **"Liza Cruz · Graduate"** (unselected, gray outline) — a persona switcher for
demoing both an in-progress trainee and a graduated one.

**Main content:**
- H1: "Welcome, Carlos Reyes"
- Subtext: "Cellphone Repair · Batch 2026-A"
- 4 stat Cards: `68%` "Overall Progress" (graduation-cap icon) · `4` "Sessions Ahead" (calendar
  icon) · `4` "Materials" (document icon) · `Active` "Status" (shield icon, value is a text word
  not a number, green)
- Card: Badge `ACTIVE PROGRAM` (green pill, top-left) + Badge "✓ Active Trainee" (outline,
  top-right)
  - H3 "Cellphone Repair"
  - "Trainer: Mr. Henry Gomata Lopez · Batch 2026-A"
  - "Program Progress" label + `68%` (right-aligned) + Progress bar (green, 68% filled)
- Card "Upcoming Sessions" — same 4 session rows/format as the trainer Overview (screenshot 14),
  ordered by date/time: Screen & Digitizer Replacement (08:00 AM, Hands-on), Battery & Charging
  Port Workshop (01:00 PM, Workshop), Unit 3 Assessment — Board Diagnostics (09:00 AM, Assessment),
  Micro-Soldering Fundamentals (08:00 AM, Lecture)

**Components:** Card, Badge, Progress, stat tiles, persona-switcher Toggle group.

---

## 23. `11.33.53 PM` — `/dashboard/trainee` → Session Schedule

Demo banner still shown.
- H1: "Session Schedule"
- Subtext: "Philippine Standard Time · Live from your trainer"
- Month navigator "‹ July 2026 ›" + Button "Today (PH)"
- Calendar grid, read-only (no "+" add affordance — trainee cannot create sessions). Day 28
  (today) highlighted green.
- Right panel: green label "SELECTED DAY" + "Tuesday, July 28, 2026" + "0 sessions" + empty-state
  text "No sessions scheduled."

**Components:** Calendar grid (read-only variant), empty state.

---

## 24. `11.33.57 PM` — `/dashboard/trainee` → Assignments (empty state)

Demo banner still shown.
- H1: "Assignments"
- Subtext: "Submit tasks posted by your trainer — images, videos, or documents."
- Empty-state Card: clipboard icon, bold "No assignments yet", gray line "Your trainer hasn't
  posted anything. You'll get a notification when they do."

---

## 25. `11.33.59 PM` — `/dashboard/trainee` → Enrolled Programs

Demo banner still shown.
- H1: "Enrolled Programs"
- Card: Badge `ENROLLED` (green pill, top-left) + Badge `Active` (plain outline, top-right — no
  checkmark, simpler than the Dashboard's "✓ Active Trainee")
  - H3 "Cellphone Repair"
  - "Trainer: Mr. Henry Gomata Lopez · Batch 2026-A"
  - "Completion" label + `68%` (right) + Progress bar
  - 3-column stat sub-row: "START" `Mar 10, 2026` · "SESSIONS" `4` · "MATERIALS" `4` (each its own
    tile)

**Components:** Card, Badge, Progress, stat tiles.

---

## 26. `11.34.04 PM` — `/dashboard/trainee` → Materials

Demo banner still shown.
- H1: "Learning Materials"
- Grid of 4 Cards (3 columns, 2nd row has 1):
  1. document icon, Badge `PDF` (top-right) — **"Cellphone Repair Fundamentals — Unit 1"** — "Unit
     1 · 2.4 MB" — Button "⬇ Download" (green)
  2. video icon (blue tile), Badge `MP4` — **"Logic Board Anatomy Video"** — "Unit 2 · 84 MB" —
     Button "⬇ Download"
  3. document icon, Badge `PDF` — **"Micro-Soldering Tools Guide"** — "Unit 2 · 1.1 MB" — Button
     "⬇ Download"
  4. document icon, Badge `DOCX` — **"Assessment Quiz — Unit 2"** — "Unit 2 · 0.3 MB" — Button
     "⬇ Download"

**Components:** Card, Badge, Button.

---

## 27. `11.34.08 PM` — `/dashboard/trainee` → Credentials

Demo banner still shown.
- H1: "My Credentials"
- Subtext: "Badges and e-certificate from HardTech IT Corp"
- 2 Cards side by side:
  1. **Earned state** — green-glow border/background. Shield icon with a small green checkmark
     badge overlaid on it. Small-caps green label "HARDTECH IT CORP". Bold heading "VERIFIED
     TRAINEE". "Carlos Reyes". "Cellphone Repair · Batch 2026-A".
  2. **Locked/incomplete state** — neutral gray border, grayscale icon (graduation cap, no
     checkmark overlay). "HARDTECH IT CORP" label. Bold heading "TRAINED GRADUATE". "Carlos
     Reyes". "Cellphone Repair · 68% complete". Italic gray line: "Awarded after completing
     training & certificate approval".
- Below, a row: lock icon + "Official E-Certificate" (bold) / "Unlocks once your trainer marks
  your training as completed" (gray) — right-aligned Badge/pill "🔒 Locked" (disabled gray).

**Components:** Card (two visual variants: earned/glow vs. locked/grayscale), Badge.
**State:** one credential earned, one locked — a genuine locked/disabled empty-state pattern to
preserve in the rebuild.

---

## 28. `12.48.13 AM` — `/forum` (Communities tab, filtered by Q&A Help, top of page)

**Navbar (glass, floating, shared forum chrome):** Logo "HardTech" / "IT CORP.". Nav: `Home`,
`About`, `Forum` (active, green underline), `Explore ▾`. Right: bell icon with a green numeric
Badge `2` (notifications), role chip "TR Trainee" with dropdown chevron.

Below navbar: "Filtering by:" + removable Badge chip `Q&A Help ×` + link "Clear all" (green).

**Left rail:**
- Card "CATEGORIES": `All Categories` `6`, `General Discussion` `1` (speech-bubble icon), `Q&A
  Help` `1` (question-mark icon, **currently active/selected**, blue-highlighted row),
  `Resources & Tips` `1` (book icon), `Troubleshooting` `1` (wrench icon), `Career & Jobs` `1`
  (briefcase icon), `Announcements` `1` (megaphone icon)
- Card "GUIDELINES" (shield icon heading), numbered list 1–5:
  1. Be respectful and professional
  2. Stay on-topic for IT training
  3. No spam or self-promotion
  4. Cite your sources
  5. Trainee posts require approval
- Card "FORUM STATS" (bar-chart icon heading): Posts `6`, Replies `9`, Total Views `906`, Members
  `6`

**Center column:**
- Tab group: `All Posts` / `Trending` / `Communities` (**active**) / `Bookmarks`
- Button top-right: "+ Request community"
- Search Input "Search communities by name, city, or tag..." + Select "📍 All regions" + Select
  "▽ All topics"
- Card: pin icon + label "DETECTED REGION" + bold "NCR / Metro Manila" + gray "Based on the
  communities you joined." + Button "✏ Change region"
- Heading "✨ Recommended for you" + subtext "Based on your region and topics you follow."
- Grid of community Cards begins (headers only visible at this scroll position — full detail in
  screenshot 29).

**Right rail:**
- Card "TRENDING" (up-trend icon), numbered 1–5:
  1. "Welcome to the HardTech Community Forum! 🎉"
  2. "Micro-soldering starter toolkit — what you actually need vs. what's nice to have"
  3. "Repair Shop Hiring — Mandaluyong & BGC (May 2026)"
  4. "I completed my first solo motherboard-level repair! 🙌"
  5. "How do I safely remove an iPhone 15 screen without damaging Face ID?"
- Card "MY BOOKMARKS" (bookmark icon) — empty state: "No bookmarks yet."
- Card "RATING LEADERBOARD" (star icon), medal-ranked rows:
  1. 🥇 Avatar "HL" "Mr. Henry G..." (name truncated) — star row + Badge `5.0★` (green)
  2. 🥈 Avatar "LC" "Liza Cruz" — Badge `5.0★` "(2)" reviews
  3. 🥉 Avatar "HA" "HardTech A..." (truncated) — Badge `4.8★` "(4)"
  4. `#4` Avatar "CR" "Carlos Reyes" — Badge `4.0★` "(2)"
  5. `#5` Avatar "MS" "Maria Santos" — Badge `4.0★` "(1)"

**Components:** Tabs, Badge, Select, Input, Card, Avatar, medal-rank markers (emoji), star rating.

---

## 29. `12.48.22 AM` — `/forum` Communities tab, scrolled (full recommended grid)

Same page as #28, scrolled down to show the "Recommended for you" grid in full. Each community
Card has: a colored gradient/illustration header banner with an emoji/icon avatar circle (top-left)
and a Badge `🌐 PUBLIC` (top-right); below the banner: name (bold), location (pin icon + city),
1–2 line description (truncated with ellipsis), a topic tag Badge, member-count (people icon) and
reply-count (speech icon), and a `Join` Button (green) — except the first card, which has no Join
button, implying the current trainee is already a member.

Grid (3 columns × 3 rows, 9 cards total, last row cut off by viewport):

| Community | Location | Tag Badge | Members / Replies | Join? |
|---|---|---|---|---|
| NCR / Metro Manila Technicians | Metro Manila | — | 3 / 0 | already joined (no button) |
| Quezon City Repair Hub | Quezon City | 🔧 Mobile Repair | 2 / 0 | Join |
| Cebu Techs Network | Cebu City | 🔧 Troubleshooting | 2 / 0 | Join |
| Davao Tech Circle | Davao City | 🖥 Desktop Repair | 1 / 0 | Join |
| Cavite Technicians | Cavite | 🔧 Mobile Repair | 1 / 0 | Join |
| Laguna Tech Collective | Laguna | 🌐 Networking | 1 / 0 | Join |
| Pampanga Repair Pros | Pampanga | (cut off) | — | — |
| Batangas Tech Hub | Batangas | (cut off) | — | — |
| Iloilo IT Community | Iloilo City | (cut off) | — | — |

Descriptions (verbatim, truncated by the UI itself with "..."):
- NCR: "The largest HardTech community — for technicians,..."
- Quezon City: "Repair shops, freelancers, and trainees based in Quezon City...."
- Cebu: "For Visayas-based technicians. Cebu City and surrounding..."
- Davao: "Davao Region community for mobile, desktop, and network..."
- Cavite: "Cavite-based repair community. Bacoor, Imus, Dasmariñas, GM..."
- Laguna: "Sta. Rosa, Calamba, Los Baños, San Pablo — a working..."
- Pampanga: "Angeles, San Fernando, Clark —" (cut off by viewport, not UI truncation)
- Batangas: "Lipa, Batangas City, Tanauan," (cut off by viewport)
- Iloilo: "For Ilonngo IT pros — repair," (cut off by viewport; note "Ilonngo" — likely a source
  typo for "Ilonggo", transcribed exactly as rendered)

Right rail unchanged from screenshot 28 (Trending / My Bookmarks / Rating Leaderboard).

**Components:** Card (community card variant: banner + icon avatar + Badge + description + tag +
counts + Join Button), Badge, Button.

---

## 30. `12.48.39 AM` — `/forum` All Posts tab, filtered by Career & Jobs

- Large in-page hero heading (not just a section title): "Community Forum" (bold, green gradient)
- Subtext: "Discuss, share knowledge, and grow together with the HardTech community"
- Button top-right: "+ New Post" (green)
- Search Input "Search posts, authors, or tags..." + Select "↕ Newest" (sort)
- "Filtering by:" + Badge `Career & Jobs ×` + "Clear all"
- Tab group: `All Posts` (active), `Trending`, `Communities`, `Bookmarks`
- Meta line: "1 post · Career & Jobs"
- Post Card:
  - Avatar "HA" **HardTech Admin** + Badge `ADMIN` (amber/gold) + Badge `ACTIVE` (green)
  - Star rating row: "★★★★☆ 4.8 (4)" + document icon "4 posts" + "429d ago"
  - Link "☆ Rate this author"
  - Right-aligned category Badge: `Career & Jobs` (pink/magenta)
  - Title (bold, large): **"Repair Shop Hiring — Mandaluyong & BGC (May 2026)"**
  - Excerpt: "We've received several job referrals from partner employers this month. See the
    openings below. TechFixPH — SM Megamall Mandaluyong - Position: Junior Mobile Technician -
    Rate: ₱18,000–₱22,000/month +..."
  - Hashtag chips: `#jobs` `#hiring` `#mandaluyong` `#bgc` `#career`
  - Footer icon row: 👍 `1` (upvote), 🛈 `1` (helpful/insight count), 💡 (insight marker, no count
    shown) — right-aligned: 👁 `148` (views), 💬 "0 replies", bookmark icon, flag/report icon

Left rail (categories/guidelines/stats) and right rail (Trending/Bookmarks/Leaderboard) unchanged
from screenshots 28–29.

**Components:** Tabs, Badge, Card (post card), Avatar, star rating, hashtag chips, icon-count
footer row, Select, Input, Button.

---

## 31. `12.48.50 AM` — `/forum` Trending tab, filtered by Announcements

Page scrolled slightly — the floating navbar overlaps the top of the "Community Forum" hero
heading (only "Co" of "Community" peeks out above the navbar), confirming the navbar is
sticky/floating over page content on scroll.

- "Filtering by:" + Badge `Announcements ×` + "Clear all"
- Tab group: `All Posts`, `Trending` (active)
- Meta line: "1 post · Announcements"
- Post Card:
  - Badge `📌 PINNED` (amber/gold) + Badge `📈 TRENDING` (orange) — both top-left, before the
    author row
  - Avatar "HA" **HardTech Admin** + Badge `ADMIN` + Badge `ACTIVE`
  - Star rating: "★★★★☆ 4.8 (4)" + "4 posts" + "434d ago"
  - Link "☆ Rate this author"
  - Right-aligned Badge: `Announcements` (amber)
  - Title: **"Welcome to the HardTech Community Forum! 🎉"**
  - Excerpt: "We're thrilled to launch the official HardTech IT Corp community forum — a dedicated
    space for trainees, trainers, and graduates to connect, share knowledge, and grow together.
    What you can do here: -..."
  - Hashtag chips: `#welcome` `#community` `#guidelines`
  - Footer icon row: 👍 `3`, 🛈 (count not clearly legible), 💡 — 👁 `312` views, 💬 "0 replies",
    bookmark icon, flag icon

Left rail categories now list the same 6 categories with **Announcements** highlighted/active
(amber-tinted row, matching the category's own accent color rather than the blue used for Q&A
Help in screenshot 28 — category highlight color appears to match each category's tag color).

**Components:** Badge (Pinned + Trending compound flags on one post), Card, Avatar, star rating,
hashtag chips.

---

## Components observed in this slice

- **Card** — stat tiles, dashboard summary cards, enrollment/certificate/payment-method cards,
  trainee/trainer cards, credential cards (earned vs. locked variants), community cards, forum
  post cards, empty-state cards.
- **Badge** — status pills (`pending`/`approved`/`active`/`suspended`), role pills (`ADMIN`,
  `Trainer`, `Trainee`), category/type tags (`Update`, `Notice`, `Info`, `Workshop`, `Hands-on`,
  `Assessment`, `Lecture`, forum category tags, `PINNED`, `TRENDING`, `PUBLIC`), rating badges
  (`5.0★`, `4.8★`), nav-count badges, hashtag chips.
- **Button** — solid/primary (neon green), outline/ghost, destructive (red text, e.g. Reject/
  Remove/Undo Evaluation), icon-prefixed (Verify & Approve, Save changes, Upload, Download,
  Publish Assignment, Submit Evaluation), disabled state (Post Announcement with empty form),
  circular icon buttons (approve/reject checkmarks on Certificate Approvals).
- **Input** — text, search (with leading icon), date picker, time field, numeric (unit number).
- **Textarea** — announcement body, assignment instructions, evaluation notes.
- **Select / DropdownMenu** — role, program, status, region, topic filter, sort order, module file
  type, audit-log category filter, evaluation rating (Certified/Competent/Needs Improvement),
  skill/category field (Diagnostics).
- **Checkbox** — Remember me, Pin to top, payment-method Enabled toggle.
- **Toggle/segmented button group** — announcement Type (Update/Notice/Info), assignment allowed
  submission types (Image/Video/Document), trainee dashboard demo persona switcher.
- **Tabs** — forum All Posts/Trending/Communities/Bookmarks.
- **Avatar** — colored-initial circles throughout (users, trainers, forum authors, leaderboard
  entries).
- **Progress** — program completion bars (admin trainee progress, trainee dashboard, enrolled
  programs).
- **Chart** (recharts) — combo area+line (Revenue & Enrollments), donut/pie (Program Mix), bar
  (Enrollments by Month), area (Revenue Trend).
- **Sonner toast** — enrollment-approved success toast.
- **Table** — User Management.
- **Calendar grid** (custom, not a shadcn Calendar popover) — trainer Training Calendar (editable,
  hover "+" affordance) and trainee Session Schedule (read-only), both month-view with a
  selected-day side panel.
- **Sidebar** — persistent left nav shell, distinct per role (Admin Portal / Trainer Portal /
  Trainee Portal), same structural pattern: avatar+role header, section label, icon nav list with
  optional count badges, pinned footer (Back to Landing / Logout).
- **Empty states** — "No assignments yet", "No trainees assigned yet", "No sessions scheduled
  (this month / today)", "No bookmarks yet", each pairs a large icon with a bold headline and a
  gray instructional subline.
- **Locked/disabled state** — Official E-Certificate row (lock icon + "Locked" badge) and the
  disabled "Post Announcement" button when the form is empty.

## Open questions

1. **Bottom-right thumbnail overlay.** A small picture-in-picture image appears floating in the
   bottom-right corner of many admin/trainer/trainee screenshots. Treated here as a
   screen-capture-tool artifact, not app UI — confirm this is not actually a real widget (e.g. a
   "minimap" or scroll-position preview) before discarding it entirely.
2. **Trainer Management program mismatch.** In Trainer Management (screenshot 8), all of Henry
   Gomata Lopez's assigned trainees (Carlos Reyes, Maria Santos, Juan Dela Cruz) are labeled
   "Cellphone Repair," but User Management (screenshot 4) shows Carlos Reyes and Maria Santos
   enrolled in "Computer Hardware." This could be a data-seeding inconsistency in the source
   prototype rather than intentional behavior — worth deciding whether the rebuild should treat
   program-per-trainee as authoritative from User Management or from Trainer Management.
3. **"Diagnostics" field in the Evaluate form** (screenshots 17–18): shown as a plain box with no
   visible chevron in screenshot 18, unlike the "Certified" rating field right below it which does
   have a chevron. Unclear whether this is a second Select (skill/assessment-area picker, values
   unknown beyond "Diagnostics") or a static/read-only label. No other value was ever seen in it,
   so its option set is unconfirmed.
4. **Audit Log category list is cut off.** The open filter dropdown shows `all, user, enrollment,
   payment, certificate, calendar, module` before being clipped by the viewport — there may be
   additional categories below `module` not captured in this slice.
5. **Post footer icon meanings** (👍 count, 🛈/shield-like icon count, 💡 icon with no count) are
   inferred as upvote / helpful / insight based on the design-source doc's mention of "upvote
   count, helpful count, insight marker" — exact icon-to-meaning mapping should be verified against
   other screenshot slices or the live bundle if precision matters.
6. **"Ilonngo"** in the Iloilo IT Community description (screenshot 29) is transcribed exactly as
   rendered; it is very likely a source typo for "Ilonggo" but is preserved verbatim per the
   instruction to transcribe copy exactly.
7. **Community "Join" button absence** on the first card (NCR / Metro Manila Technicians) is
   assumed to mean "already a member," but no explicit "Joined"/"Member" badge is shown to confirm
   that reading — it could also simply be a layout truncation cutting off the button in this
   specific card.
