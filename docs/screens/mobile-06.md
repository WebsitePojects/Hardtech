om# Mobile Screenshot Spec — Slice 06 (files 176–209, last slice)

Source folder: `D:\Win10_UserData\Downloads\Hardtech\Mobile`
All 34 files in this slice are named `Screenshot_20260728_HHMMSS_Messenger.jpg` — they were captured
inside the Facebook **Messenger in-app browser** (note the "Messenger" subtitle under the URL bar and
the Messenger/Android status-bar icons). The address bar confirms every shot is the same site:
`slot-pear-69660733.figma.site`. Physical screenshot size 1080×2340; treat status bar / browser chrome
(the black bar with the `X`, lock icon, URL, `…` menu, and the grey Android status bar above it) as
**not part of the app UI** — ignore it in the rebuild.

All timestamps below are `HH:MM:SS` from the filename, same calendar day (2026-07-28), one continuous
capture session running 14:30:15 → 14:34:xx.

## Summary table

| Timestamp | Route | Section / state |
|---|---|---|
| 14:30:15 | `/dashboard/trainer` | My Trainees list, default (3 cards) |
| 14:30:19 | `/dashboard/trainer` | My Trainees — Carlos Reyes card expanded into evaluation form |
| 14:30:22 | `/dashboard/trainer` | My Trainees — evaluation form, "Certified" select open |
| 14:30:28 | `/dashboard/trainer` | My Trainees, scrolled — Juan Dela Cruz / Liza Cruz (evaluated) / Patricia Ocampo |
| 14:30:33 | `/dashboard/trainer` | Assignments — Create Assignment form open, empty list below |
| 14:30:38 | `/dashboard/trainer` | Assignments — Due date field, inline calendar picker open |
| 14:30:49 | `/dashboard/trainer` | Assignments — submission-type chips toggled, empty state visible |
| 14:30:56 | `/dashboard/trainer` | Modules — Upload New Module form + existing module list |
| 14:30:59 | `/dashboard/trainer` | Modules — file-type select ("PDF") open |
| 14:31:14 | `/` (home) | Notification bell popover open, over hero + Core Programs carousel |
| 14:32:09 | `/dashboard/trainee` | Welcome header + 4 stat cards + Active Program card (Carlos Reyes, In Progress) |
| 14:32:12 | `/dashboard/trainee` | Active Program card + Upcoming Sessions list |
| 14:32:17 | `/dashboard/trainee` (Session Schedule) | Calendar month view, day selected, "0 sessions" |
| 14:32:22 | `/dashboard/trainee` (Session Schedule) | Same page, "No sessions scheduled." empty state |
| 14:32:26 | `/dashboard/trainee` (Assignments) | Empty state — "No assignments yet" |
| 14:32:33 | `/dashboard/trainee` (Enrolled Programs) | Cellphone Repair enrollment card, stats |
| 14:32:39 | `/dashboard/trainee` (Materials) | Learning Materials list, top 2 items |
| 14:32:42 | `/dashboard/trainee` (Materials) | Learning Materials list, bottom 3 items |
| 14:32:50 | `/dashboard/trainee` (Credentials) | Verified Trainee (unlocked) + Trained Graduate (locked) |
| 14:32:55 | `/dashboard/trainee` (Credentials) | Trained Graduate card + Official E-Certificate = Locked |
| 14:33:02 | `/dashboard/trainee` | View-as switched to Liza Cruz (Graduate) — congrats banner + stats |
| 14:33:06 | `/dashboard/trainee` | Graduate state — Active Program (Graduate badge) + Upcoming Sessions empty + Enroll teaser |
| 14:33:09 | `/dashboard/trainee` | "Enroll in Another Program" — 3 program cards with price + Enroll |
| 14:33:14 | `/dashboard/trainee` (Credentials) | Graduate — Trained Graduate now unlocked (blue) |
| 14:33:18 | `/dashboard/trainee` (Credentials) | Graduate — Official E-Certificate = "Pending Approval" |
| 14:33:33 | `/dashboard/trainee` (Sheet/drawer) | Hamburger nav drawer — Liza Cruz (Graduate), 2 nav items |
| 14:33:38 | `/dashboard/trainee` (Sheet/drawer) | Hamburger nav drawer — Carlos Reyes (Active), 6 nav items |
| 14:33:54 | `/gallery` | Hero + stats grid, top of page |
| 14:33:57 | `/gallery` | Stats grid tail + photo 1 |
| 14:34:00 | `/gallery` | Photo 1 tail + photo 2 (night group photo) |
| 14:34:03 | `/gallery` | Photo 2 tail + photo 3 (selfie) |
| 14:34:06 | `/gallery` | Photo 3 tail + photo 4 (workshop/microscope) |
| 14:34:10 | `/gallery` | Photo 4 tail + photo 5 (teardown close-up) + photo 6 start |
| 14:34:14 | `/gallery` | Photo 6 tail + photo 7 (large graduation group photo) |

## Screenshots

### 14:30:15 — `/dashboard/trainer`, My Trainees (default)

