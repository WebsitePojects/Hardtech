# Mobile Screenshot Spec — Batch 02 (items 36–70)

Source folder: `D:\Win10_UserData\Downloads\Hardtech\Mobile\*.jpg`
All 35 screenshots in this slice are named `Screenshot_20260728_HHMMSS_Messenger.jpg` (one, the last,
is `..._Samsung capture.jpg`). They were captured **inside the Facebook Messenger in-app browser**,
not a bare mobile Chrome/Safari tab. Every screenshot therefore carries non-app chrome at the very
top: a phone status bar (time, Messenger/notification icons, signal/battery) and a dark address bar
with a padlock, the URL `slot-pear-69660733.figma.site`, an `✕` close button, a `···` overflow menu,
and the caption "Messenger" underneath the URL. **None of that top strip is app UI** — treat it as
capture noise and do not reproduce it. The real app UI starts at the floating glass navbar
(logo + hamburger) seen in every shot.

Device appears to be a ~1080×2340 Android phone (5G, ~50% battery), portrait only.

## Summary

| Timestamp | Route | Section |
|---|---|---|
| 141620 | `/` | Programs — tail of a hardware-repair program card (checklist + trainer + CTAs), then start of "I.T. Software Development" card |
| 141624 | `/` | Programs — "I.T. Software Development" card: description, stat grid, course modules (top) |
| 141633 | `/` | Programs — "I.T. Software Development" card: course modules (rest), trainer card, CTAs; footer begins |
| 141637 | `/` | Footer (full) |
| 141644 | `/contact` | Hero ("Get in Touch & Find Us") + Call Us card |
| 141648 | `/contact` | Email Us, Main Office, Branch Office contact cards |
| 141651 | `/contact` | "Visit Us In Person" — Main Office map + details |
| 141655 | `/contact` | Branch Office map + details |
| 141659 | `/contact` | FAQ — all 4 questions collapsed |
| 141703 | `/contact` | FAQ — Q3 "certificates recognized" expanded |
| 141705 | `/contact` | FAQ — Q4 "job placement" expanded |
| 141708 | `/contact` | FAQ — Q2 "payment methods" expanded |
| 141711 | `/contact` | FAQ — Q1 "how do I enroll" expanded |
| 141724 | `/help` | Header, bilingual intro, role selector (Admin selected), role description (top) |
| 141735 | `/help` | Role description (rest), "14 sections" tag, Tip callout, Section 1 "How to Log In" opens |
| 141738 | `/help` | Section 1 (rest) + Sections 2–3 collapsed |
| 141744 | `/help` | Section 2 "Understanding Your Dashboard" expanded (top) |
| 141748 | `/help` | Section 2 (rest) + Section 3 collapsed reappears |
| 141752 | `/help` | Section 3 "Approving Enrollments & Payments" expanded (top) |
| 141757 | `/help` | Section 3 (rest) + Section 4 collapsed |
| 141803 | `/help` | Section 4 "Managing Users" expanded (top) |
| 141806 | `/help` | Section 4 (rest) + Section 5 collapsed |
| 141811 | `/help` | Section 5 "Approving Certificate Requests" expanded |
| 141815 | `/help` | Section 5 (rest) + Sections 6–10 collapsed list |
| 141819 | `/help` | Section 6 "Posting Announcements" expanded |
| 141823 | `/help` | Section 7 "Viewing Analytics & Reports" expanded |
| 141833 | `/help` | Section 8 "Setting Up Payment Methods" expanded (top) |
| 141836 | `/help` | Section 8 (rest) + Section 9 collapsed |
| 141840 | `/help` | Section 9 "Checking the Audit Log" expanded |
| 141844 | `/help` | Section 10 "Managing Trainer Status & Revocation" expanded (top) |
| 141848 | `/help` | Section 10 (rest) + Sections 11–12 collapsed |
| 141852 | `/help` | Section 11 "Monitoring the Forum Leaderboard" expanded (top) |
| 141856 | `/help` | Section 11 (rest) + Sections 12–13 collapsed |
| 141901 | `/help` | Section 12 "Approving Forum Posts" expanded + Section 13 collapsed |
| 141907 | `/help` | Same scroll position as 141901, captured via Android "Samsung capture" tool; text-selection tooltip overlay visible |

---

## 141620 — `/` Programs section (card boundary)

Route: Home (`/`). Scroll position: mid-page, inside the Programs list, crossing from one program
card into the next.

