# Mobile Screenshot Spec — Batch 03 (items 71–105)

Source folder: `D:\Win10_UserData\Downloads\Hardtech\Mobile\*.jpg`
All 35 screenshots in this batch were taken on **2026-07-28, 14:19:14 → 14:21:54**, all on the
**same route: `/help`** (Help Centre). The whole batch is one continuous capture session of a
person testing the Help Centre's three role tabs (Admin → Trainer → Trainee) and expanding every
accordion section under each.

## IMPORTANT — browser chrome is not app UI

Every screenshot shows an **Android in-app browser (Custom Tab) opened from Messenger**, not a
bare mobile browser. The top ~190px of every image is OS/browser chrome and must be ignored by
the builder:

- Android status bar (time, Messenger icon, screenshot-tool icon, notification count "31", mute/5G/signal/battery icons).
- A black bar with a padlock icon, the URL `slot-pear-69660733.figma.site`, an "×" close button
  (left) and a "⋯" overflow menu (right), and the small grey caption "Messenger" beneath the URL
  (this names the referring app, it is not page content).

Everything below that black bar is the actual HardTech `/help` page.

## Summary table

| # | Time | Route | Section / state |
|---|------|-------|------|
| 1 | 14:19:14 | `/help` | Admin role tab active, scrolled mid-list: "Approving Community Join Requests" open, "Checking Notifications" closed |
| 2 | 14:19:18 | `/help` | Admin role tab, "Checking Notifications" open (steps 1-3), "Still need help?" card visible |
| 3 | 14:19:21 | `/help` | Admin role tab, bottom of page — end of "Still need help?" card + top of site footer |
| 4 | 14:19:30 | `/help` | Scrolled to top; role switched to **Trainer** (selected/glow state); role description begins |
| 5 | 14:19:35 | `/help` | Trainer description end, "8 sections" count, Tip callout, "How to Log In" open (steps 1-2) |
| 6 | 14:19:39 | `/help` | "How to Log In" open (steps 1-3 full), "Your Dashboard Overview" closed below |
| 7 | 14:19:45 | `/help` | "Your Dashboard Overview" open (steps 1-3) |
| 8 | 14:19:50 | `/help` | "Managing Your Calendar" open (steps 1-3, step 4 cut) |
| 9 | 14:19:54 | `/help` | "Managing Your Calendar" open (steps 3-5), "Viewing & Evaluating Your Trainees" closed |
| 10 | 14:20:00 | `/help` | "Viewing & Evaluating Your Trainees" open (steps 1-3) |
| 11 | 14:20:05 | `/help` | "Viewing & Evaluating Your Trainees" (step 4-5), "Uploading Learning Modules" closed |
| 12 | 14:20:10 | `/help` | "Uploading Learning Modules" open (steps 1-4) |
| 13 | 14:20:13 | `/help` | "Uploading Learning Modules" (steps 2-4), "Creating & Managing Assignments" + "Joining a Community" closed |
| 14 | 14:20:18 | `/help` | "Creating & Managing Assignments" open (steps 1-4 start) |
| 15 | 14:20:21 | `/help` | "Creating & Managing Assignments" (steps 3-4), "Joining a Community" + "Moderating a Community" closed |
| 16 | 14:20:25 | `/help` | "Joining a Community" open (steps 1-3), "Moderating a Community" closed |
| 17 | 14:20:31 | `/help` | "Moderating a Community" open (steps 1-3) |
| 18 | 14:20:37 | `/help` | "Moderating a Community" (steps 3-5), "Still need help?" card starts — end of Trainer's 8 sections |
| 19 | 14:20:46 | `/help` | Scrolled to top; role switched to **Trainee** (selected/glow state); description begins |
| 20 | 14:20:49 | `/help` | Trainee description end, "14 sections" count, Tip callout, "How to Log In" open (steps 1-2) |
| 21 | 14:20:53 | `/help` | "How to Log In" open (steps 1-4 full), "Your Dashboard at a Glance" closed |
| 22 | 14:20:57 | `/help` | "Your Dashboard at a Glance" open (steps 1-3 start) |
| 23 | 14:21:00 | `/help` | "Your Dashboard at a Glance" (steps 3-4), 3 closed sections queue below |
| 24 | 14:21:04 | `/help` | "Checking Your Enrolled Program" open (steps 1-3) |
| 25 | 14:21:09 | `/help` | "Viewing Your Session Schedule" open (steps 1-3 start) |
| 26 | 14:21:13 | `/help` | "Viewing Your Session Schedule" (steps 2-4) |
| 27 | 14:21:17 | `/help` | "Downloading Learning Materials" open (steps 1-3 start) |
| 28 | 14:21:21 | `/help` | "Downloading Learning Materials" (steps 3-4), "Submitting Assignments" + "Your Badges & Credentials" closed |
| 29 | 14:21:25 | `/help` | "Submitting Assignments" open (steps 1-3) |
| 30 | 14:21:29 | `/help` | "Submitting Assignments" (steps 2-4), "Your Badges & Credentials" + "Downloading Your E-Certificate" closed |
| 31 | 14:21:35 | `/help` | "Your Badges & Credentials" open (steps 1-3 start) |
| 32 | 14:21:40 | `/help` | "Your Badges & Credentials" (steps 3-4), "Downloading Your E-Certificate" closed |
| 33 | 14:21:45 | `/help` | "Downloading Your E-Certificate" open (steps 1-3 start) |
| 34 | 14:21:49 | `/help` | "Downloading Your E-Certificate" (steps 3-5), "Re-Enrolling in a New Program" closed |
| 35 | 14:21:54 | `/help` | "Re-Enrolling in a New Program" open (steps 1-3) — batch ends here, 5 of 14 Trainee sections remain unseen (continues in next batch) |