Sticky local sub-header (persists on scroll): hamburger icon button (☰, rounded-square dark button) on
the left, then a small green status dot + tracked/letter-spaced label **"TRAINER PORTAL"**.

Heading: **"My Trainees"** (bold, large).

Three trainee `Card`s stacked vertically, identical structure:
- `Avatar`: rounded-square, dark-green bg, green initials text (e.g. "CR", "MS", "JD")
- Name (bold white) + email (muted grey) stacked to the right of avatar
- Row: label **"Progress"** (muted) ... value **"68%"** (bold green, right-aligned)
- `Progress` bar directly below: thin, rounded, green fill vs dark track
- `Badge` pill: **"Paid"** (green outline/tint)
- Full-width outline `Button` with star icon: **"☆ Evaluate"** (green text/border, dark fill)

Cards visible: Carlos Reyes / carlos@gmail.com — 68% — Paid — Evaluate. Maria Santos / maria@gmail.com
— 54% — Paid — Evaluate. Juan Dela Cruz / jdc@gmail.com — 41% — Paid — Evaluate (partially cut at
bottom edge).

State: default/collapsed — no card expanded.

### 14:30:19 — `/dashboard/trainer`, Carlos Reyes card expanded (evaluation form)

Same list, but the Carlos Reyes card is now expanded in place (accordion-style, pushes Maria Santos
card down). Inside the card, below the existing Progress bar + "Paid" badge:
- `Button` (outline, muted/grey now instead of green): **"☆ Cancel"** — replaces "Evaluate" when open
- Plain field/trigger showing text **"Diagnostics"** (no visible chevron in this frame — likely a
  second select for skill/topic being evaluated; see Open Questions)
- `Select` trigger showing **"Certified"** with a down-chevron (closed state here)
- `Textarea` placeholder: **"Notes..."**
- Full-width solid bright-green `Button`: **"Submit Evaluation"** (dark text on green, highest-emphasis
  button on the card)

Maria Santos card below still shows default collapsed state (68%→54%, Paid, Evaluate).

### 14:30:22 — `/dashboard/trainer`, "Certified" select open

Identical frame to 14:30:19 except the **Certified** select is now expanded open (chevron flipped to
point up, trigger gets a green focus ring). Options list appears directly below the trigger, inline
(pushes content down), dark card with green border, one row per option:
- ✓ **Certified** (checkmark, currently selected, green check icon)
- **Competent**
- **Needs Improvement**

Confirms this dropdown is the evaluation **outcome/rating** selector, 3 fixed values.

### 14:30:28 — `/dashboard/trainer`, My Trainees scrolled (mixed states)

Scrolled down past Carlos Reyes/Maria Santos. Visible:
- Tail of a card above showing only its "☆ Evaluate" button (belongs to Maria Santos, cut off)
- **Juan Dela Cruz** / jdc@gmail.com — 41% — Paid — Evaluate (default/collapsed state)
- **Liza Cruz** / liza@gmail.com — 92% progress (bar nearly full) — badges **"Paid"** (green) + **"Trained"**
  (blue-outline pill) — button is **"☆ Undo Evaluation"** in a **destructive/red** outline style
  (red text + red-tinted border) instead of green "Evaluate". This is the terminal/evaluated state:
  once a trainee has been evaluated, the CTA becomes an undo action rather than re-opening the form.
- **Patricia Ocampo** / patricia@gmail.com — 22% — Paid — Evaluate (default/collapsed)

### 14:30:33 — `/dashboard/trainer`, Assignments — Create Assignment form open

Heading **"Assignments"**, subtext: *"Post tasks for your trainees. They'll get a real-time
notification and can submit image, video, or document files."*

Button below subtext: solid bright-green pill, **"+ Close"** (plus icon) — implies this toggles a
"+ New Assignment" button into "+ Close" when the create form is expanded (default/closed label not
captured in this slice).

`Card` "Create Assignment" containing, top to bottom:
- `Input` placeholder: **"Title — e.g. Unit 3 Lab Report"**
- `Textarea` placeholder: **"Instructions for trainees..."**
- Label **"Due date"** → field showing **"Jul 28, 2026"** with a calendar icon, right-aligned
- Label **"Due time"** → field showing **"11:59 PM"**
- Label **"Allowed submission types"** → 3 pill chips in a row, all green/selected in this frame:
  🖼 **Image**, 🎥 **Video**, 📄 **Document**
- Full-width solid green `Button`: **"Publish Assignment"**

### 14:30:38 — `/dashboard/trainer`, Due date — inline calendar picker

Same Create Assignment form, but tapping the "Due date" field opened an **inline calendar** directly
beneath it (not a modal/sheet — pushes the rest of the form down). Calendar:
- Header: `‹` **July 2026** `›`
- Weekday row: Su Mo Tu We Th Fr Sa
- Date grid, trailing/leading days of adjacent months shown muted/dim (28, 29, 30 from June; 1 from
  Aug at end)