Visible content, top to bottom:
- Faint, partially scrolled-under text: a green checkmark bullet "Display & Touch Panel Replacement"
  (bleeding through/behind the sticky navbar — z-index shows navbar is translucent glass, content
  scrolls underneath it).
- **Floating glass navbar** (sticky, pill/rounded-2xl card, dark translucent bg): left = square logo
  mark (green circuit/diamond icon) + wordmark "HardTech" (bold white) / "IT CORP." (green, small
  caps, tracked); right = a squarish icon button containing a hamburger icon (☰). This is the entire
  mobile header — no visible text nav links, no search, no login button at this scroll position.
- Below the navbar, more checklist items bleeding through from the card above the fold:
  - ✓ Software Flashing & Unlocking
  - ✓ Business Operations & Pricing
- **Trainer card** (rounded rectangle, dark card bg, subtle border): square dark-green icon tile with
  a person/user glyph, then:
  - "**Mr. Henry Gomata Lopez**" (bold white)
  - "Owner & Lead Trainer · 20+ yrs Mobile Servicing" (muted gray, smaller)
- **CTA row** (two buttons side by side, not stacked):
  - Primary: solid neon-green pill button "**Enroll Now →**" (right-arrow icon)
  - Secondary: outline/ghost pill button "**Inquire**" (border only, no fill)
- New card begins: a photo (two technicians at a workbench with monitors/microscopes, a banner
  reading "HARDTECH ... ADVANCE BOARD - LEVEL ANDROID & APPLE SPECIALIST TRAINING" visible behind
  them) with an overlay badge top-left: "**INDUSTRY CERT**" (green pill, translucent dark bg).
- Below the photo, cut off at the very bottom: heading start "I.T. Software" (continues next shot).

State: default/static, no modal, no loading.

## 141624 — `/` Programs — "I.T. Software Development" card

Route: Home (`/`). Same sticky navbar as above.

- Small icon chip (rounded square, dark bg, green `< >` code-brackets glyph) sits to the left of the
  heading.
- **H3**: "**I.T. Software Development**" (bold, white/light, large — 2 lines)
- **Subheading** (green): "Build Real-World Applications"
- **Body copy** (muted gray): "A comprehensive software development training covering web
  development, programming fundamentals, database management, and modern frameworks. Build a
  portfolio of real-world projects you can show to employers."
- **Stat grid — 2×2 columns (NOT stacked to 1 column on mobile)**, each cell a small dark rounded
  card with a tiny icon + all-caps muted label + bold white value:
  - 🕐 "DURATION" → "**6 Months (160 hrs)**"
  - 📅 "SCHEDULE" → "**Mon–Sat | 8AM–12PM**"
  - ⚡ "LEVEL" → "**Beginner to Advanced**"
  - 💲 "INVESTMENT" → "**₱5,000**"
- **"COURSE MODULES"** heading (green, uppercase, letter-spaced, small)
- Checklist (green circle-check icon + white text), each on its own line:
  - Programming Fundamentals (Python & JS)
  - HTML, CSS & Responsive Web Design
  - React & Modern Frontend Frameworks
  - Node.js & Backend Development
  - Database Design (SQL & NoSQL)
  - (cut off, continues next shot)

## 141633 — `/` Programs card cont'd + Footer begins

- Course modules list finishes with a 6th item: "Portfolio Project & Career Coaching".
- **Trainer card**: person-icon tile + "**Prof. Adelan P. Sistoso**" / "EDPSE · LPT · MAEd | Owner,
  PRINCE IT Solutions".
- **CTA row**: "Enroll Now →" (solid green) + "Inquire" (outline) — identical pattern to the previous
  card, confirming this is a repeating **Program Card** component: icon chip + H3 + green subheading
  + body + 2×2 stat grid + course-modules checklist + trainer card + CTA row.
- Large gap, then the Programs list ends and the **Footer** begins (only the top sliver — logo +
  "HardTech" wordmark — is visible before the shot cuts off).

## 141637 — `/` Footer (full)

Single dark section, full width, single-column stack (no multi-column footer on mobile):

- Logo block: icon + "**HardTech**" / "IT CORP." (green)
- Tagline: "Professional IT training for tomorrow's tech leaders."
- Button (outline, rounded pill, Facebook glyph icon): "**Follow on Facebook**"
- **"QUICK LINKS"** (green, uppercase, tracked) followed by a plain vertical list of text links:
  Home, About, Programs, Gallery, Contact
  *(Note: no Enroll, Help, Login, Forum, or Communities links in this footer list.)*