## Recurring components (defined once, referenced per screenshot below)

- **App header bar** — sticky/pinned card at the very top of the in-page content (sits just under
  the browser chrome and stays fixed while everything else scrolls behind/underneath it — several
  screenshots show a previous section's text peeking out from behind its top edge). Contents:
  circular pixel-art HardTech logo (green diamond/circuit icon) + two-line wordmark "**HardTech**"
  (bold white) / "**IT CORP.**" (small green caps) on the left, and a dark rounded-square
  **hamburger button** (☰, 3 lines) on the right. The hamburger implies the mobile nav is a
  Sheet/Drawer (matches the `vaul` dependency noted in the design source doc) — not seen opened in
  this batch.
- **Page hero block** (only visible when scrolled to top, screenshots #4, #19): green pill/Badge
  reading `? User Guide · Gabay sa Gumagamit` (circular question-mark icon + green outlined pill),
  then H1 "**How to Use**" (white) / "**HardTech IT Corp.**" (neon green, bold, larger), then a
  two-line English/Filipino subhead in muted gray, then a small tracked-out label
  "SELECT YOUR ROLE · PILIIN ANG IYONG PAPEL".
- **Role selector** — 3 cards: Admin (Shield icon) / Trainer (Layers icon, 3 stacked diamonds) /
  Trainee (GraduationCap icon), each showing an icon in a rounded-square swatch, the role name in
  English (bold), and the Filipino translation beneath in gray ("Tagapamahala" / "Guro / Tagasanay"
  / "Mag-aaral"). Laid out as 2 cards per row, flex-wrapped and **centered** — Admin+Trainer fill
  row 1, Trainee wraps to row 2 centered alone. Unselected cards: neutral dark bg, thin gray
  border, gray icon. Selected card: colored glow border + tinted icon background + colored label
  text — **amber/orange** for Trainer, **green (neon)** for Trainee (Admin's selected color not
  observed in this batch).
- **Role description card** — a tinted rounded card (amber-tinted under Trainer, green-tinted under
  Trainee) with an English description sentence, a Filipino translation below it, and a centered
  "**N sections · N seksyon**" count in the accent color (8 for Trainer, 14 for Trainee).
- **Tip callout** — a small rounded card, blue circular "i" info icon + blue bold text
  "**Tip: Click any section below to expand it.**" then a gray Filipino line
  "Payo: I-click ang anumang seksyon sa ibaba para palawakin ito."
- **Accordion section card** ("Collapsible"-style, not a single bordered shadcn Accordion — each
  topic is its own separate rounded dark card stacked with gaps): header row = icon in a green
  rounded-square swatch (Lucide icon distinct per topic) + Title (bold white, English) / subtitle
  (gray, Filipino) stacked, + a circular dark chevron button on the right. **Collapsed = chevron
  pointing right (›)**. **Expanded = chevron pointing down (⌄)**, and the card's body reveals a
  vertical numbered stepper.
- **Numbered stepper** (custom component, no direct shadcn equivalent — build as a flex column with
  a green filled circle "badge" per step connected by a thin green vertical line to the next
  circle, i.e. a timeline): each step = green circle with a dark number, then bold white English
  instruction text, then a smaller gray Filipino translation directly under it.
- **Bilingual copy pattern** — nearly every string on this page is doubled: English line first
  (white/bold or default), Filipino/Tagalog translation immediately after in muted gray, smaller.
  This applies to headings, descriptions, tips, and every stepper line.
- **"Still need help?" card** — appears once at the end of each role's accordion, before the site
  footer. Centered bold heading "**Still need help? · Kailangan pa ng tulong?**", then centered
  body "Visit our **Contact page** or ask your trainer directly." (Contact page = green inline
  link) with a Filipino line below, "Bisitahin ang aming **Contact page** o direkta na tanungin ang
  iyong trainer." (Contact page again a green link).
- **Site footer (top only glimpsed)** — HardTech logo + wordmark "HardTech" / "IT CORP." (larger,
  standalone styling vs. the sticky header) and tagline "Professional IT training for tomorrow's
  tech leaders." Footer content below this line was not captured in this batch.

---

## Screenshot 1 — 14:19:14 — `/help`, Admin role, scrolled mid-list

Role tab context not visible in-frame (scrolled past the role selector); inferred **Admin** from
content (join-request approval is an admin-only capability) and from screenshot 2/3 continuing the
same scroll to the site footer without a role switch in between.

Visible accordion cards:
- **"Approving Community Join Requests" / "Pag-approve ng mga Community Join Requests"** — OPEN.
  Globe icon. Stepper:
  1. "When a trainer or trainee requests to join a private community, you will get a notification
     in your bell icon (🔔)." / Filipino translation below.
  2. "Go to Forum → Communities tab, find the community, and open it. Scroll to "Pending Requests"
     to approve or deny members." / Filipino translation below.
- **"Checking Notifications" / "Pagtingin ng mga Notification"** — CLOSED (chevron right ›), bell
  icon, next card in the stack.

## Screenshot 2 — 14:19:18 — `/help`, Admin role

- **"Checking Notifications" / "Pagtingin ng mga Notification"** — now OPEN. Bell icon. Stepper:
  1. "Click the bell icon (🔔) at the top of the page. A panel will drop down showing all your
     recent notifications."
  2. "Click "Mark all read" to clear the red badge counter, or click a notification directly to go
     to the relevant page."
  3. "Click "Clear all" to remove all notifications from the panel. The system keeps your last 20
     notifications."
  (each with Filipino translation beneath)
- **"Still need help? · Kailangan pa ng tulong?"** card visible at the bottom of frame: "Visit our
  Contact page or ask your trainer directly." / Filipino translation, both with a green "Contact
  page" link.

## Screenshot 3 — 14:19:21 — `/help`, Admin role, page bottom

- Tail end of the "Still need help?" card (scrolled further, its content now above the sticky
  header, visible only as a peeking sliver: "pulang badge counter, o i-click ang isang...").
- Below it, a large empty/dark gap, then the **site footer** begins: HardTech logo + "HardTech" /
  "IT CORP." wordmark + tagline "Professional IT training for tomorrow's tech leaders." This is the
  bottom of the Admin role's help content.

## Screenshot 4 — 14:19:30 — `/help`, top of page, Trainer selected

Full hero block visible:
- Pill: "**?** User Guide · Gabay sa Gumagamit"
- H1: "**How to Use**" / "**HardTech IT Corp.**" (green)
- Subhead: "Step-by-step guide for every user role. In English and Filipino so everyone can follow
  along." / "Hakbang-hakbang na gabay para sa bawat uri ng gumagamit. Sa Ingles at Filipino."
- Label: "SELECT YOUR ROLE · PILIIN ANG IYONG PAPEL"
- Role cards: **Admin** (Shield, unselected) + **Trainer** (Layers icon, **selected** — amber glow
  border, amber label "Trainer" / "Guro / Tagasanay") on row 1; **Trainee** (GraduationCap,
  unselected) alone on row 2, centered.
- Start of Trainer description card (amber-tinted): "You teach trainees, schedule sessions on the
  calendar, manage modules & assignments, and evaluate trainee performance." (cut off, Filipino
  translation continues in next screenshot).

## Screenshot 5 — 14:19:35 — `/help`, Trainer role

- End of Trainer description: Filipino translation "Ikaw ang nagtuturo sa mga trainee..." then
  centered **"8 sections · 8 seksyon"** in amber.
- Tip callout: "Tip: Click any section below to expand it." / "Payo: I-click ang anumang seksyon
  sa ibaba para palawakin ito."
- **"How to Log In" / "Paano Mag-Login"** accordion — OPEN. Icon: login arrow-into-bracket. Stepper
  (partial):
  1. "Go to the website and click "Login" at the top-right of the navigation bar."
  2. "Enter your Trainer email and password, then click "Sign In"."
  3. "Click your name at the top-right, then..." (cut off, continues next screenshot)

## Screenshot 6 — 14:19:39 — `/help`, Trainer role

- "How to Log In" full stepper (steps 1-3):
  3. "Click your name at the top-right, then click "Trainer Dashboard" to open your workspace."
- **"Your Dashboard Overview" / "Ang Iyong Dashboard Overview"** — CLOSED (chevron ›), grid icon,
  next in stack.

## Screenshot 7 — 14:19:45 — `/help`, Trainer role

- **"Your Dashboard Overview"** — OPEN. Grid/layout icon. Stepper:
  1. "The Overview tab shows your key stats: Assigned Trainees, Upcoming Sessions, Modules
     Uploaded, and Evaluations submitted."
  2. "The "Upcoming Sessions" list shows your next 4 scheduled events with their time, title, room,
     and session type badge."
  3. "Use the left sidebar to switch between: Overview, Calendar, My Trainees, Assignments, and
     Modules."
  (each with Filipino translation)

## Screenshot 8 — 14:19:50 — `/help`, Trainer role

- **"Managing Your Calendar" / "Pamamahala ng Iyong Calendar"** — OPEN. Calendar icon. Stepper:
  1. "Click "Calendar" in the sidebar. You will see a full monthly calendar view of all your
     scheduled sessions."
  2. "Click any date or the "Add Session" button to schedule a new session. Fill in the title,
     time, type (Lecture / Hands-on / Workshop / Assessment), and room number."
  3. "Session types are color-coded on the calendar: Lecture (grey), Hands-on (green), Workshop
     (blue), Assessment (yellow)."
  4. "Use the arrow buttons (◄ ►) to navigate..." (cut off)

## Screenshot 9 — 14:19:54 — `/help`, Trainer role

- "Managing Your Calendar" stepper continued:
  4. "Use the arrow buttons (◄ ►) to navigate between months. A "Sessions This Month" panel on the
     right lists all events."
  5. "To remove a session, click the trash icon (🗑️) in the session list on the right side."
- **"Viewing & Evaluating Your Trainees" / "Pagtingin at Pag-evaluate ng Iyong mga Trainees"** —
  CLOSED, people icon, next in stack.

## Screenshot 10 — 14:20:00 — `/help`, Trainer role

- **"Viewing & Evaluating Your Trainees"** — OPEN. People icon. Stepper (partial):
  1. "Click "My Trainees" in the sidebar to see all trainees assigned to you."
  2. "Each trainee card shows their name, progress bar, program, payment status (Paid badge), and
     current evaluation badge."
  3. "To evaluate a trainee: Click "Evaluate" on their card. Enter a skill name, select a rating
     (Certified / Competent / Needs Improvement), add notes, then click "Submit Evaluation"."
     (cut off)

## Screenshot 11 — 14:20:05 — `/help`, Trainer role

- "Viewing & Evaluating Your Trainees" stepper continued:
  4. "Ratings automatically update the trainee's badge: Certified (🟢) = high performance,
     Competent (🟡) = mid-level, Needs Improvement (🔴) = below standard."
  5. "You can click "Undo Evaluation" to revert a completed evaluation if you need to make
     corrections."
- **"Uploading Learning Modules" / "Pag-upload ng mga Learning Module"** — CLOSED, upload icon,
  next in stack.

## Screenshot 12 — 14:20:10 — `/help`, Trainer role

- **"Uploading Learning Modules"** — OPEN. Upload icon. Stepper:
  1. "Click "Modules" in the sidebar. Here you can see and manage all learning materials for your
     program."
  2. "Fill in the module title, choose the file type (PDF, MP4, or DOCX), set the unit number, and
     click "Upload Module"."
  3. "Uploaded modules are immediately visible to all your trainees in their "Materials" section
     (once their payment is verified)."
  4. "To remove a module, click the trash icon (🗑️) beside it."

## Screenshot 13 — 14:20:13 — `/help`, Trainer role

- Tail of "Uploading Learning Modules" steps 3-4 (repeat of above, scrolled).
- **"Creating & Managing Assignments" / "Paglikha at Pamamahala ng mga Assignment"** — CLOSED,
  clipboard icon.
- **"Joining a Community" / "Pagsali sa isang Community"** — CLOSED, globe icon, peeking at bottom.

## Screenshot 14 — 14:20:18 — `/help`, Trainer role

- **"Creating & Managing Assignments"** — OPEN. Clipboard icon. Stepper:
  1. "Click "Assignments" in the sidebar. You will see a list of all assignments you have created."
  2. "Click "New Assignment". Enter the title, description, due date and time, and optionally link
     a calendar event. Then click "Post Assignment"."
  3. "Click "View Submissions" on any assignment to see which trainees have submitted and their
     uploaded file links."
  4. "To delete an assignment, click the trash..." (cut off)

## Screenshot 15 — 14:20:21 — `/help`, Trainer role

- "Creating & Managing Assignments" stepper continued:
  4. "To delete an assignment, click the trash icon (🗑️) next to it."
- **"Joining a Community"** — CLOSED, globe icon.
- **"Moderating a Community" / "Pag-moderate ng isang Community"** — CLOSED, shield-check icon,
  peeking at bottom.

## Screenshot 16 — 14:20:25 — `/help`, Trainer role

- **"Joining a Community"** — OPEN. Globe icon. Stepper:
  1. "Click "Forum" in the navigation bar, then switch to the "Communities" tab."
  2. "Browse or search for communities by name, topic, or region. Click on a community card to
     view its details and members."
  3. "Click "Join Community". If it is a public community, you join instantly. If private, your
     request will be sent to the admin for approval."
- **"Moderating a Community"** — CLOSED, shield-check icon, next in stack.

## Screenshot 17 — 14:20:31 — `/help`, Trainer role

- **"Moderating a Community"** — OPEN. Shield-check icon. Stepper (partial):
  1. "If an admin grants you the Moderator role in a community, a gold shield badge appears next to
     the community name and new moderation controls become available."
  2. "For each pending post, you can click "Approve" to publish it or "Reject" to decline. Approved
     posts immediately become visible to all members."
  3. "Click the Pin button on any post to keep it at the top of the community feed. Click Unpin to
     remove the pin."

## Screenshot 18 — 14:20:37 — `/help`, Trainer role, end of list

- "Moderating a Community" stepper continued:
  4. "Click "Edit" on the About card or Rules card to update the community description or rule
     list. Changes are saved instantly and logged in the audit log."
  5. "Use the Members panel to add a new member by email, promote a member to moderator (gold
     shield icon), or remove a member from the community."