- **28** highlighted as a solid green rounded square (today / selected)
- Footer button: **"Today"** (outline pill, green text)

Text visible below the calendar (cut off): "...will be notified instantly." (continuation of the
Assignments subtext, now pushed further down by the open calendar).

### 14:30:49 — `/dashboard/trainer`, submission types partially deselected + empty list

Form now shows **Image chip deselected** (muted grey bg/text, no longer green) while **Video** and
**Document** remain green/selected — demonstrates the chip toggle is multi-select, independently
tappable. "Publish Assignment" button still present below.

Below the form card, a separate empty-state `Card`:
- Icon: clipboard, in a rounded-square green-tinted badge
- Bold heading: **"No assignments yet"**
- Muted body: *"Click **New Assignment** to post one. Trainees will be notified instantly."* (bold
  inline emphasis on "New Assignment")

### 14:30:56 — `/dashboard/trainer`, Modules — upload form + existing list

Heading **"Modules"**.

`Card` "Upload New Module":
- `Input` placeholder **"Title..."**
- `Select` trigger showing **"PDF"** with down-chevron (closed)
- Plain numeric-looking field showing **"1"** (no visible label above it in frame — likely unit/order
  number; see Open Questions)
- Outline `Button` with upload icon: **"Upload"** (green text/border, not full-width — left-aligned,
  auto width)

Below, a list of 4 existing modules (simple list rows, divider lines between, no card border per row):
- 📄 **Cellphone Repair Fundamentals — Unit 1** / "Unit 1 · PDF · 2.4 MB · Mar 12, 2026"
- 📄 **Logic Board Anatomy Video** / "Unit 2 · MP4 · 84 MB · Mar 20, 2026"
- 📄 **Micro-Soldering Tools Guide** / "Unit 2 · PDF · 1.1 MB · Apr 05, 2026"
- 📄 **Assessment Quiz — Unit 2** / "Unit 2 · DOCX · 0.3 MB · Apr 18, 2026"

(All 4 rows use the same generic document/file icon glyph regardless of file type in this render.)

### 14:30:59 — `/dashboard/trainer`, Modules file-type select open

Same screen; the file-type `Select` is expanded inline below its trigger, green-bordered dark panel:
- ✓ **PDF** (checkmark, selected)
- **MP4**
- **DOCX**

Confirms 3 fixed module file types. Module list below unaffected/unchanged.

### 14:31:14 — `/` (home), Notification bell popover open

Top bar: logo lockup (icon mark + "HardTech" / "IT CORP." stacked, green subtitle) on the left; on the
right, **two separate circular icon buttons**: a bell (🔔) with a small green unread-count `Badge`
showing **"1"**, and a hamburger (☰) button — both dark rounded-square buttons, sitting side by side.

Notification popover (anchored under the bell, not a full-screen sheet):
- Header row: bell icon + **"Notifications"** + green `Badge` **"1 new"** ...... **"✓✓ Mark all read"**
  (muted, right-aligned, checkmark icons)
- `Tabs`: **"Unread"** (active, green underline, green `Badge` count **"1"**) / **"Read"**
- List item: blue circular icon (ℹ), bold **"New trainee assigned"**, body *"Patricia Ocampo joined
  Computer Hardware."*, muted timestamp **"1d ago"**, small green unread dot on the far right
- Footer: **"Clear all"** link, right-aligned, muted/red-tinted text

Behind the popover (dimmed/blurred), the home hero is visible: partial badge pill **"● ENROLLMENTS
OPEN — 2026"**, tail of a longer paragraph *"...Development through immersive hands-on learning."*,
two CTA buttons — solid green **"Enroll Now →"** and outline **"Explore Programs ›"** — then a row of
trust badges wrapping to 2 lines: **"✓ Skills-First Training"** / **"✓ QR Certificates"** (blue check)
on row 1, **"✓ Job Placement Assist"** (purple check) centered on row 2.