- **"CONTACT"** (green, uppercase, tracked) followed by icon + text rows:
  - 📍 673 Quirino Highway, Novaliches, QC
  - 📞 (123) 456-7890
  - ✉️ hardtechitcorp@gmail.com
- Divider line, then centered small-print: "© 2026 HardTech IT Corp. All rights reserved. ·
  Powered by **Prince IT Solutions**" (the company name in bold green).

## 141644 — `/contact` Hero + Call Us card

Route: Contact (`/contact`). Same floating glass navbar at top (logo + hamburger).

- Badge/pill (outline, green diamond bullet): "**◆ CONTACT & LOCATION**"
- **H1** (large, two-tone): "Get in Touch & **Find Us**" (white + green, wraps to 2 lines)
- Body copy (muted): "Have questions about our programs? Visit us at either of our two locations or
  reach out through any of our contact channels."
- Divider line.
- **Card**: green phone icon (in rounded square tile) → "**Call Us**" (bold) → "**(123) 456-7890**"
  (green, bold) → "Mon–Fri 9AM–5PM" (muted, small).
- Next card begins (envelope icon peeking at very bottom).

## 141648 — `/contact` Contact cards

Continues scrolling; the Call Us card's last line ("Mon–Fri 9:00 AM – 5:00 PM") is bleeding under
the sticky navbar.

- **Card**: envelope icon → "**Email Us**" → "**hardtechitcorp@gmail.com**" (green) → "Reply within
  24hrs" (muted).
- **Card**: building icon → "**Main Office**" → "**673 Quirino Hwy**" (green) → "Novaliches, Quezon
  City" (muted).
- **Card**: map-pin icon → "**Branch Office**" → "**Batasan Rd, QC**" (green) → "Quezon City, Metro
  Manila" (muted).
- Badge "◆ OUR OFFICES" begins to peek at the very bottom.

All four cards share one component: icon tile (top) → bold title → green highlighted value → muted
caption, stacked full-width, one per row (single column on mobile).

## 141651 — `/contact` "Visit Us In Person" — Main Office map

- Badge: "◆ OUR OFFICES"
- **H2**: "Visit Us **In Person**" (white + green)
- **Card** containing an embedded **Google Maps** screenshot/iframe (dark map theme, red pin drop on
  "Novaliches Proper"):
  - Overlay chip top-left: "**Open in Maps ⤢**" (external-link icon, looks tappable/clickable, dark
    translucent pill)
  - Overlay badge bottom-left, over the map image: "**MAIN OFFICE**" (green outline pill)
  - Standard Google attribution row under the map ("Google", "Keyboard shortcuts", "Map data ©2026",
    "Terms") — this is native Google Maps embed chrome, not custom UI.
  - Below the map, icon + text detail rows:
    - 📍 673 Quirino Highway, Novaliches, Quezon City, Metro Manila
    - 📞 (123) 456-7890
    - ✉️ hardtechitcorp@gmail.com
    - 🕐 Mon–Fri 9:00 AM – 5:00 PM
  - **Button** (full-width, solid green, arrow/navigation icon): "**➤ Get Directions**"

## 141655 — `/contact` Branch Office map

Same card pattern repeated for the second location:

- Map embed centered on "Batasan Rd" with red pin.
- "Open in Maps ⤢" chip, "**BRANCH OFFICE**" badge overlay.
- Detail rows:
  - 📍 M3QV+MM5, Batasan Rd, Quezon City, Metro Manila
  - 📞 (0987) 654-3210
  - ✉️ hardtechitcorp@gmail.com
  - 🕐 Mon–Fri 9:00 AM – 5:00 PM
- **Button** (full-width, solid green): "**Get Directions**"

## 141659 — `/contact` FAQ — all collapsed (default state)

- Badge: "◆ FAQ"
- **H2**: "Frequently Asked **Questions**" (white + green)
- **Accordion** (4 items, all default/collapsed, chevron-down `⌄` icon at right of each row):
  1. "How do I enroll in a program?"
  2. "What payment methods do you accept?"
  3. "Are the certificates recognized by employers?"
  4. "Do you offer job placement assistance?"

Each item is a full-width rounded card row with the question in white text and a chevron icon on
the right — standard shadcn `Accordion`/`AccordionItem` mobile styling, one card per item (not a
borderless list).

## 141703 — `/contact` FAQ — Q3 expanded

Interactive state: **Q3 "Are the certificates recognized by employers?" is expanded** (chevron flips
to `⌃` up), all others remain collapsed (confirms **single-expand accordion**, not multi-open).