- **"Still need help? · Kailangan pa ng tulong?"** card begins at the bottom — this closes the
  Trainer role's 8-section list.

## Screenshot 19 — 14:20:46 — `/help`, top of page, Trainee selected

- Full hero block again (role switched): Admin unselected, Trainer unselected, **Trainee selected**
  (green glow border, green "Trainee" / "Mag-aaral" label, GraduationCap icon on tinted green bg).
- Start of Trainee description card (green-tinted): "You learn, download materials, submit
  assignments, track your progress, earn badges, and download your official E-Certificate." (cut
  off, continues next screenshot)

## Screenshot 20 — 14:20:49 — `/help`, Trainee role

- End of Trainee description, Filipino translation "Ikaw ang nag-aaral, nagda-download ng
  materials..." then centered **"14 sections · 14 seksyon"** in green.
- Tip callout (same as before).
- **"How to Log In" / "Paano Mag-Login"** — OPEN (Trainee-flavored copy, distinct from Trainer's).
  Login icon. Stepper (partial):
  1. "Go to the website. Click the "Login" button at the top-right corner."
  2. "Type your email and password. Click "Sign In" to enter." (cut off)

## Screenshot 21 — 14:20:53 — `/help`, Trainee role

- "How to Log In" full stepper:
  1. "Go to the website. Click the "Login" button at the top-right corner."
  2. "Type your email and password. Click "Sign In" to enter."
  3. "If you forgot your password, click "Forgot Password?" and follow the steps to reset it via
     email."
  4. "After logging in, click your name at the top-right, then click "Trainee Dashboard"."
- **"Your Dashboard at a Glance" / "Ang Iyong Dashboard sa Isang Sulyap"** — CLOSED, grid icon,
  peeking at bottom.

## Screenshot 22 — 14:20:57 — `/help`, Trainee role

- **"Your Dashboard at a Glance"** — OPEN. Grid icon. Stepper (partial):
  1. "The dashboard overview shows your current badge, training progress %, enrolled program, and
     upcoming session schedule."
  2. "Active trainees see these sidebar tabs: My Dashboard, Session Schedule, Assignments, Enrolled
     Programs, Materials, and Credentials."
  3. "If you have already graduated, your sidebar simplifies to: My Dashboard and Credentials. You
     can re-enroll in a new program from the dashboard." (cut off)

## Screenshot 23 — 14:21:00 — `/help`, Trainee role

- "Your Dashboard at a Glance" stepper continued:
  3. (full) "...You can re-enroll in a new program from the dashboard."
  4. "Your progress bar shows how far along you are in your training. 100% means you have completed
     all modules."
- Closed accordion queue below: **"Checking Your Enrolled Program"** (open-book icon),
  **"Viewing Your Session Schedule"** (calendar icon), **"Downloading Learning Materials"**
  (document icon) — all CLOSED.

## Screenshot 24 — 14:21:04 — `/help`, Trainee role

- **"Checking Your Enrolled Program" / "Pagtingin sa Iyong Enrolled Program"** — OPEN. Open-book
  icon. Stepper:
  1. "Click "Enrolled Programs" in the sidebar. You will see your current program, trainer name,
     batch, and payment status."
  2. "The program card shows: Program name, Trainer, Batch, Start date, Sessions count, Materials
     count, and your completion percentage."
  3. "If you see "Payment Pending", the Admin has not yet confirmed your payment. Wait for the
     approval notification."

## Screenshot 25 — 14:21:09 — `/help`, Trainee role

- **"Viewing Your Session Schedule" / "Pagtingin sa Iyong Session Schedule"** — OPEN. Calendar icon.
  Stepper (partial):
  1. "Click "Session Schedule" in the sidebar. A calendar will appear showing all your training
     sessions."
  2. "Colored dots on the calendar show which days have sessions. Click a date to see the full
     session details (time, title, trainer, room, type)."
  3. "Session types are color-coded: Green = Hands-on, Blue = Workshop, Yellow = Assessment, Grey =
     Lecture." (cut off)

## Screenshot 26 — 14:21:13 — `/help`, Trainee role

- "Viewing Your Session Schedule" stepper continued:
  3. (full) "Session types are color-coded: Green = Hands-on, Blue = Workshop, Yellow = Assessment,
     Grey = Lecture."
  4. "Use the "Today (PH)" button to jump back to the current date. Use the ◄ ► arrows to navigate
     months."
- **"Downloading Learning Materials"** peeking at bottom, still CLOSED.

## Screenshot 27 — 14:21:17 — `/help`, Trainee role

- **"Downloading Learning Materials" / "Pag-download ng mga Learning Materials"** — OPEN. Document
  icon. Stepper (partial):
  1. "Click "Materials" in the sidebar. You will see all the modules and files your trainer
     uploaded for your program."
  2. "Materials are locked (🔒) until your payment has been verified by the Admin. Once verified,
     all materials will unlock automatically."
  3. "Click the download icon (↓) beside any unlocked module to save it to your device. Materials
     are organized by unit number — start from Unit 1." (cut off)

## Screenshot 28 — 14:21:21 — `/help`, Trainee role

- "Downloading Learning Materials" stepper continued:
  3. (full, as above)
  4. "Supported file types: PDF (document), MP4 (video), and DOCX (Word document). The file type
     icon on each card shows what format it is."
- **"Submitting Assignments"** (clipboard icon) and **"Your Badges & Credentials"** (medal icon)
  CLOSED below.

## Screenshot 29 — 14:21:25 — `/help`, Trainee role

- **"Submitting Assignments" / "Pagsumite ng mga Assignment"** — OPEN. Clipboard icon. Stepper
  (partial):
  1. "Click "Assignments" in the sidebar to see all assignments from your trainer."
  2. "Each assignment card shows the title, description, due date and time, and your submission
     status."
  3. "To submit: Click "Submit" on the assignment, paste your Google Drive link (or file link) in
     the text box, then click "Submit Assignment"." (cut off)

## Screenshot 30 — 14:21:29 — `/help`, Trainee role

- "Submitting Assignments" stepper continued:
  3. (full, as above)
  4. "Once submitted, you will see a green "Submitted" badge on the assignment card. You can
     re-submit to update your answer before the deadline."
- **"Your Badges & Credentials"** (medal icon) and **"Downloading Your E-Certificate"** (scroll
  icon) CLOSED below.

## Screenshot 31 — 14:21:35 — `/help`, Trainee role

- **"Your Badges & Credentials" / "Ang Iyong mga Badge at Credentials"** — OPEN. Medal/ribbon icon.
  Stepper (partial):
  1. "Click "Credentials" in the sidebar. This page has three sections: Verified Trainee Badge,
     Trained Graduate Badge, and Official E-Certificate."
  2. ""Verified Trainee" badge (🛡️) unlocks once your payment is confirmed by the Admin. It proves
     you are an officially enrolled trainee."
  3. ""Trained Graduate" badge (🎓) unlocks when your trainer marks you as fully evaluated. It shows
     your completion badge: Certified (🟢), Competent (🟡), or Needs Improvement (🔴)." (cut off)

## Screenshot 32 — 14:21:40 — `/help`, Trainee role

- "Your Badges & Credentials" stepper continued:
  3. (full, as above)
  4. "The "Official E-Certificate" section shows your unique Certificate ID (e.g. HT-2026-A-T001),
     issued program, batch, and trainer."
  5. "The certificate is locked until your training is complete. Once unlocked, click "Download
     Certificate" to preview it."
- **"Downloading Your E-Certificate"** (scroll icon) CLOSED below.

## Screenshot 33 — 14:21:45 — `/help`, Trainee role

- **"Downloading Your E-Certificate" / "Pag-download ng Iyong E-Certificate"** — OPEN. Scroll/
  certificate icon. Stepper (partial):
  1. "Go to Credentials in the sidebar, then scroll to the "Official E-Certificate" section. Click
     "Download Certificate" to open the preview."
  2. "A full-screen preview modal will appear showing your complete A4 landscape certificate with
     your name, program, trainer signature, and official seal."
  3. "In the preview modal, click "Print / Save PDF" at the top. Your browser's print dialog will
     open — choose "Save as PDF" as the destination to save a digital copy." (cut off)

## Screenshot 34 — 14:21:49 — `/help`, Trainee role

- "Downloading Your E-Certificate" stepper continued:
  3. (full, as above)
  4. "The certificate includes your full name, program title, completion date, trainer name,
     Certificate ID, and the HardTech IT Corp official logo and SEC registration."
  5. "Click the X button (top-left of the modal) or press Escape to close the preview without
     printing."
- **"Re-Enrolling in a New Program"** (refresh/circular-arrows icon) CLOSED, peeking at bottom.

## Screenshot 35 — 14:21:54 — `/help`, Trainee role, batch ends

- **"Re-Enrolling in a New Program" / "Pag-re-enroll sa Bagong Program"** — OPEN. Refresh icon.
  Stepper:
  1. "After graduating, you will see a "Browse Programs" button on your dashboard. Click it to see
     other available programs."
  2. "Program cards show the title, trainer, price, and available slots. Click "Enroll" on any
     program you wish to join."
  3. "The re-enrollment process is the same as the first enrollment: select payment method, upload
     proof of payment, then wait for Admin approval."
- Batch cuts off here. Trainee role has **14 sections total**; only 9 have been seen
  (How to Log In, Your Dashboard at a Glance, Checking Your Enrolled Program, Viewing Your Session
  Schedule, Downloading Learning Materials, Submitting Assignments, Your Badges & Credentials,
  Downloading Your E-Certificate, Re-Enrolling in a New Program). The remaining 5 sections and the
  Trainee "Still need help?" card are not in this batch — expect them at the start of the next
  batch (mobile-04).

---

## Flows observed

1. **Role-tab switch on `/help`**: user taps a role pill (Admin → Trainer → Trainee) at the top of
   the page. The accordion list below is fully replaced with that role's sections, the section
   count updates ("8 sections" for Trainer, "14 sections" for Trainee), and the accent color
   changes (amber for Trainer, green for Trainee). Each switch is preceded by the user scrolling
   back to the top of the page before tapping the new role pill (see screenshots 3→4 and 18→19).
2. **Sequential accordion drill-down**: within a role, the user opens each section top-to-bottom,
   reads its full numbered stepper, then closes/scrolls to the next one — never two sections open
   at once in this batch (looks like a single-open accordion behavior, though it could also just be
   the user's own scroll/tap habit — see Open Questions).
3. **End-of-role footer**: after the last section of a role's list, a "Still need help?" card
   appears, linking to `/contact`, before the global site footer.

## Mobile layout rules

- Single-column, full-bleed vertical stack; no side rails at all on mobile (desktop's forum
  left/right rails are not applicable here since `/help` has no desktop-rail equivalent in this
  batch — need to confirm against desktop screenshots for other routes).
- App header (logo + hamburger) is pinned/sticky at a fixed vertical position while page content
  scrolls behind/underneath it — confirmed by multiple screenshots showing a sliver of the
  previous section's text peeking out just above the header card.
- Hamburger (☰) icon implies primary nav collapses into a Sheet/Drawer on mobile (project depends
  on `vaul`), not a hamburger dropdown — not opened in this batch, so its contents are unconfirmed.
- Role selector is a wrapping flex row, 2 cards per row, and the odd (3rd) card centers itself on
  its own row rather than left-aligning — treat as `flex flex-wrap justify-center` with fixed card
  widths, not a strict `grid-cols-2`.
- All body copy doubles as English-then-Filipino paired lines; the Filipino line is always smaller
  and lower-contrast (muted gray) than its English counterpart — build as a single component that
  takes `{en, fil}` rather than hard-coding one language.
- Accordion sections are visually separate rounded cards with gaps between them (not a single
  hairline-divided shadcn Accordion) — implement as a list of independently-collapsible Cards.
  Numbered steps inside are a custom vertical stepper/timeline (numbered circle + connecting line),
  not a plain shadcn component.
- No bottom tab bar, no FAB, and no horizontal scrollers appear anywhere in this batch — `/help` is
  a pure vertical scroll page.

## Open questions

- Admin role's accent/glow color was never directly observed (only Trainer=amber and
  Trainee=green were seen with the role selector visible) — need a desktop or other-batch
  screenshot showing Admin selected in the pill to confirm its highlight color.
  Admin's own "N sections · N seksyon" count and full section list are only partially seen
  (2 of presumably more sections: "Approving Community Join Requests", "Checking Notifications").
  The rest of Admin's `/help` content is not in this batch.
- Whether the accordion is single-open (auto-closes previous section) or multi-open (independent
  toggles) could not be confirmed — the user always scrolled and opened sections in strict linear
  order, never revealing two distinct open sections with a closed one skipped in between.
- The hamburger menu's Sheet/Drawer contents (nav links, role indicator, sign-in/out) are unseen in
  this batch.
- The full site footer (below the tagline line) is cut off — only the very top of it
  (logo + wordmark + tagline) is visible before the screenshot series scrolls back to the top of
  the page.
- Trainee's 5 remaining sections (of 14) and its "Still need help?" card were not captured in this
  batch's range — flag for whoever processes the next batch (mobile-04) to pick up the continuation
  cleanly.
- The exact rendered hex/token for "amber" (Trainer accent) was not cross-checked against the
  design source doc's `--accent-orange` (`#f59e0b` light / `#fbbf24` dark) — visually consistent
  with it, but worth confirming against the live site.