Below that: eyebrow label **"WHAT WE OFFER"** (tracked caps, muted), heading **"Core Programs"** (green
gradient/bold). A peeking carousel: center card fully visible = **"Computer Hardware Servicing"**
(background photo, centered icon-in-circle overlay, badge pills **"120 hrs"** and **"2,400+
enrolled"**), with **"I.T. Software Development"** (left, partially cropped, `‹›` icon overlay) and
**"Cellphone Hardware Servicing"** (right, partially cropped, phone-icon overlay) peeking at the edges.
Circular `‹` `›` nav-arrow buttons sit over the left/right edges of the carousel. Dot pagination below
the carousel: first dot rendered as an elongated green pill (active), remaining 2 as small dots.

At the very bottom edge: a **"LIVE UPDATES"** ticker bar — green dot + megaphone icon + label, an
**"UPDATE"** `Badge`, small `‹` — green pill — `›` arrow controls, and a **"1/2"** counter — a second,
independent horizontal ticker/carousel below the Core Programs one.

### 14:32:09 — `/dashboard/trainee`, Welcome (Carlos Reyes, In Progress)

Sticky sub-header: hamburger (☰) + green dot + **"TRAINEE PORTAL"**.

**DEMO switcher** `Card` (dashed amber/orange border, distinct from all other cards): orange label
**"DEMO"** + muted **"View as:"**, then two pill toggle buttons: **"Carlos Reyes · In Progress"**
(solid green/selected) and **"Liza Cruz · Graduate"** (outline/unselected). This is a persona switcher
for the demo build, not real auth.

Heading **"Welcome, Carlos Reyes"**, subtext **"Cellphone Repair · Batch 2026-A"**.

4 stat tiles in a 2×2 grid, each a `Card` with icon-in-rounded-square, big bold green number, muted
label below:
- 🎓 **68%** — "Overall Progress"
- 📅 **4** — "Sessions Ahead"
- 📄 **4** — "Materials"
- 🛡 **Active** — "Status" (text value instead of number, still green)

Below, `Card` **"Cellphone Repair"**: green outline `Badge` **"ACTIVE PROGRAM"** (tracked caps) above
the title, subtext **"Trainer: Mr. Henry Gomata Lopez · Batch 2026-A"**, `Badge` **"✓ Active Trainee"**
(green outline pill), then label **"Program Progress"** ... **"68%"** with progress bar beneath (cut
off at bottom of frame).

### 14:32:12 — `/dashboard/trainee`, Active Program + Upcoming Sessions

Continuation of the same dashboard, scrolled: tail of the 4-stat grid, then the "Cellphone Repair"
Active Program card (Trainer: Mr. Henry Gomata Lopez · Batch 2026-A, ✓ Active Trainee badge, Program
Progress 68% bar).

Below it, `Card` **"Upcoming Sessions"** — a list of 4 session rows, each: time (bold green, 2 lines —
e.g. "08:00 AM" / date "2026-05-14") on the left, session title (truncated with ellipsis, e.g. "Screen
& Di...") + location ("Lab A") in the middle, and a session-type `Badge` pill on the right:
- 08:00 AM · 2026-05-14 · "Screen & Di..." · Lab A · **Hands-on** (green-tinted badge)
- 01:00 PM · 2026-05-14 · "Battery & C..." · Lab A · **Workshop** (blue-tinted badge)
- 09:00 AM · 2026-05-16 · "Unit 3 Ass..." · Lab A · **Assessment** (orange/amber-tinted badge)
- 08:00 AM · 2026-05-19 · "Micro-Solderi..." · Lab A · **Lecture** (grey/neutral badge)

Session titles are truncated with `…` — confirms fixed-width truncation on the mobile row layout
rather than wrapping.

### 14:32:17 — `/dashboard/trainee`, Session Schedule page — calendar

Navigated (via drawer) to a **separate Session Schedule page** (distinct from the dashboard's
Upcoming Sessions widget). DEMO switcher card still present at top. Heading **"Session Schedule"**,
subtext **"Philippine Standard Time · Live from your trainer"**.

Month nav row: `‹` **"July 2026"** `›` ... **"Today (PH)"** pill button (green outline, right-aligned).

Full calendar grid (Sun–Sat header), same visual language as the trainer's date picker but larger/
standalone. **28** is selected (solid green rounded square).

Below the calendar, a `Card`: eyebrow **"SELECTED DAY"** (green, tracked caps), bold **"Tuesday, July
28, 2026"**, muted **"0 sessions"**.

### 14:32:22 — `/dashboard/trainee`, Session Schedule — empty state

Same page, scrolled slightly so the DEMO card is mostly off-screen (only its bottom edge / second
toggle pill visible). Below the "Selected Day" card header info, the empty-state body text is now
visible: **"No sessions scheduled."** (centered, muted grey, no icon — simpler empty state than the
Assignments one).

### 14:32:26 — `/dashboard/trainee`, Assignments page — empty state

Heading **"Assignments"**, subtext *"Submit tasks posted by your trainer — images, videos, or
documents."*

Empty-state `Card` (centered): clipboard icon in rounded-square green-tinted badge, bold **"No
assignments yet"**, muted body *"Your trainer hasn't posted anything. You'll get a notification when
they do."* Rest of viewport below is empty dark background (short page, no further content).

### 14:32:33 — `/dashboard/trainee`, Enrolled Programs page

Heading **"Enrolled Programs"**.

`Card`: green outline `Badge` **"ENROLLED"** (tracked caps), title **"Cellphone Repair"**, subtext
**"Trainer: Mr. Henry Gomata Lopez · Batch 2026-A"**, `Badge` **"Active"** (green), label
**"Completion"** ... **"68%"** with progress bar. Below, a 2-column stat grid (3 boxes, third one
alone on row 2):
- **"START"** (tracked caps label) → **"Mar 10, 2026"**
- **"SESSIONS"** → **"4"**
- **"MATERIALS"** → **"4"**

### 14:32:39 — `/dashboard/trainee`, Materials page (top)

Heading **"Learning Materials"**. List of material `Card`s, each: icon-in-rounded-square (document
icon = green for PDF, video-camera icon = blue for MP4), `Badge` top-right showing file type
(**"PDF"**, **"MP4"**), bold title, muted subtext ("Unit N · size"), and a full-width outline `Button`
with a download icon: **"Download"**.
- **Cellphone Repair Fundamentals — Unit 1** — PDF — "Unit 1 · 2.4 MB" — Download
- **Logic Board Anatomy Video** — MP4 — "Unit 2 · 84 MB" — Download
- (third card PDF icon peeking at bottom edge)

### 14:32:42 — `/dashboard/trainee`, Materials page (scrolled)

Continues the same list:
- **Logic Board Anatomy Video** — MP4 — "Unit 2 · 84 MB" — Download (repeat, now fully in frame)
- **Micro-Soldering Tools Guide** — PDF — "Unit 2 · 1.1 MB" — Download
- **Assessment Quiz — Unit 2** — DOCX — "Unit 2 · 0.3 MB" — Download

All 4 of the trainer's uploaded modules (from 14:30:56) surface here 1:1 for the trainee, confirming
Modules (trainer) and Materials (trainee) are the same underlying data, filtered per program.

### 14:32:50 — `/dashboard/trainee`, Credentials page (top)

Heading **"My Credentials"**, subtext *"Badges and e-certificate from HardTech IT Corp"*.

Credential `Card` 1 (unlocked/earned state — green glow border):
- Circular badge icon: shield outline (green) with a small green circular checkmark overlay
  bottom-right
- Eyebrow **"HARDTECH IT CORP"** (green, tracked caps)
- Bold **"VERIFIED TRAINEE"**
- Green name **"Carlos Reyes"**
- Muted **"Cellphone Repair · Batch 2026-A"**

Credential `Card` 2 (locked/unearned state — dim grey border, greyscale icon, no checkmark overlay):
- Circular badge icon: graduation cap outline (grey, no glow)
- Eyebrow **"HARDTECH IT CORP"** (grey)
- Bold **"TRAINED GRADUATE"**
- Grey name **"Carlos Reyes"**
- Muted **"Cellphone Repair · 68% complete"**
- Extra helper line (only on the locked card): *"Awarded after completing training & certificate
  approval"*

### 14:32:55 — `/dashboard/trainee`, Credentials — E-Certificate locked

Scrolled: tail of "Verified Trainee" card, full "Trained Graduate" locked card (as above), then a
third `Card`:
- Lock icon (grey, rounded-square badge)
- Bold **"Official E-Certificate"**
- Muted *"Unlocks once your trainer marks your training as completed"*
- Disabled-looking pill/`Button`: 🔒 **"Locked"** (grey, non-interactive styling)

### 14:33:02 — `/dashboard/trainee`, Liza Cruz (Graduate) — welcome + banner

DEMO switcher now shows **"Liza Cruz · Graduate"** selected (solid green) and "Carlos Reyes · In
Progress" unselected — confirms this is the same persona-switch mechanism, now toggled.

Heading **"Welcome, Liza Cruz"**, subtext **"Cellphone Repair · Batch 2026-A"**.

New banner `Card` not present for the in-progress persona (distinct blue-tinted bg/border):
- Graduation-cap icon (blue, in rounded badge)
- Bold **"Training Completed — Congratulations!"**
- Body: *"You're no longer assigned to active sessions for Cellphone Repair. You may enroll in a new
  program below."*
- Solid green `Button`: **"Browse Programs"**

4 stat tiles (same 2×2 layout as Carlos Reyes' dashboard, values differ):
- 🎓 **92%** — "Overall Progress"
- 📅 **4** — "Sessions Ahead" (unchanged/stale value — see Open Questions)
- 📄 **4** — "Materials"
- 🛡 **Graduate** — "Status" (green text, replaces "Active")

### 14:33:06 — `/dashboard/trainee`, Liza Cruz — Active Program + empty sessions + enroll teaser

Tail of stat grid, then Active Program `Card` for **"Cellphone Repair"**: badge now reads **"✓
Graduate"** instead of "✓ Active Trainee"; **"Program Progress 92%"** bar (near-full).

**Upcoming Sessions** `Card`: no list — replaced entirely with centered muted text: *"You've completed
training. No active class sessions are assigned to you."*

New section heading **"Enroll in Another Program"**, subtext *"Want to keep learning? Pick a new
program and proceed through the same enrollment & payment flow."* First program card begins:
**"Computer Hardware"** / "Trainer: Prof. Adelan P. Sistoso" (cut off before price/button).

### 14:33:09 — `/dashboard/trainee`, Enroll in Another Program — full list

Three program `Card`s, each: bold title, muted trainer line, large green price, and a small outline
`Button` **"Enroll"** (right-aligned, same row as price):
- **Computer Hardware** — Trainer: Prof. Adelan P. Sistoso — **₱5,000** — Enroll
- **I.T. Software Development** — Trainer: Prof. Adelan P. Sistoso — **₱5,000** — Enroll
- **Networking Basics** — Trainer: Prof. Adelan P. Sistoso — **₱5,000** — Enroll

Footer helper text below the cards: *"After confirming, your enrollment goes to admin for payment
verification — same as your first time."* (re-uses the enrollment approval workflow described
elsewhere in the design source).

### 14:33:14 — `/dashboard/trainee`, Liza Cruz Credentials — Trained Graduate unlocked

Credentials page for the Graduate persona. "Verified Trainee" card same as before (green, unlocked).
Second card — **Trained Graduate** — is now in its **unlocked/earned** visual state (previously grey/
locked for Carlos Reyes): blue glow border, blue graduation-cap icon with a blue circular checkmark
overlay, blue eyebrow, bold **"TRAINED GRADUATE"**, blue name **"Liza Cruz"**, muted **"Cellphone
Repair · 92% complete"** — and notably the extra "Awarded after completing..." helper line from the
locked state is **gone** now that it's earned.

### 14:33:18 — `/dashboard/trainee`, Liza Cruz Credentials — E-Certificate pending

Scrolled: tail of Verified Trainee card, full unlocked Trained Graduate card, then the **Official
E-Certificate** card in its 3rd distinct state:
- Icon changes from a padlock to a **scroll/certificate** icon (green, rounded badge) — different
  glyph than the locked state's lock icon
- Bold **"Official E-Certificate"**
- Muted *"Your certificate request is awaiting admin approval"*
- `Badge`/pill: 🕐 **"Pending Approval"** (amber/orange tint, clock icon) — replaces the grey "Locked"
  pill

Confirms a 3-state certificate lifecycle: **Locked** (in-progress trainee) → **Pending Approval**
(graduated, cert requested) → presumably an approved/downloadable state not captured in this slice.

### 14:33:33 — Hamburger drawer (`Sheet`), Liza Cruz — Graduate

Right-side slide-in drawer, dark bg, occupies roughly 85% of viewport width (dimmed overlay over the
remaining ~15% + full page beneath), rounded left edge.

Header row: green-outlined `Avatar` "LC" + bold **"Liza Cruz"** + green dot + muted **"Graduate"**
status line; `X` close `Button` (rounded-square) top-right of the drawer.

Section label **"TRAINEE PORTAL"** (tracked caps, muted).

Nav list — only **2 items** for this Graduate persona:
- 🟩 **My Dashboard** (green accent icon, highlighted/active — green-tinted bg + border, since this is
  the current page)
- 🔵 **Credentials** (blue accent icon)

Footer (pinned to bottom of the drawer, divider above): 🏠 **"Back to Landing"**, 🚪 **"Logout"** (red
text/icon, destructive styling).

### 14:33:38 — Hamburger drawer (`Sheet`), Carlos Reyes — Active Trainee

Same drawer chrome (avatar, close button, footer), but for the **Carlos Reyes / Active Trainee**
persona the nav list has **6 items**:
- 🟩 **My Dashboard**
- 🔵 **Session Schedule** (highlighted/active this time — blue-tinted bg + border)
- 🟣 **Assignments**
- 🩷 **Enrolled Programs**
- 🟡 **Materials**
- 🔵 **Credentials**

Each item has a distinct icon color (green/blue/purple/pink/yellow/cyan) rather than a single accent
color — a small "rainbow" icon treatment per nav item. This is the key contrast with 14:33:33: **the
drawer's nav list is status-conditional** — a Graduate trainee's drawer drops Session Schedule,
Assignments, Enrolled Programs, and Materials, leaving only My Dashboard + Credentials.

### 14:33:54 — `/gallery`, hero + stats (top)

Top bar here shows **only** the logo lockup + a single hamburger button — **no bell icon** visible
(contrast with the home page's bell+hamburger pair in 14:31:14).

`Badge` pill: **"◆ GALLERY"** (small, green outline). Heading: **"Training in Action"** (white +
green "Action"). Paragraph: *"Real moments from our training sessions, workshops, and graduation
ceremonies. Every photo tells the story of someone building their future."*

Stats — 2×2 grid of `Card`s, icon-in-rounded-square + big green bold number + muted label:
- 📷 **500+** — "Photos"
- 👥 **10,000+** — "People Trained"
- 🎖 **50+** — "Ceremonies"
- ⚡ **20+** — "Years of Training"

First full-bleed rounded-corner photo begins directly below the stats grid (group photo, HardTech shop
interior, staff posing).

### 14:33:57 — `/gallery`, scrolled — photo 1 full

Tail of the stats grid (Ceremonies/Years cards) scrolling under the sticky mini header (logo +
hamburger stay pinned, translucent/blurred backdrop over the photo edge as it scrolls beneath). Photo 1
now fully in frame (same group photo as above). Photo 2 begins below (a night-time group photo, more
people, someone drinking/pointing at camera).

### 14:34:00 — `/gallery`, scrolled — photo 2 tail + photo 3

Tail of photo 2 (feet/floor visible). Photo 3: a selfie-style close-up (man in red jacket) — appears to
be the same photo 2 subject cropped closer, or a separate close-up shot.

### 14:34:03 — `/gallery`, scrolled — photo 3 tail + photo 4

Tail of photo 3 (chin/jacket close-up). Photo 4: workshop scene — two people at a desk with a monitor
showing PCB schematics and a 4K digital microscope, HardTech branded backdrop banner reading "ADVANCE
BO[ARD]... ANDROID SPECIALIST[S]".

### 14:34:06 — `/gallery`, scrolled — photo 4 tail + photo 5

Tail of photo 4 (legs/chairs). Photo 5: graduation-style group photo — trainees in black HardTech
shirts holding printed certificates, instructor taking a selfie in front, workbenches with monitors and
soldering stations behind.

### 14:34:10 — `/gallery`, scrolled — photo 5 tail + photo 6 + photo 7 start

Tail of photo 5 (feet/floor, standing crowd). Photo 6: extreme close-up of a disassembled phone
motherboard/logic board and internal components on a work surface. Photo 7 begins: a hand + microscope
soldering setup (dark, close-up).

### 14:34:14 — `/gallery`, scrolled — photo 7 tail + photo 8 (large)

Tail of photo 7 (legs/feet of standing group, partial). Photo 8: a large full-width version of the
same/similar group photo as photo 1 (HardTech shop interior, staff posing with peace signs).

## Flows observed

1. **Trainer evaluation flow** (14:30:15 → 14:30:19 → 14:30:22): tap "Evaluate" on a trainee card →
   card expands in place (accordion, not modal) into an inline form (Cancel button replaces Evaluate,
   plus a "Diagnostics" field, a "Certified/Competent/Needs Improvement" rating `Select`, a Notes
   `Textarea`, and a "Submit Evaluation" button) → tapping the rating select expands its options
   inline below the trigger. Once a trainee has been evaluated, their card CTA permanently changes to
   a destructive-styled **"Undo Evaluation"** button instead of re-opening the form (seen for Liza
   Cruz in 14:30:28).

2. **Trainer assignment-creation flow** (14:30:33 → 14:30:38 → 14:30:49): a "+ New Assignment" toggle
   (shown here already toggled to "+ Close") reveals a Create Assignment form → tapping the "Due date"
   field opens an **inline calendar** (not a native picker, not a sheet) → submission-type chips
   (Image/Video/Document) are independently toggleable, defaulting to all-selected. The empty state
   "No assignments yet" persists beneath the form throughout, since this demo trainer has none yet.

3. **Trainer module upload flow** (14:30:56 → 14:30:59): Upload New Module form with a file-type
   `Select` (PDF/MP4/DOCX) that expands inline; 4 pre-existing modules are listed below regardless of
   form state.

4. **Trainee dashboard → sub-page drill-down** (14:32:09 → 14:32:12, then 14:32:17/22, 14:32:26,
   14:32:33, 14:32:39/42, 14:32:50/55): the trainee dashboard's summary widgets (Upcoming Sessions,
   stat tiles) each correspond to a full standalone page reachable from the drawer nav (Session
   Schedule, Assignments, Enrolled Programs, Materials, Credentials) — the dashboard is a rollup, not
   the only place this data lives.

5. **DEMO persona switch — In Progress vs Graduate** (14:32:09…14:32:55 vs 14:33:02…14:33:18): toggling
   the "View as" pill from Carlos Reyes to Liza Cruz changes: the welcome banner (adds a "Training
   Completed" congrats card with a "Browse Programs" CTA), the Status stat tile (Active → Graduate),
   the Active Program badge (Active Trainee → Graduate), the Upcoming Sessions widget (session list →
   "no active sessions" message), adds an entire "Enroll in Another Program" section with 3 paid
   program cards, and changes both Credential cards' locked/unlocked visual state plus the Official
   E-Certificate's state from **Locked** → **Pending Approval**. This is the single richest
   role/status-conditional flow in the slice.

6. **Drawer nav is status-conditional, not just role-conditional** (14:33:33 vs 14:33:38): the same
   trainee role (`trainee`) gets a 2-item drawer (My Dashboard, Credentials) once graduated, vs a
   6-item drawer (My Dashboard, Session Schedule, Assignments, Enrolled Programs, Materials,
   Credentials) while active/in-progress. Rebuild the nav config keyed off program status, not just
   the user's role.

7. **Gallery infinite photo scroll** (14:33:54 → 14:34:14): stats header, then a single-column stack of
   real training/graduation photographs with no visible captions or lightbox affordance captured in
   this slice; the mini top bar (logo + hamburger only, no bell) stays pinned/sticky over the photos as
   they scroll beneath it.

## Mobile layout rules

- **Top bar collapses to icon buttons only.** No inline text nav links visible anywhere in this slice.
  Home page (`/`) shows logo + **bell** (with unread-count badge) + **hamburger**, both as separate
  circular/rounded-square icon buttons. Gallery (`/gallery`) shows logo + **hamburger only** — no bell
  (open question: is this route-specific, or did the bell scroll away before capture?).
- **Dashboard sub-header is sticky and separate from the main navbar.** Trainer/trainee portal pages
  show a persistent slim bar: hamburger (☰) + colored status dot + tracked-caps role label
  ("TRAINER PORTAL" / "TRAINEE PORTAL"). This is distinct from — and sits below — the app's main
  floating glass navbar (which scrolls out of view first).
- **Primary nav is a right-side `Sheet`/drawer** (vaul), ~85% viewport width, dark background, rounded
  leading edge, dimmed overlay on the remaining strip. Structure: profile header (avatar + name +
  status pill) with an `X` close button, a section label, a vertical list of icon+label nav rows (each
  icon its own accent color; active row gets a tinted background + colored border), then a
  bottom-pinned footer with "Back to Landing" and a red "Logout" row, separated by a divider.
- **Nav list content is state-conditional**, not fixed per role — see Flow 6. Build the drawer as a
  computed list filtered by trainee program status (active vs graduate), not a static per-role array.
- **Selects expand inline, not as floating overlays.** Tapping a `Select` trigger (rating dropdown,
  file-type dropdown) opens its option list directly beneath the trigger in normal document flow,
  pushing following content down. Selected option shows a leading checkmark. Same visual treatment
  (dark card, colored border matching the open trigger) for every select seen.
- **Date pickers are inline calendars**, not native `<input type=date>` and not a sheet/modal. Tapping
  a date field reveals a full month-grid calendar directly below it (prev/next chevrons, weekday
  header, "Today" shortcut pill), again pushing subsequent content down.
- **Forms expand accordion-style inside cards** rather than navigating to a new screen or opening a
  modal — e.g., the trainer's per-trainee "Evaluate" form and the "Create Assignment"/"Upload New
  Module" forms all live inside the same card/section they're triggered from.
- **Chips/toggle groups fit 3-across** on this viewport (submission-type chips: Image/Video/Document),
  each an icon+label pill, green-tinted when active vs muted grey when off.
- **Stat tiles use a fixed 2×2 grid** (trainee dashboard KPIs, gallery stats) regardless of how many
  values are shown; everything else is single-column stacked cards — no other multi-column grid
  appears in this slice.
- **Progress bars**: thin, fully rounded, green fill over a dark track, with the percentage rendered
  as bold green text right-aligned above/beside the bar's label — used identically on trainer trainee
  cards, trainee program cards, and the enrolled-program card.
- **Empty states** are centered, icon in a rounded-square tinted badge, bold heading, one line of muted
  helper copy — no illustrations, no CTA button in most cases (Assignments/Materials-adjacent empty
  states); the "No sessions scheduled." variant on the Session Schedule page skips the icon entirely
  and is plain centered text.
- **Badges/pills** are the primary state indicator throughout: green = paid/active/verified/enrolled,
  blue = trained/graduate/workshop, orange/amber = assessment/pending, grey = lecture/locked/neutral,
  red = destructive (Undo Evaluation, Logout).
- **Sticky mini header while scrolling long content** (Gallery): the logo+hamburger bar stays pinned
  at the top with a translucent/blurred backdrop as full-bleed photos scroll underneath it.
- **Truncation over wrapping** for session titles in list rows (Upcoming Sessions) — fixed-width
  ellipsis rather than allowing the row to grow taller.

## Open questions

- What exactly is the plain **"Diagnostics"** field in the trainer's evaluation form (14:30:19)? It
  has no visible chevron/affordance in the captured frame — could be a second `Select` (evaluation
  topic/skill area) that simply wasn't tapped, a read-only label, or a disabled input. Its options
  were never revealed in this slice.
- What is the numeric field showing **"1"** in the "Upload New Module" form (14:30:56)? No label was
  visible above it in the captured frame — likely a unit/order number, but the label text scrolled out
  or wasn't rendered in view.
- Is there an active/approved (downloadable) state for the **Official E-Certificate**, beyond the
  **Locked** (in-progress) and **Pending Approval** (graduated, awaiting admin) states captured here?
  Not present in this slice — needs confirmation from another slice or the bundle.
- Does the **notification bell** appear on every authenticated route, or only the home page? It's
  present on `/` (14:31:14) but absent from `/gallery`'s top bar (14:33:54–14:34:14) — could be a
  route-level design choice (gallery treated as a marketing/public page) or simply scrolled out of
  frame before the screenshot was taken.
- Full/untruncated copy of the home hero paragraph is not recoverable from this slice — only the tail
  *"...Development through immersive hands-on learning."* is visible behind the notification popover
  in 14:31:14.
- Default/idle label for the trainer's Assignments toggle button — this slice only shows it already
  toggled open as **"+ Close"**; the closed-state label (presumably "+ New Assignment", per the empty
  state's bolded reference to "New Assignment") was never captured directly.
- Liza Cruz's (Graduate) "Sessions Ahead" stat still reads **4** (14:33:02), identical to Carlos Reyes'
  in-progress value — likely stale/unwired demo data rather than intentional, since her Upcoming
  Sessions widget on the same screen says she has none. Flag for the builder to not copy this
  inconsistency literally.