Revealed answer (below a thin divider line inside the same card):
> "Our certificates are skills-based credentials issued by HardTech IT Corp, not a government
> accreditation. They document the hands-on competencies you mastered during the program, include
> QR verification, and pair best with a portfolio of work you complete in class — which is what
> employers in mobile, desktop, and other servicing roles look at most."

## 141705 — `/contact` FAQ — Q4 expanded

Q3 has re-collapsed; **Q4 "Do you offer job placement assistance?" is now expanded**:
> "Most of our graduates choose to open their own mobile, desktop, or electronics servicing business
> rather than seek employment. We support that path with business-starter guidance — tooling
> checklists, pricing advice, supplier intros, and ongoing alumni mentorship from our master
> trainers."

## 141708 — `/contact` FAQ — Q2 expanded

**Q2 "What payment methods do you accept?" expanded**:
> "We accept GCash, Maya, credit/debit cards, and bank transfers. We also offer installment payment
> plans for eligible enrollees. Contact our admissions office for details on financing options."

Q3 and Q4 both show collapsed underneath.

## 141711 — `/contact` FAQ — Q1 expanded

**Q1 "How do I enroll in a program?" expanded** (the remaining three collapsed):
> "You can enroll online through our website by clicking "Enroll Now" and filling out the
> registration form. You may also visit any of our campuses in person. Our admissions team will
> guide you through the process."

This completes one full cycle of the tester opening every FAQ item in turn (Q3→Q4→Q2→Q1), confirming
the accordion always shows exactly one open panel at a time.

## 141724 — `/help` Header + role selector

Route: Help Center (`/help`). Same floating navbar.

- Badge (green, question-mark-circle icon): "**? User Guide · Gabay sa Gumagamit**"
- **H1**: "How to Use **HardTech IT Corp.**" (white + green, 2 lines)
- Body, English: "Step-by-step guide for every user role. In English and Filipino so everyone can
  follow along."
- Body, Filipino (muted, smaller, directly below — bilingual pairing pattern used throughout this
  page): "Hakbang-hakbang na gabay para sa bawat uri ng gumagamit. Sa Ingles at Filipino."
- Label (muted, uppercase, centered): "SELECT YOUR ROLE · PILIIN ANG IYONG PAPEL"
- **Role selector — asymmetric grid**: Admin and Trainer share a 2-column row; Trainee sits alone,
  centered, on the row below (2-up-then-1 layout, not a straight 3-column grid and not a vertical
  stack):
  - **Admin / Tagapamahala** — shield icon, **selected state**: blue rounded border + blue glow ring,
    icon tile tinted blue, label text in blue (this is the one departure from the site's green
    accent — the "selected/active" indicator uses `--accent-blue`, not neon green).
  - **Trainer / Guro / Tagasanay** — stacked-layers icon, unselected: neutral dark tile, gray text,
    thin neutral border.
  - **Trainee / Mag-aaral** — graduation-cap icon, unselected, same neutral styling, full-width card
    centered below the row.
- Role description card begins: "You manage the entire platform — enrollments, payments, users,
  certificates, announcements, analytics, and the audit log." (English bold) with Filipino
  translation starting below it (cut off at bottom of shot).

## 141735 — `/help` Role description + Tip + Section 1 opens

- Filipino translation completes: "Ikaw ang namamahala sa buong platform — mga enrollment, bayad,
  users, certificates, anunsyo, analytics, at audit log."
- Small link-styled text, centered: "**14 sections · 14 seksyon**" (blue).
- **Callout card** (info-circle icon, blue-tinted): "**Tip: Click any section below to expand it.**"
  / "Payo: I-click ang anumang seksyon sa ibaba para palawakin ito." (bilingual pair again).
- **Accordion Section 1 — "How to Log In" / "Paano Mag-Login"** (icon: door-with-arrow, green tile),
  shown **expanded** (chevron up):
  - Numbered **vertical timeline/stepper**: each step is a green circled number (1, 2, 3…) connected
    by a vertical line down the left edge, with bold white English instruction text followed
    immediately by smaller muted-gray Filipino translation directly beneath it. This
    numbered-timeline-with-bilingual-pairs pattern repeats for every section on this page.
  - Step 1: "Go to the website and click the "Login" button at the top-right corner of the
    navigation bar." / "Pumunta sa website at i-click ang "Login" na button sa kanang sulok sa itaas
    ng navigation bar."
  - Step 2 begins (continues next shot).

## 141738 — `/help` Section 1 rest + Sections 2–3 collapsed

- Step 2: "Enter your Admin email address and password, then click "Sign In"." / "Ilagay ang iyong
  Admin email address at password, pagkatapos i-click ang "Sign In"."
- Step 3: "After logging in, click on your name (top-right) then click "Admin Dashboard" to go to
  your control panel." / "Pagkatapos mag-login, i-click ang iyong pangalan (kanang sulok sa itaas)
  tapos i-click ang "Admin Dashboard" para pumunta sa iyong control panel."
- **Section 2 — "Understanding Your Dashboard" / "Pag-unawa sa Iyong Dashboard"** (icon: 2×2 grid
  squares) — collapsed, chevron pointing right `›`.
- **Section 3 — "Approving Enrollments & Payments" / "Pag-approve ng mga Enrollment at Bayad"**
  (icon: receipt/peso), collapsed, chevron `›`.

Note: collapsed accordion rows use a right-pointing chevron `›` inside a circular gray button,
whereas the *currently open* row uses a down/up chevron `⌄`/`⌃` — two distinct chevron treatments
for expanded vs. collapsed-and-inactive state.

## 141744 — `/help` Section 2 expanded (top)

**Section 2 "Understanding Your Dashboard" expanded**, Section 1 now collapsed above (scrolled out
of view):
- Step 1: "The Overview section shows live statistics: total users, pending enrollments,
  month-to-date revenue, and certificate requests." / Filipino equivalent.
- Step 2: "Use the sidebar (left panel) to navigate between 8 sections: Overview, Enrollments, User
  Management, Certificates, Announcements, Analytics, Payment Methods, and Audit Log." / Filipino.
- Step 3 begins: "The revenue area chart shows 6-month trends. The pie chart shows how trainees are
  distributed across programs (Computer Hardware, Cellphone Repair, Software Dev)." (cut off)

## 141748 — `/help` Section 2 rest + Section 3 reappears

- Step 3 Filipino translation completes.
- Step 4: "Use the Quick Action cards on the Overview to jump directly to: Manage Users, Approve
  Enrollments, Approve Certificates, and Audit Log." / Filipino.
- Section 3 "Approving Enrollments & Payments" reappears collapsed at bottom.

## 141752 — `/help` Section 3 expanded (top)

**Section 3 "Approving Enrollments & Payments" expanded**:
- Step 1: "Go to "Enrollments" in the sidebar. You will see all pending enrollment applications
  submitted by trainees." / Filipino.
- Step 2: "Each enrollment shows the trainee name, program, payment method (GCash, Maya, Bank
  Transfer, Card), amount, and payment proof image." / Filipino.
- Step 3: "Click the receipt thumbnail to open a full-screen preview of the payment proof image
  before approving." / Filipino.
- Step 4 begins (cut off).

## 141757 — `/help` Section 3 rest + Section 4 collapsed

- Step 4: "Click "Verify & Approve" to confirm the payment and activate the trainee's account. The
  trainee will receive a notification." / Filipino.
- Step 5: "Click "Reject" if the payment proof is invalid or missing. You can provide a reason for
  rejection." / Filipino.
- Step 6: "The stats bar at the top shows Total Verified Revenue, Pending Review, Missing Proof, and
  Approved counts at a glance." / Filipino.
- **Section 4 — "Managing Users (Trainees & Trainers)" / "Pamamahala ng mga Users"** (icon: two
  people) appears collapsed at the bottom.

## 141803 — `/help` Section 4 expanded (top)

**Section 4 "Managing Users (Trainees & Trainers)" expanded**:
- Step 1: "Go to "User Management" in the sidebar. You will see a list of all users — trainees and
  trainers." / Filipino.
- Step 2: "Use the search bar at the top to find a specific user by name or email." / Filipino.
- Step 3: "To activate a pending user: Find the user with "Pending" status and update their status to
  "Active" using the dropdown." / Filipino.
- Step 4 begins: "To suspend a user: Change their status to "Suspended" using the Status dropdown.
  They will no longer be able to access the platform." (cut off)

## 141806 — `/help` Section 4 rest + Section 5 collapsed

- Step 4 Filipino translation completes.
- Step 5: "You can change a user's role (Admin / Trainer / Trainee) or reassign their program using
  the dropdowns in their row." / Filipino.
- Step 6: "Filter users by Role (All, Admin, Trainee, Trainer) or search by name/email to quickly
  find who you need." / Filipino.
- **Section 5 — "Approving Certificate Requests" / "Pag-approve ng mga Certificate Request"** (icon:
  scroll/certificate) appears collapsed.

## 141811 — `/help` Section 5 expanded

**Section 5 "Approving Certificate Requests" expanded**:
- Step 1: "Go to "Certificates" in the sidebar. You will see a list of all trainee certificate
  requests." / Filipino.
- Step 2: "Each request shows the trainee name, program, trainer, and completion date." / Filipino.
- Step 3: "Click "Approve" to authorize the certificate. The trainee will be notified and can then
  download their official E-Certificate." / Filipino.
- Step 4 begins: "Click "Reject" if the trainee does not meet the requirements yet." (cut off)

## 141815 — `/help` Section 5 rest + Sections 6–10 collapsed list

- Step 4 Filipino translation completes.
- Collapsed accordion rows now stacked and visible together (confirms these five are next in
  sequence, all default-collapsed with `›` chevrons):
  - **Posting Announcements** / Pag-post ng mga Anunsyo (megaphone icon)
  - **Viewing Analytics & Reports** / Pagtingin ng Analytics at mga Ulat (trending-up icon)
  - **Setting Up Payment Methods** / Pag-setup ng mga Paraan ng Bayad (card icon)
  - **Checking the Audit Log** / Pagtingin ng Audit Log (clipboard-check icon)
  - **Managing Trainer Status & Revocation** / Pamamahala sa Status ng Trainer at Pag-bawi
    (person-with-gear icon)

## 141819 — `/help` Section 6 expanded

**Section 6 "Posting Announcements" expanded**:
- Step 1: "Go to "Announcements" in the sidebar. Here you can post important messages visible to all
  users on the landing page." / Filipino.
- Step 2: "Fill in the Title, Body, and select the type (Info / Warning / Success). Optionally attach
  an image or video (max 20 MB)." / Filipino.
- Step 3: "Check "Pin to top" to keep the announcement at the top of the list for high-priority
  messages." / Filipino.
- Step 4: "To delete an announcement, click the trash icon (🗑️) next to it." / Filipino.

(Notable: this confirms the underlying Announcements feature supports a Title/Body form, a
type selector with **Info / Warning / Success** variants, an image-or-video attachment up to
20 MB, a "Pin to top" checkbox, and per-row delete via trash icon.)

## 141823 — `/help` Section 7 expanded

**Section 7 "Viewing Analytics & Reports" expanded**:
- Step 1: "Go to "Analytics" in the sidebar to see platform-wide performance metrics." / Filipino.
- Step 2: "The stats cards show: New Signups, Activation Rate (%), Daily Active Users, and ARPU
  (Average Revenue Per User)." / Filipino.
- Step 3: "The "Enrollments by Month" bar chart shows how many trainees enrolled each month." /
  Filipino.
- Step 4: "The "Revenue Trend" area chart tracks revenue over time so you can spot growth patterns."
  / Filipino.

(Confirms Admin Analytics page has: 4 stat cards [New Signups, Activation Rate %, DAU, ARPU], an
"Enrollments by Month" bar chart, and a "Revenue Trend" area chart — recharts components per the
design-source doc.)

## 141833 — `/help` Section 8 expanded (top)

**Section 8 "Setting Up Payment Methods" expanded**:
- Step 1: "Go to "Payment Methods" in the sidebar to configure how trainees can pay their enrollment
  fees." / Filipino.
- Step 2: "You can enable or disable payment options like GCash, Maya, Bank Transfer, or Card by
  toggling the switch on each card." / Filipino.
- Step 3: "Edit the account number, account name, and bank name for each payment method. Click "Save
  Changes" when done." / Filipino.
- Step 4 begins: "You can also add an admin note (e.g. "Send exact amount only") that trainees will
  see during enrollment." (cut off)

## 141836 — `/help` Section 8 rest + Section 9 collapsed

- Step 4 Filipino translation completes.
- **Section 9 — "Checking the Audit Log"** appears collapsed.

## 141840 — `/help` Section 9 expanded

**Section 9 "Checking the Audit Log" expanded**:
- Step 1: "Go to "Audit Log" in the sidebar. This page records every action taken on the platform —
  by any user." / Filipino.
- Step 2: "Each log entry shows: the category (e.g. enrollment, payment, certificate), the action
  taken, who did it, and when." / Filipino.
- Step 3: "Use the category filter to narrow down logs by type: user, enrollment, payment,
  certificate, calendar, module, system, forum, or community." / Filipino.

(This is the authoritative list of Audit Log categories: **user, enrollment, payment, certificate,
calendar, module, system, forum, community** — 9 category values for the filter control.)

## 141844 — `/help` Section 10 expanded (top)

**Section 10 "Managing Trainer Status & Revocation" expanded**:
- Step 1: "Go to "Trainer Management" in the sidebar to see every trainer, their assigned program,
  active trainees count, and average rating." / Filipino.
- Step 2: "Use the search bar to find a trainer by name or program. You can also filter by status
  (Active, On Leave, Suspended)." / Filipino.
- Step 3 begins: "Click "Revoke Trained" on a trainee row to remove their Trained Graduate badge and
  re-open their evaluations. Use this only if the certification was issued in error or the trainee's
  standing is being reviewed." (cut off)

## 141848 — `/help` Section 10 rest + Sections 11–12 collapsed

- Step 3 Filipino translation completes.
- Step 4: "Revoked trainees are notified automatically. Their certificate becomes invalid until the
  trainer re-evaluates and the admin re-approves." / Filipino.
- Collapsed rows appear:
  - **Monitoring the Forum Leaderboard** / Pagsubaybay sa Forum Leaderboard (trophy icon)
  - **Approving Forum Posts** / Pag-approve ng mga Forum Post (chat-bubble icon)

(Trainer status values confirmed: **Active, On Leave, Suspended**. Trainer Management row-level
action is literally labeled "**Revoke Trained**".)

## 141852 — `/help` Section 11 expanded (top)

**Section 11 "Monitoring the Forum Leaderboard" expanded**:
- Step 1: "From the Forum page, click "Leaderboard" to see the most active and reputable
  contributors across all communities." / Filipino.
- Step 2: "The leaderboard ranks users by reputation points, post count, upvotes received, and
  helpful replies. Top 3 users get gold, silver, and bronze badges." / Filipino.
- Step 3 begins: "Use the leaderboard to identify community champions you may want to promote to
  moderator roles, and to spot users whose content has driven the most engagement." (cut off)

## 141856 — `/help` Section 11 rest + Sections 12–13 collapsed

- Step 3 Filipino translation completes.
- Collapsed rows:
  - **Approving Forum Posts** / Pag-approve ng mga Forum Post
  - **Approving Community Join Requests** / Pag-approve ng mga Community Join Requests (globe icon)

## 141901 — `/help` Section 12 expanded

**Section 12 "Approving Forum Posts" expanded**:
- Step 1: "When a trainee submits a post to the forum, you will receive a notification in your bell
  icon (🔔)." / Filipino.
- Step 2: "Go to the Forum page from the navigation bar. You will see pending posts waiting for your
  approval." / Filipino.
- Step 3: "Click "Approve" to publish the post for everyone to see, or "Reject" to decline it." /
  Filipino.
- **Section 13 "Approving Community Join Requests"** visible collapsed below.

## 141907 — `/help` Section 12 (duplicate capture, Android tooltip overlay)

Same scroll position and content as 141901 (Section 12 "Approving Forum Posts" expanded, Section 13
collapsed below), but captured with a different tool — filename suffix is "Samsung capture" rather
than "Messenger", and the top line of body text ("community champion na maaari mong i-") appears
highlighted/selected (blue text-selection overlay), with a small black tooltip pill at the very
bottom of the screen reading:

> "**Tap on highlighted text to select it.**"

This is native Android text-selection/accessibility UI, not part of the HardTech app — the tester
was long-pressing text, not exercising an app feature. No new app content in this shot.

---

## Flows observed

1. **Home → Programs → Footer scroll (141620–141637)**: a straight top-to-bottom scroll through the
   tail of one program card, a full second program card ("I.T. Software Development"), and into the
   footer. Confirms the **Program Card** is a repeating component: icon chip + H3 title + green
   subheading + body paragraph + 2×2 stat grid (Duration/Schedule/Level/Investment) + green
   "COURSE MODULES" checklist + trainer profile mini-card + Enroll Now/Inquire button pair. A photo
   card with an "INDUSTRY CERT" badge sits between program cards (purpose ambiguous — see Open
   Questions).

2. **Contact page full scroll + FAQ exploration (141644–141711)**: hero → 4 contact-method cards
   (Call Us, Email Us, Main Office, Branch Office) → 2 full map cards with "Get Directions" CTAs →
   FAQ accordion. The tester then deliberately opened **every FAQ item one at a time, out of visual
   order (Q3 → Q4 → Q2 → Q1)**, which is strong evidence the accordion is single-expand
   (`Accordion type="single" collapsible`) since only one panel is ever open across all four shots.

3. **Help Center walkthrough, Admin role (141724–141907)**: after selecting the "Admin" role card,
   the tester opened all 12 (of a stated 14) guide sections **in strict top-to-bottom order**,
   scrolling through and expanding one at a time, confirming the same single-expand accordion
   behavior applies to the nested step-guide sections. Each section follows an identical internal
   template: icon + EN title + FIL subtitle header row → numbered vertical-timeline steps, each step
   pairing a bold English sentence with a smaller muted Filipino translation directly beneath it.
   This EN/FIL pairing is used **everywhere** on this page (role descriptions, tip callout, every
   single step) — it is a core content pattern for the whole Help Center, not a one-off.

## Mobile layout rules

- **Header/nav**: a single floating, translucent "glass" pill navbar sticky-pinned near the top of
  the viewport (logo + wordmark left, one hamburger icon button right). No visible bottom tab bar,
  no visible search bar, and no visible breadcrumbs at this scroll depth on any page in this slice.
  Page content scrolls underneath/behind the navbar (its background is translucent, so
  partially-scrolled text is visible bleeding through it).
- **Stat/info grids stay 2 columns on mobile**, not collapsed to 1 column — e.g. the Duration /
  Schedule / Level / Investment cards on program cards remain a 2×2 grid at this viewport width.
- **Primary+secondary CTA pairs stay side-by-side**, not stacked — "Enroll Now" (solid) + "Inquire"
  (outline) always render as two buttons in one row, even on mobile.
- **Accordions are single-expand everywhere** (FAQ on `/contact`, all 14 guide sections on `/help`):
  opening one item visually collapses whichever other item was open, and expanded rows use an
  up/down chevron toggle while collapsed-and-inactive rows use a distinct circular-button
  right-chevron (`›`) affordance.
- **Numbered step lists render as a vertical timeline**: a green circled number per step connected
  by a vertical rule, not a plain ordered list — reused identically across all `/help` sections.
- **Bilingual content (EN primary / Filipino secondary)** is a first-class pattern on `/help`:
  every heading, subheading, and step has an English line in full-strength text color immediately
  followed by a smaller, muted-gray Filipino translation. This should be modeled as paired
  strings (e.g. `label_en` / `label_fil`), not string concatenation.
- **Footer is a single stacked column** on mobile: logo block → tagline → Facebook button → Quick
  Links list → Contact list → copyright/credit line. No responsive multi-column footer grid visible
  at this width.
- **Maps are static Google Maps embeds** with a custom dark map theme, an "Open in Maps ⤢" overlay
  chip (external link), a colored office-name badge overlay, and a full-width "Get Directions"
  button beneath — repeated identically per office location.
- **Role selector uses an asymmetric 2-then-1 grid** (Admin + Trainer in a row, Trainee centered
  full-width below), not a straight 3-column or vertical stack, and the "selected" role state is
  indicated with a **blue** border/glow/text treatment — the one place in this slice where the
  selection indicator departs from the site's neon-green primary color.

## Open questions

- **Section 14 of the Help Center (Admin role) was not reached in this slice.** The role
  description states "14 sections · 14 seksyon"; this slice only confirms sections 1–13 (How to Log
  In, Understanding Your Dashboard, Approving Enrollments & Payments, Managing Users, Approving
  Certificate Requests, Posting Announcements, Viewing Analytics & Reports, Setting Up Payment
  Methods, Checking the Audit Log, Managing Trainer Status & Revocation, Monitoring the Forum
  Leaderboard, Approving Forum Posts, Approving Community Join Requests). Section 13's own expanded
  content, and the 14th section's title/content, should be picked up by the next mobile slice.
- **Trainer and Trainee role tabs of `/help` are not covered by this slice** — only Admin was
  selected/expanded. Their section counts and content are unknown from this batch.
- **The very top of `/` and `/contact` (hero, primary nav links, any visible top-of-page content
  above the Programs list / Contact hero) is not in this slice** — every Home/Contact shot here
  starts already mid-scroll. An earlier slice should cover the true page top.
- **The "INDUSTRY CERT" photo card's exact placement/purpose is ambiguous**: it appears directly
  after one program card's CTA row and before the next program card's heading, but it's unclear if
  it's part of the preceding program card (e.g. a "gallery preview" sub-block) or a standalone
  interstitial card in the Programs list.
- Exact lucide icon names for each Help Center section (door/arrow, grid, receipt, people, scroll,
  megaphone, trending-up, card, clipboard-check, person-gear, trophy, chat-bubble, globe) are
  described visually only — not confirmed against the bundle's icon imports.
