# Mobile Screenshot Spec — Slice 01 (items 1–35)

Source: `D:\Win10_UserData\Downloads\Hardtech\Mobile\*.jpg`, first 35 files sorted
ascending by filename. All shots are the same capture session (2026-07-28,
14:12–14:16), taken inside the Facebook **Messenger in-app browser** (chrome
shows `slot-pear-69660733.figma.site` URL bar + "Messenger" sub-label + system
status bar). Device viewport is a standard tall Android phone (screenshots are
1080×2340 physical px).

Every screen shares a persistent **floating glass header**: HardTech logo
lockup (crest icon + "HardTech" / "IT CORP." wordmark) on the left, a
hamburger icon-button (rounded square, glass background) on the right. The
header pins to the top of the scroll on every route observed in this slice —
it is visible in literally every screenshot, including mid-scroll positions,
confirming `position: sticky` (or fixed) behavior with a translucent/blurred
backdrop (`--glass-bg`).

This slice covers five routes: `/` (home), `/about`, `/forum`, and `/programs`,
plus the mobile nav Sheet/Drawer overlay.

## Summary table

| # | Timestamp | Route | Section / State |
|---|---|---|---|
| 1 | 141216 | `/` | Hero (top of page) |
| 2 | 141232 | `/` | Hero carousel (2nd slide) → Live Updates banner → Why HardTech intro |
| 3 | 141236 | `/` | Why HardTech intro + first 2 feature cards |
| 4 | 141240 | `/` | Feature cards grid (Flexible Schedules, Lifetime Support, Hands-On Labs, Online Portal) |
| 5 | 141244 | `/` | Online Portal card end → Success Stories intro → testimonial 1 (partial) |
| 6 | 141251 | `/` | Testimonial 1 full (Maria Santos) → testimonial 2 (Juan dela Cruz, partial) |
| 7 | 141257 | `/` | Testimonial 3 (Cristina Valdez) → footer brand block begins |
| 8 | 141300 | `/` | Footer (brand blurb, Quick Links, Contact, copyright) |
| 9 | 141309 | `/` (overlay) | Mobile nav Sheet/Drawer, fully open |
| 10 | 141316 | `/about` | Hero (top of page) |
| 11 | 141321 | `/about` | Stats row 2 (4 Master Trainers / 3 Core Programs) → gallery photo |
| 12 | 141326 | `/about` | Gallery photo (graduation group photo) → "HardTech IT Corp. — Established 2011" caption → Our Story intro |
| 13 | 141330 | `/about` | Our Story body copy |
| 14 | 141335 | `/about` | Our Foundation: Mission, Vision (cards) |
| 15 | 141339 | `/about` | Philosophy card → Meet Your Instructors intro → instructor 1 card (collapsed) |
| 16 | 141342 | `/about` | Instructor 1 (Henry Lopez) card, collapsed, full |
| 17 | 141350 | `/about` | Instructor 1 (Henry Lopez) card, expanded (Experience & Credentials) |
| 18 | 141358 | `/about` | Instructor 2 (Adelan "Dylan" Sistoso) card, expanded |
| 19 | 141407 | `/about` | Instructor 3 (Jammy "Jam" Furagganan) card, expanded |
| 20 | 141411 | `/about` | Instructor 4 (Arl Mazz) card, expanded (last instructor) |
| 21 | 141416 | `/about` | Why Choose Us intro + CTA + checklist items 1–5 |
| 22 | 141420 | `/about` | Checklist items 4–8 → footer begins |
| 23 | 141423 | `/about` | Footer (full) |
| 24 | 141436 | `/forum` | Top of page: header, Sign in to Post, search, filter, tabs, post 1 (pinned) |
| 25 | 141442 | `/forum` | Category filter chips expanded, tabs, post 1 |
| 26 | 141445 | `/forum` | Sort dropdown open (Newest/Most Active/Most Viewed/Most Reactions) |
| 27 | 141508 | `/forum` | Post list, scrolled to post 2 (Juan Dela Cruz troubleshooting) + post 3 (Henry Lopez) |
| 28 | 141514 | `/forum` (post detail) | Post 2 detail view, top (breadcrumb, tags, title, author, body start) |
| 29 | 141521 | `/forum` (post detail) | Post 2 detail, reaction bar + "1 Reply" + sign-in gate + reply 1 (collapsed start) |
| 30 | 141525 | `/forum` (post detail) | Reply 1 full body, reactions, "Back to Forum" button |
| 31 | 141603 | `/programs` | Hero (top of page) |
| 32 | 141607 | `/programs` | Program 1 (Computer Hardware Servicing) card, photo + intro |
| 33 | 141610 | `/programs` | Program 1 detail: duration/schedule/level/investment, modules, instructor, CTAs |
| 34 | 141614 | `/programs` | CTA row end → Program 2 (Cellphone Hardware Servicing) photo + heading |
| 35 | 141617 | `/programs` | Program 2 detail: description, duration/schedule/level/investment, modules (partial) |

---

## Screenshot-by-screenshot detail

### 1 — `141216` — `/` — Hero, top of page

Route: `/` (home). Scroll position: very top.

Components:
- Status bar (device chrome, not app UI): 2:12, muted icon, 5G, signal, 51% battery.
- Browser chrome (Messenger in-app browser, not app UI): close (X), lock icon, URL `slot-pear-69660733.figma.site`, "Messenger" sub-label, overflow-menu (⋯).
- Sticky glass header: HardTech crest logo + "HardTech" (bold white) / "IT CORP." (green, tracked caps) two-line wordmark. Right: hamburger button — rounded-square glass Button, ≡ icon.
- Badge (pill, outlined, green dot + green text): "● ENROLLMENTS OPEN — 2026"
- H1 (two lines, large bold): "Build Your Future" / "in **Modern Technology**" (second line's "Modern Technology" in neon green gradient)
- Paragraph (muted gray): "Get professionally trained in Computer Hardware Servicing, Cellphone Repair, and I.T. Software Development through immersive hands-on learning."
- Button group, stacked/inline: primary filled green Button "Enroll Now →" and secondary outline Button "Explore Programs ›"
- Trust row: 3 items with icon + label, wrapped 2-then-1: "✓ Skills-First Training" (green check), "✓ QR Certificates" (blue check), "✓ Job Placement Assist" (purple check)
- Section label (badge pill): "WHAT WE OFFER"
- H2: "Core Programs" (green)
- Horizontal carousel (Carousel component): 3 program cards partially visible, center card active/focused with border ring. Center card shown: "I.T. Software Development" with pill badges "160 hrs" and "800+ enrolled" over a photo of two people at a workstation. Left/right neighbor cards dimmed/blurred (Cellphone Hardware Servicing, Computer Hardware Servicing thumbnails visible at edges). Round prev/next arrow buttons (chevron ‹ ›) overlaid at left/right edge, semi-transparent black circles. Small in-card left/right nav arrows also visible centered on the active card image (a secondary control, "‹›" icon badge).
- Carousel dot pagination: 3 dots, 3rd (rightmost) active/elongated green pill — indicates the carousel wraps or reads right-to-left, or dot state reflects a different slide than the visually-centered card (open question).
- Bottom sticky/inline banner (bordered, green outline, rounded pill container): "● LIVE UPDATES" label with megaphone icon, "UPDATE" pill badge, ‹ › nav arrows with dot pagination (1 active green dot + 1 inactive), page counter "1/2".
- Bottom edge: a thin horizontal scrollbar-like gray bar (system UI gesture indicator, not app UI).

Interactive state: default. Carousel mid-transition (center card in focus).

### 2 — `141232` — `/` — Hero carousel 2nd view → Live Updates → Why HardTech intro

Scroll position: same vertical position as #1 essentially (carousel auto-advanced/swiped to next card while page didn't scroll) — actually comparing, this appears to be the same scroll position as image 1 but carousel state advanced (shows a "120 hrs / 2,400+ enrolled" card centered, cropped at top). Then below the fold (visible further down due to it being a taller capture) is the full Live Updates card and the start of "Why HardTech".

Components:
- Header (sticky), carousel remnants (prev/next circular arrow buttons, dot pagination showing 1st dot green/active now — confirms dots track carousel position, contradicting position from image 1; likely dot order is reversed or carousel auto-rotates).
- Live Updates Card (bordered green-outline rounded card):
  - Top row: "● LIVE UPDATES" (green dot + label), "UPDATE" pill Badge, ‹ pagination › with counter "1/2"
  - Content row: icon (green circular badge with checkmark), heading "June 2026 Batch Enrollments Now Open!", body text "New batches for all programs are accepting enrollments....", meta row "May 25, 2026" · "Tap to read more" (link-styled), thumbnail image at right (a soldering/PCB practice board product photo).
- Section badge pill: "◆ WHY HARDTECH"
- H2: "Built for **Success**" (Success in green)
- Paragraph: "We don't just teach — we transform. Our training methodology is built around industry standards, real equipment, and expert mentorship."
- Outline Button: "Our Story ›"

Interactive/loading state: default. This Live Updates card behaves like a small embedded announcements widget with its own carousel/pagination independent of the hero carousel — a distinct component, not just decoration.

### 3 — `141236` — `/` — Why HardTech intro + feature cards start

Scroll position: continued down. Shows repeated "Why HardTech" badge, "Built for Success" H2, paragraph, "Our Story ›" button (same as bottom of #2), then two feature Cards begin:
- Card 1: trophy icon (amber/gold, rounded-square dark icon tile) — "Completion Certificate" — "Receive a HardTech e-certificate with QR verification once you finish your program."
- Card 2 (partial): people icon (blue) — "Expert Trainers" — "Learn from working professionals with years of real-world industry experience."

Each feature card: full-width, dark card background, icon tile top-left, bold heading, muted description paragraph. Stacked vertically (1-column on mobile — desktop likely a grid).

### 4 — `141240` — `/` — Feature cards grid continued

Scroll continues. Cards visible (all same Card pattern: icon tile + heading + description, full width, stacked):
- "Flexible Schedules" (graduation-cap icon, purple) — "Choose from multiple batch schedules — morning, afternoon, or weekend classes."
- "Lifetime Support" (shield icon, green) — "Access resources, alumni network, and community support even after graduation."
- "Hands-On Labs" (lightning-bolt icon, blue) — "Practice on real hardware and equipment in our fully equipped training facility."
- "Online Portal" (wifi icon, purple) — "Track progress, download materials, and connect with trainers through our digital platform." (heading + first description line visible, cut at bottom)

Total feature grid = 6 cards: Completion Certificate, Expert Trainers, Flexible Schedules, Lifetime Support, Hands-On Labs, Online Portal.

### 5 — `141244` — `/` — Online Portal end → Success Stories → testimonial 1 start

- "Online Portal" card, full: description "Track progress, download materials, and connect with trainers through our digital platform."
- Section badge: "◆ SUCCESS STORIES"
- H2: "What Our Graduates Say"
- Paragraph: "Real reviews from real graduates who transformed their careers"
- Testimonial Card 1 (starts): faint large quote-mark/ribbon watermark icon top-left (decorative, low-opacity), Badge "🏅 Certified" (amber/gold outline pill), quote text begins: "\"HardTech completely transformed my career. The hands-on training was exactly what I needed. Within 2 months..."

### 6 — `141251` — `/` — Testimonial 1 full + testimonial 2 start

- Testimonial Card 1 complete: Badge "Certified" (amber), quote: "\"HardTech completely transformed my career. The hands-on training was exactly what I needed. Within 2 months of graduating, I landed a job at a major tech company. Worth every peso.\"" — Avatar (initials "MS", amber-tinted square) — Name "Maria Santos" (bold) — role/company subtext "Hardware Technician — TechCorp Philippines"
- Testimonial Card 2 (starts): Badge "Certified" (green outline this time — badge color varies per card, possibly tied to program/category), quote: "\"The best investment I ever made. The instructors are top-notch and the curriculum is comprehensive. I now run my own successful mobile repair shop thanks to HardTech.\"" — Avatar "JC" (green) — Name "Juan dela Cruz" — role "Mobile Repair Specialist" (cut off)

### 7 — `141257` — `/` — Testimonial 3 + footer brand block begins

- Tail end of a testimonial card ("IT Support Engineer" role text visible, cropped at top — this is testimonial 2's continuation or a 3rd card's trailing edge)
- Testimonial Card (Cristina Valdez): Badge "Certified" (amber), quote: "\"The micro-soldering training at HardTech is unmatched. Mr. Henry Gomata Lopez is incredibly knowledgeable and patient. I was hired by Samsung's authorized service center straight after graduation.\"" — Avatar "CV" (green) — Name "Cristina Valdez" — role "Authorized Service Technician" — Separator line — Badge/chip: "Cellphone Repair" (green outline pill, category tag)
- Footer starts: HardTech logo + wordmark, tagline "Professional IT training for tomorrow's tech leaders." — outline Button "🇫 Follow on Facebook" (Facebook icon)

Note: real name "Henry Gomata Lopez" referenced inside a testimonial quote — matches the staff/instructor named later on `/about`.

### 8 — `141300` — `/` — Footer (full)

- HardTech logo/wordmark, tagline "Professional IT training for tomorrow's tech leaders."
- Outline Button: "Follow on Facebook"
- "QUICK LINKS" (green caps label) — plain text link list: Home / About / Programs / Gallery / Contact (note: no "Enroll" or "Forum" link in this footer list, though both are real routes)
- "CONTACT" (green caps label) — icon rows: pin icon "673 Quirino Highway, Novaliches, QC"; phone icon "(123) 456-7890" (placeholder-looking number); mail icon "hardtechitcorp@gmail.com"
- Bottom bar, Separator above: "© 2026 HardTech IT Corp. All rights reserved. · Powered by **Prince IT Solutions**" (Prince IT Solutions in green, presumably a link)

Layout: on mobile, footer columns stack fully vertically (brand block → quick links → contact → legal bar), no side-by-side columns.

### 9 — `141309` — `/` (overlay) — Mobile nav Sheet/Drawer, open

This is the hamburger menu opened — a full-height Sheet/Drawer sliding from the right (or a full-screen overlay) replacing the page content edge-to-edge below the header.

Components:
- Header row inside sheet: HardTech logo (smaller/compact variant using "HardTech" mark differently — square logo icon without full wordmark subtext visible at this size) + close button (X in rounded-square glass tile, replacing the hamburger).
- Nav item: "Home" — active/current state, styled as a filled pill/row with green text (indicates current route highlighting)
- Nav item: "About" — plain white text row
- Nav item: "Forum" — plain white text row, with an unread-indicator dot (small red/orange dot) at the right edge — signals notification/unread state on the Forum nav item
- Section label: "EXPLORE" (muted gray caps)
- Nav item w/ icon: 📖 "Programs"
- Nav item w/ icon: 🖼 "Gallery"
- Nav item w/ icon: 📍 "Contact & Location"
- Nav item w/ icon: ❓ "User Guide"
- Separator
- Outline Button (full width): "Login"
- Filled green Button (full width): "Enroll Now"
- Below the sheet, the home page hero carousel is visible bleeding through at the bottom (sheet does not cover 100% of viewport height, OR this is actually an accordion/expanded panel pushing content rather than a modal overlay — the carousel with "Cellphone Hardware Servicing / 80 hrs / 1,200+ enrolled" card and Live Updates banner show underneath, suggesting the drawer overlays only down to a fixed max-height with the rest of the page still scrollable/visible below it, OR the screenshot was captured mid-close-animation).

Mobile-specific: hamburger → Sheet/Drawer pattern confirmed. Nav items are text rows, not icon-first for top items (Home/About/Forum) but icon+text rows for the "Explore" sub-section (Programs/Gallery/Contact/User Guide) — a two-tier nav grouping. Auth actions (Login / Enroll Now) pinned at the bottom of the drawer as two full-width buttons (secondary outline + primary filled), always visible without scrolling given this is a short list.

Open question: does "Login" route to `/login` and does this drawer close on backdrop tap or only via the X button? Not observable from a static screenshot.

### 10 — `141316` — `/about` — Hero, top of page

Route: `/about`. Scroll position: top (header still sticky at top, meaning nav to About reset scroll to 0 and closed the drawer).

Components:
- Header (same sticky glass header as home).
- Badge pill: "◆ ABOUT HARDTECH"
- H1 (large, 3-line wrap): "Shaping the Next Generation of **Tech Experts**" (last two words green)
- Paragraph: "HardTech IT Corporation is a leading provider of IT training and services. We specialize in delivering high-quality education and support to individuals and businesses."
- Button row: filled green "View Programs →", outline "Contact Us ›"
- Stats grid, row 1 (2 cards visible, cut at bottom): "20+" / "YEARS OF EXPERIENCE"; "10,000+" / "PEOPLE TRAINED"

### 11 — `141321` — `/about` — Stats row 2 + gallery photo start

- Stats grid row 2 (continuing the same 2×2 or 2-col grid): "4" / "MASTER TRAINERS"; "3" / "CORE PROGRAMS"
- Below stats: a real photograph — group photo of ~9 men in matching black HardTech-branded shirts, several holding printed "Certificate of Completion" sheets, in what looks like a repair-training classroom (visible: an aircon unit, curtained window, multiple desktop monitors/soldering stations). One man in front (white tank top) taking the selfie.
- Faint background artifact: partially-legible source code text bleeding through behind the UI (e.g. `import { useState, useEffect } from...`, `import { HardTech } from...`) — this is a rendering/screenshot capture artifact from the underlying page transition, not real UI; ignore as a spec element but note it confirms the site is a React SPA using `useState`/`useEffect` and importing a shared `HardTech` module/type.

### 12 — `141326` — `/about` — Gallery photo full + caption → Our Story intro

- Same group photo, fully framed within a rounded-corner Card container.
- Caption below photo (inside same card): "HardTech IT Corp." (green, bold) / "Established 2011" (muted gray)
- Section badge: "◆ OUR STORY"
- H2 (2-line): "From a Vision to a **Movement**" (Movement in green)

### 13 — `141330` — `/about` — Our Story body copy

Body copy paragraphs (muted gray, bold spans in white):
- "HardTech IT Corp. was born from a simple conviction: **everyone deserves access to quality technology education.** Founded by a group of passionate engineers and educators, we set out to bridge the gap between classroom theory and industry reality."
- "What started as a single room with three trainers has grown into a community of working technicians and developers, serving thousands of graduates across three specialized hands-on programs."
- "Today, most of our 10,000+ trained learners run their own mobile, desktop, and electronics servicing businesses —" (sentence continues, cut off)

Background code-bleed artifact continues here too (`def generate_certificate...`, `pdf = render_template(...)`, `<ProgressBar value=...>`, `<Badge program=...>`) — reinforces: certificate generation involves a template/PDF render step server- or client-side, and trainee UI uses a `ProgressBar` and a `Badge` keyed by `program`. Treat as incidental evidence of implementation, not literal visible UI text.

### 14 — `141335` — `/about` — Our Foundation: Mission & Vision

- Section badge: "◆ OUR FOUNDATION"
- H2: "Mission, Vision & **Philosophy**" (Philosophy in green)
- Card 1: target/bullseye icon (green) — label "OUR MISSION" (green caps) — body: "To empower individuals and businesses through innovative electronic devices servicing and software development."
- Card 2: eye icon (green) — label "OUR VISION" (green caps) — body: "A future where people have knowledge on hardware servicing and I.T. software development." (cut at bottom)

### 15 — `141339` — `/about` — Philosophy card → Meet Your Instructors intro

- Card 3: heart icon (green) — label "OUR PHILOSOPHY" — body: "Learning happens through doing — every lesson is grounded in real-world practice and industry tools."
- Section badge: "◆ EXPERT TRAINERS"
- H2: "Meet Your **Instructors**" (Instructors in green)
- Paragraph: "The four working professionals leading every HardTech session — not just academics"
- Instructor Card 1 begins: Avatar "HL" (green initials tile) — Name "Mr. Henerosalio \"Henry\" G. Lopez" — Badge "Owner & President" (green outline pill)

### 16 — `141342` — `/about` — Instructor 1 (Henry Lopez), collapsed, full

Full instructor Card 1 (collapsed state):
- Avatar "HL", Name "Mr. Henerosalio \"Henry\" G. Lopez", Badge "Owner & President"
- Separator
- Bio: "Founder of HardTech IT Corp with over two decades of hands-on expertise in advanced mobile board-level servicing. He leads the school's most technical sessions covering micro-soldering, chip-level diagnostics, and complex hardware fault resolution."

(No "Experience & Credentials" accordion visible open yet in this shot — appears to already be present per surrounding shots; likely this shot is the moment just before/after the Accordion trigger, since #17 shows the same card with the credentials list expanded.)

### 17 — `141350` — `/about` — Instructor 1, expanded (Accordion open)

Same card as #16, now showing an expanded **Accordion/Collapsible** section:
- Trigger row: "Experience & Credentials" with chevron-up icon (^) indicating expanded state
- Bullet list (green dot bullets): "20+ years — Advanced Mobile Board-Level Servicing", "Advanced Mobile Servicing", "Board-Level Repair", "Micro-Soldering & Diagnostics"
- Separator
- Link/Button pill: "Facebook Profile" (blue-tinted outline, looks like an external-link styled Badge/Button)
- Next card starts: "Prof. Adelan \"Dylan\" P. Sistoso" — Avatar "AS" — Badge "Vice President"

This establishes the Instructor Card pattern: Avatar + Name + Role Badge + Separator + Bio paragraph + expandable "Experience & Credentials" Accordion (bulleted list) + "Facebook Profile" link button. All 4 instructor cards follow this exact pattern.

### 18 — `141358` — `/about` — Instructor 2 (Adelan "Dylan" Sistoso), expanded

- Avatar "AS", Name "Prof. Adelan \"Dylan\" P. Sistoso", Badge "Vice President"
- Bio: "Vice President of HardTech IT Corp and owner of Prince IT Solutions. A Licensed Professional Teacher holding NC II and NC III credentials in web development and visual graphic design, he brings both pedagogical rigor and real-world software expertise to every class."
- Experience & Credentials (expanded): "Licensed Professional Teacher (LPT)", "CSS NC II", "Web Development NC III", "Visual Graphic Design NC III", "Licensed Professional Teacher" (listed twice — once as a general credential line and once as the detailed NC entry; verbatim as shown, possible source duplication)
- "Facebook Profile" link button
- Next card starts: "Mr. Jammy \"Jam\" S. Furagganan" — Avatar "JF" — Badge "Trainer"

Real-world detail confirmed: "Prince IT Solutions" (the actual dev/agency building this site) is name-checked in-world as a business owned by the VP — matches footer's "Powered by Prince IT Solutions".

### 19 — `141407` — `/about` — Instructor 3 (Jammy "Jam" Furagganan), expanded

- Avatar "JF", Name "Mr. Jammy \"Jam\" S. Furagganan", Badge "Trainer"
- Bio: "Certified trainer holding a National Certificate III in Mobile Phones and Handheld Gadgets Servicing. He guides trainees through hands-on device teardown, component testing, and systematic fault-finding workflows used in professional repair centers."
- Experience & Credentials (expanded): "NC III — Mobile Phones & Handheld Gadgets Servicing", "Mobile Phone Servicing", "Android & Apple Specialist", "Board-Level Repair"
- "Facebook Profile" link button
- Next card starts: "Mr. Arl Mazz" — Avatar "AM" — Badge "Trainer"

### 20 — `141411` — `/about` — Instructor 4 (Arl Mazz), expanded (last)

- Avatar "AM", Name "Mr. Arl Mazz", Badge "Trainer"
- Bio: "A veteran practitioner with over two decades in mobile phone repair, specializing in Android system-level troubleshooting. His deep field experience gives trainees practical insight into real-world repair scenarios beyond the classroom."
- Experience & Credentials (expanded): "20+ years — Mobile Phone Servicing & Android Troubleshooting", "Mobile Phone Servicing", "Android Master Troubleshooting"
- "Facebook Profile" link button
- No further card below — end of Instructors section, followed by empty spacing before next section.

### 21 — `141416` — `/about` — Why Choose Us intro + checklist start

- Section badge: "◆ WHY CHOOSE US"
- H2: "The HardTech **Advantage**" (Advantage in green)
- Paragraph: "We don't just certify — we transform careers. Here's why thousands of students trust us."
- Filled green Button: "Join HardTech →"
- Checklist rows (each a full-width Card/row with a green circular checkmark icon + text), items 1–5:
  1. "Skills-first training — no prior credentials required"
  2. "Hands-on training with professional-grade equipment"
  3. "Expert trainers with real industry backgrounds"
  4. "Small class sizes for personalized attention"
  5. "Auto-generated e-certificates with QR verification"

### 22 — `141420` — `/about` — Checklist continued + footer starts

- Checklist items 4–8 (repeats 4–5 from previous screenshot, then continues):
  4. "Small class sizes for personalized attention"
  5. "Auto-generated e-certificates with QR verification"
  6. "Business-starter guidance for graduates opening their own shop"
  7. "Flexible scheduling: morning, afternoon, and weekend"
  8. "Lifetime alumni access and community support"
- Footer brand block begins (logo + wordmark only, visible at very bottom edge).

Full checklist (8 items total): skills-first training, hands-on training w/ pro-grade equipment, expert trainers w/ real industry backgrounds, small class sizes, auto-generated e-certificates w/ QR verification, business-starter guidance, flexible scheduling, lifetime alumni access.

### 23 — `141423` — `/about` — Footer (full)

Identical structure/content to the home page footer (#8): HardTech brand block + tagline, "Follow on Facebook" button, "QUICK LINKS" (Home/About/Programs/Gallery/Contact), "CONTACT" (address/phone/email), copyright bar "© 2026 HardTech IT Corp. All rights reserved. · Powered by Prince IT Solutions". Confirms footer is a shared/global component identical across routes.

### 24 — `141436` — `/forum` — Top of page

Route: `/forum`. Scroll position: top. (Battery now reads 50%, ~1 min after previous screenshot — consistent with navigation via the drawer's "Forum" nav item seen in #9, whose unread dot suggests new content.)

Components:
- Header (sticky glass, same pattern).
- Badge pill: "COMMUNITY" (green outline)
- H1: "Community Forum" (green, large)
- Paragraph: "Discuss, share knowledge, and grow together with the HardTech community"
- Full-width outline/muted Button: "Sign in to Post" (disabled-looking / low-emphasis styling — signed-out state gate)
- Search Input (full width, magnifying-glass icon, placeholder): "Search posts, authors, or tag..." (text is truncated by a Select/DropdownMenu button to its right)
- Sort control: icon Button showing ↕ (up/down arrows) + chevron ⌄ — a dropdown trigger (collapsed here)
- Filter row: full-width Button "▽ Filter by Category / Tag" with funnel icon + chevron ⌄ (collapsed)
- Tabs (TabsList), horizontally scrollable, 4 visible + more cut off: "All Posts" (active, green underline/indicator), "Trending", "Communities", "Bookma[rks]" (cut off — confirms `/forum` has an All Posts / Trending / Communities / Bookmarks tab set per the desktop spec)
- Below tabs: "6 posts" count label
- Post Card 1 (pinned, at top of list):
  - Badges: "📌 PINNED" (amber/gold), "↗ TRENDING" (orange)
  - Row: Avatar "HA" (green) — Name "HardTech Admin" — Badge "ADMIN" (amber) — Badge "ACTIVE" (green) — icon button (megaphone, top-right of card)
  - Meta row: star rating "★★★★" + "4.8 (4)" — doc icon "4 posts" — "434d ago"
  - Title: "Welcome to the HardTech Community Forum! 🎉"
  - Excerpt: "We're thrilled to launch the official HardTech IT Corp community forum — a dedicated space for trainees, trainers, and graduates to connect, share knowledge, and grow together. What you can do here: -..."
  - Hashtag chips (cut off at bottom): "#welcome", "#community", "#guidelines"

### 25 — `141442` — `/forum` — Category filter chips expanded

Same top-of-page view as #24, but the "Filter by Category / Tag" control is now expanded (chevron flipped to ⌃), revealing category chip Toggle-Group:
- "All" (active/selected, green outline+fill)
- "General Discussion"
- "Q&A Help"
- "Resources & Tips"
- "Troubleshooting"
- "Career & Jobs"
- "Announcements"

This confirms all 6 forum categories from the design-source doc plus an "All" chip, rendered as wrapping pill chips (2–3 per row on mobile). Tabs row (All Posts/Trending/Communities/Bookmarks) and "6 posts" / pinned post 1 remain visible below, matching #24's route/section.

### 26 — `141445` — `/forum` — Sort dropdown open (DropdownMenu)

Same scroll position as #24/#25, but now the sort control (↕ icon button, right of the search Input) is open, showing a DropdownMenu/Select popover anchored below it:
- "Newest" — selected (green text + green checkmark/circle-check icon at right)
- "Most Active"
- "Most Viewed"
- "Most Reactions"

The category filter row underneath is back to collapsed state ("Filter by Category / Tag" with all/general/etc. chips still shown in a partially collapsed row — actually still expanded per this screenshot, showing All/General Discussion visible; the sort popover overlays on top of/beside the filter chips region, partially obscuring them). Tabs + post 1 remain visible under the overlay.

### 27 — `141508` — `/forum` — Post list scrolled: post 2 + post 3

Scroll position: down past post 1 (pinned Admin welcome post), now into the regular feed. Hashtag chips from post 1 trail off top ("#jobs", "#hiring", "#mandaluyong", "#bgc", "#career" — these belong to a post not fully captured, evidence of a "Career & Jobs" category post between post 1 and post 2 that this slice doesn't show in full).

- Post Card 2:
  - Row: Avatar "JD" (green) — Name "Juan Dela Cruz" — Badge "TRAINEE" (green outline) — Badge "NEWCOMER" (gray) — icon button (wrench, top-right — category-specific icon, Troubleshooting)
  - Meta: "★★★☆☆ 3.0 (1)" — "1 posts" — "430d ago"
  - Title: "Samsung Galaxy S23 not charging after ultrasonic cleaning — board issue or connector?"
  - Excerpt: "Took in a water-damaged S23 last week. After disassembly and ultrasonic cleaning with IPA solution, the board looks clean under a microscope — no visible corrosion remaining. Problems now: - Doesn't c..."
  - Hashtag chips: "#samsung", "#s23", "#water-damage", "#usb-c", "#charging"
  - Footer row: 👍 icon "63"(? actually icon row: thumbs-up icon, checkmark-circle icon, lightbulb icon — reaction buttons, unlabeled counts) ... 👁 "63" — 💬 "1 reply" — 🔖 bookmark icon
- Post Card 3 (starts):
  - Badge: "↗ TRENDING" (orange)
  - Row: Avatar "HL" (blue-tinted) — Name "Mr. Henry Gomata Lopez" — Badge "TRAINER" (blue outline) — Badge "ACTIVE" (green) — icon button (open-book icon)
  - Meta: "★★★★★ 5.0 (4)" — "5 posts" — "431d ago"
  - Title: "Micro-soldering starter toolkit — what you actually need vs. what's nice to have"
  - Excerpt: "After two years of hands-on micro-soldering work, here's an honest breakdown of what you truly need vs. what the YouTube channels make you think you need. Non-negotiables (Day 1 purchases): - Hakko FX..."
  - Hashtag chips: "#micro-soldering", "#tools", "#beginners", "#resources"

Note the per-category icon-button in the top-right of each post card changes glyph (megaphone for Admin/Announcements, wrench for Troubleshooting, open-book for Resources & Tips) — likely a "category icon" indicator rather than a generic action button.

### 28 — `141514` — `/forum/[post]` — Post detail, top

Tapping Post Card 2's title navigates to a post detail view (not a listed route in the route map — likely `/forum/:postId` or a modal/expanded view layered over `/forum`).

Components:
- Header (sticky, same).
- Breadcrumb row: "← Forum / Troubleshooting" (back-arrow + "Forum" text + separator "/" + current category as a Badge-styled crumb "Troubleshooting" in orange)
- Card (post detail container):
  - Tag row: "Troubleshooting" (orange/selected-looking chip) + hashtag chips "#samsung", "#s23", "#water-damage", "#usb-c", "#charging"
  - Title (large, bold): "Samsung Galaxy S23 not charging after ultrasonic cleaning — board issue or connector?"
  - Author row: Avatar "JD" — Name "Juan Dela Cruz" — Badge "TRAINEE" — Badge "NEWCOMER" — star rating "★★★☆☆ 3.0 (1)" — "1 posts · 0 replies"
  - Stats row: 👁 "64" — 💬 "1"
  - Separator
  - Body copy: "Took in a water-damaged S23 last week. After disassembly and ultrasonic cleaning with IPA solution, the board looks clean under a microscope — no visible corrosion remaining." / "Problems now:" bullet list: "Doesn't charge from USB-C (tested with 3 different cables and chargers)", "Shows \"Moisture Detected\" even though the board is completely dry", "Occasionally boots to Samsung logo then immediately shuts off"

Note: view count ticked up from 63 (list card, #27) to 64 (detail view, #28) — view-count increments on detail-page visit, a real behavior to reproduce (view increments once per visit, presumably server-side).

### 29 — `141521` — `/forum/[post]` — Reactions + reply gate + reply 1 start

Scroll continues down the same post detail:
- Reaction button row: "👍 Like", "✓ Helpful", "💡 Insightful" (3 outline pill Buttons), then "🔖 Save" pill Button on its own row below
- Divider row: "💬 1 Reply" label centered with horizontal rules on either side (like a Separator-with-label)
- Sign-in gate Card (dashed border): 💬 icon + "**Sign in** to join the conversation" ("Sign in" in green as a link/button)
- Reply Card begins:
  - Header pill: "💬 REPLY TO JUAN DELA CRUZ'S POST" (green) with "⌄ Collapse" toggle at right (Accordion/Collapsible per-reply)
  - Row: Avatar "HL" — Name "Mr. Henry Gomata Lopez" — Badge "TRAINER"
  - Badge: "NEWCOMER" (gray)
  - Meta: "★★★★★ 5.0 (4)" — "429d ago"
  - Body begins: "The \"Moisture Detected\" error persisting on a clean board is a strong indicator the USB-C port itself has internal pin damage — even if it looks fine externally. Water can wick inside the port between the contacts and the plastic housing, causing intermittent shorts that the moisture sensor interprets as liquid." / "Diagnostic steps I'd recommend:" / numbered list starts: "1. Replace the USB-C port first (it's a cheap part) before touching ICs" / "2. Check continuity from the USB-C VBUS pin..."

Left edge of the reply card has a green vertical accent bar (thread/reply indicator), distinguishing it visually as a nested reply rather than a top-level post.

### 30 — `141525` — `/forum/[post]` — Reply full + Back to Forum

Continuation/end of the same reply:
- "...sensor interprets as liquid." (repeat of trailing text from prior view due to scroll overlap)
- "Diagnostic steps I'd recommend:" numbered list, full: "1. Replace the USB-C port first (it's a cheap part) before touching ICs", "2. Check continuity from the USB-C VBUS pin to the PMIC input rail", "3. If charging IC is suspect, check resistance on the charge pump output pins"
- Closing paragraph: "The random boot-then-shutdown is likely the battery going below minimum threshold from the charging issue rather than PMIC damage. Start with the port swap — solves about 70% of these cases."
- Reaction footer on the reply itself: 👍 icon, ✓ icon, 💡 icon "1" (insightful count = 1)
- Outline Button, centered, standalone: "← Back to Forum"
- Below that: empty dark space (end of page content)

This confirms the post-detail page ends with a single "Back to Forum" navigation button and no further content/footer — likely a focused/immersive reading view without the global site footer.

### 31 — `141603` — `/programs` — Hero, top of page

Route: `/programs`. Scroll position: top. (~40 second gap since previous shot — user navigated away from the post detail back to Forum and then to Programs, or used the hamburger menu's "Programs" Explore link.)

Components:
- Header (sticky, same).
- Badge pill: "◆ TRAINING PROGRAMS"
- H1: "Our Core **Programs**" (Programs in green)
- Paragraph: "Practical, industry-aligned training programs designed to build real skills and launch your technology career — no prior credentials required."
- Trust row (icon + label, wraps 2-then-1): "🏅 Skills-First Training", "👥 50+ Expert Trainers", "⚡ Hands-On Labs"
- Program Card 1 begins: photo (soldering-station classroom, multiple people working under microscopes at a bench with monitors/multimeters) with overlay Badge "SKILLS TRAINING" (green, top-left of image)

Note: "50+ Expert Trainers" here contradicts the About page's "4 Master Trainers" / "The four working professionals" — likely "50+" refers to a different metric (total staff across time, or a marketing rounding) — flag as an open question / copy inconsistency to preserve verbatim rather than reconcile.

### 32 — `141607` — `/programs` — Program 1 (Computer Hardware Servicing) intro

- Program Card 1, photo (same soldering-classroom photo, full width, rounded top corners, "SKILLS TRAINING" badge overlay)
- Icon tile (green, CPU/chip icon) + Heading: "Computer Hardware Servicing"
- Subheading (green): "Become a Certified Hardware Technician"
- Body: "Master computer assembly, repair, maintenance, and advanced diagnostics. This program covers everything from basic component identification to enterprise-level hardware troubleshooting and network infrastructure basics."
- Info tile row begins: "🕐 DURATION" / "3 Months (120 hrs)" ; "📅 SCHEDULE" / "Mon–Fri | 8AM–12PM"

### 33 — `141610` — `/programs` — Program 1 full detail

- Info tiles (2×2 grid): DURATION "3 Months (120 hrs)", SCHEDULE "Mon–Fri | 8AM–12PM", LEVEL (⚡ icon) "Beginner to Professional", INVESTMENT ($ icon) "~~₱5,000~~" (strikethrough price — implies a promo/discount, real current price not shown, or this is a "was" price with an "is" price expected elsewhere/omitted)
- "COURSE MODULES" (green caps label), checklist (green checkmarks): "Computer Hardware Components & Architecture", "OS Installation & Configuration", "Troubleshooting & Diagnostics", "Network Cabling & Infrastructure", "Data Recovery & Backup Systems", "Final Skills Assessment"
- Instructor mini-card: person icon (green tile) — "Prof. Adelan P. Sistoso" — "EDPSE · LPT · MAEd | Network & Systems Servicing"
- Button row: filled green "Enroll Now →", outline "Inquire"

### 34 — `141614` — `/programs` — CTA end → Program 2 (Cellphone Hardware Servicing) start

- CTA row repeated in view (Enroll Now / Inquire) — end of Program 1 card.
- Program Card 2 begins: photo (two men at a repair bench, one in red hoodie pointing at a monitor showing board-repair software, wall poster behind reads "HARDTECH ADVANCE BOARD-LEVEL ANDROID & APPLE SPECIALIST TRAINING") with overlay Badge "SKILLS TRAINING"
- Icon tile (green, phone icon) + Heading: "Cellphone Hardware Servicing"
- Subheading (green): "Master Mobile Device Repair"
- Body begins: "Learn professional mobile device repair covering teardown, component diagnosis, micro-soldering, and software flashing. Gain skills for Android and iOS devices" (cut off)

### 35 — `141617` — `/programs` — Program 2 full detail (partial)

- Body continues: "...from basic glass replacement to advanced board repair."
- Info tiles (2×2): DURATION "2 Months (80 hrs)", SCHEDULE "Mon–Fri | 1PM–5PM", LEVEL "Beginner to Intermediate", INVESTMENT "₱5,000" (no strikethrough this time — plain price, inconsistent with Program 1's struck-through price)
- "COURSE MODULES" checklist (partial, cut at bottom): "Mobile Device Architecture & Teardown", "Display & Touch Panel Replacement", "Micro-soldering Techniques", "Battery & Charging Systems", "Software Flashing & Unlocking", "Business Operations & Pricing"

(Program 3, "I.T. Software Development", referenced from the home page carousel — "160 hrs", "800+ enrolled" — is not reached within this 35-shot slice; it would appear further down `/programs`.)

---

## Flows observed

1. **Home page vertical scroll (shots 1–8)**: Hero → hero program carousel → Live Updates announcement widget → Why HardTech (intro + 6 feature cards) → Success Stories (3 testimonials) → global footer. One continuous top-to-bottom scroll of `/`.

2. **Global nav drawer (shot 9)**: From anywhere, tapping the hamburger opens a right-side (or overlay) Sheet with primary nav (Home/About/Forum), a secondary "Explore" group (Programs/Gallery/Contact & Location/User Guide), and pinned Login/Enroll Now buttons at the bottom. The Forum item carries an unread-notification dot in this capture.

3. **About page vertical scroll (shots 10–23)**: Hero → stats (4 metrics total: 20+ years, 10,000+ trained, 4 master trainers, 3 core programs) → gallery photo w/ caption → Our Story copy → Mission/Vision/Philosophy cards → Meet Your Instructors (4 instructor cards, each independently expandable) → Why Choose Us (advantage list, 8 items) → global footer. Same footer component confirmed identical to home page's.

4. **Instructor card expand/collapse (shots 15→20)**: Each of the 4 instructor cards has its own "Experience & Credentials" Accordion trigger that, once opened, reveals a bulleted credentials list and a "Facebook Profile" link button. All 4 are shown expanded in sequence in this capture, suggesting either the user tapped each one in turn, or (more likely given the smooth single continuous scroll cadence) they render pre-expanded by default and the "chevron up" glyph is just the resting/default state, not a toggle the user activated. Treat as ambiguous — flagged in Open Questions.

5. **Forum browse → sort/filter → read → reply-read → back (shots 24–30)**: Land on `/forum` top → expand category filter chips → open sort dropdown (Newest/Most Active/Most Viewed/Most Reactions) → scroll the feed past the pinned welcome post into regular posts → tap into a Troubleshooting post's detail view → view its single reply (which is itself collapsible per-reply) → tap "Back to Forum" to return. This is the core forum read path for a **signed-out** visitor: "Sign in to Post" and "Sign in to join the conversation" gates appear at both the list level and the reply-composer level, but reading full posts/replies requires no auth.

6. **Programs page vertical scroll (shots 31–35)**: Hero (with a "50+ Expert Trainers" stat that reads inconsistently against About's "4 Master Trainers") → Program 1 "Computer Hardware Servicing" full card (photo, description, 4 info tiles, module checklist, instructor mini-card, Enroll Now/Inquire CTAs) → Program 2 "Cellphone Hardware Servicing" begins the identical card pattern. Confirms a repeating "Program Card" template: photo w/ badge overlay → icon+heading+subheading → body copy → 2×2 info-tile grid (Duration/Schedule/Level/Investment) → Course Modules checklist → instructor mini-card → CTA button row.

## Mobile layout rules

- **Sticky glass header** persists across every route in this slice, collapsed to just logo lockup + hamburger button (no inline nav links) — the entire desktop top nav (Home/About/Forum/Explore dropdown/notification bell/role chip, per the design-source doc) collapses into the single hamburger icon on mobile.
- **Hamburger → full-panel Sheet/Drawer**, not a small dropdown: it takes over the vertical space below the header with a two-tier list (flat top-level items, then an "EXPLORE" labeled icon+text sub-group), plus two pinned full-width action buttons (Login outline, Enroll Now filled) at the very bottom of the drawer.
- **Desktop's left/right forum rails are removed entirely on mobile**, not relocated into an accordion or collapsed drawer: no visible "Categories with counts", "Guidelines 1-5", "Forum Stats" left-rail content, nor "Trending 1-5 / My Bookmarks / Rating Leaderboard" right-rail content anywhere in this slice's `/forum` shots. Instead:
  - Category browsing relocates into the horizontally-wrapping "Filter by Category / Tag" chip row inline in the centre column.
  - Sort options relocate into a single dropdown icon-button (↕ + chevron) next to the search Input.
  - The "All Posts / Trending / Communities / Bookmarks" tab set remains as a horizontally-scrollable Tabs row (visually truncates "Bookmarks" to "Bookma…" off the right edge — a horizontal scroller/overflow, not a wrap).
  - Trending posts and the Rating Leaderboard content are presumably pushed to their own routes/tabs (`/forum/leaderboard`, "Trending" tab) rather than a persistent sidebar — not directly confirmed in this slice, flagged as open question.
- **Multi-card carousels** (home hero's 3-program carousel) use a center-focused "peek" pattern: the active card is full width with the previous/next cards partially visible/dimmed at the left and right edges, plus large circular chevron buttons overlaid at the far left/right of the section and a dot-pagination indicator below.
- **Stat blocks** (20+ / 10,000+ / 4 / 3 on About; presumably similar on Home) lay out as a 2-column grid of square-ish Cards, 2 per row, wrapping to additional rows rather than a single 4-wide row.
- **Feature/advantage lists** (Why HardTech's 6 cards, Why Choose Us's 8-item checklist) stack to a single column full-width, one Card per row — no side-by-side grid at this viewport.
- **Instructor cards** stack one-per-row, full width, each independently expandable via its own Accordion trigger ("Experience & Credentials") — this is a per-card, not a page-level, expand/collapse.
- **Program cards** (`/programs`) stack one full program per vertical section: photo → icon/heading/subheading → body → a 2×2 (not 4×1) info-tile grid → checklist → instructor mini-card → CTA row. The 2×2 info-tile grid is a clear "desktop 4-in-a-row → mobile 2×2" reflow.
- **Footer** collapses to a single vertical column: brand block, Follow on Facebook button, Quick Links (plain stacked text links), Contact (icon + text rows), then a bottom legal bar — no multi-column footer layout at this viewport.
- **Forum post cards** pack a lot of metadata into a tight vertical stack per card: pinned/trending badges row → avatar+name+role-badge+status-badge+category-icon-button row → star-rating+post-count+age meta row → title → excerpt → hashtag chip row → reaction/view/reply/bookmark icon row. Nothing here is hidden behind a "show more" — mobile just accepts a very tall card.
- **Post detail view** drops the global footer entirely and instead ends with a single centered "Back to Forum" outline button — a focused reading mode rather than the standard page chrome.
- **Live Updates widget** on the homepage behaves as its own self-contained mini-carousel (with its own pagination/counter "1/2") nested inside the page's overall vertical scroll — not tied to the hero carousel's pagination despite visually similar styling (green outline pill dots + counter).

## Open questions

1. **Hero carousel dot-pagination direction**: in shot 1 the 3rd dot is active while the visually centered card is "I.T. Software Development"; in shot 2 the 1st dot appears active while a different card ("120 hrs / 2,400+ enrolled") is shown. Need live-site interaction to confirm whether dots map left-to-right to slide order or the carousel loops/auto-plays in a way that decouples visual center from dot state.
2. **Drawer overlay height**: shot 9 shows the hero carousel and Live Updates banner visibly bleeding through beneath the open nav drawer. Is the drawer a fixed-height panel (not full-screen), a bottom-anchored Sheet leaving the top page visible, or was this shot capturing an open/close transition frame? Needs a clean live screenshot to confirm final resting state.
3. **Instructor accordion default state**: all 4 instructor cards appear "expanded" (Experience & Credentials visible, chevron pointing up) in sequence with no visible collapsed-card screenshot in between (except the very first moment of card 1 in shot 16, which itself might already be past a tap). Unclear if cards default to expanded and can be collapsed, or default to collapsed and the user tapped through all 4 — affects initial-render state for the rebuild.
4. **"50+ Expert Trainers" (Programs hero) vs. "4 Master Trainers" (About stats)**: these two numbers describe headcount inconsistently. Preserve both strings verbatim per their source page; do not reconcile into one number without asking the client/source.
5. **Investment price strikethrough**: Program 1 (Computer Hardware Servicing) shows "₱5,000" with a strikethrough, implying an original price crossed out for a promo, but no discounted price is shown alongside it. Program 2 (Cellphone Hardware Servicing) shows "₱5,000" plain, no strikethrough. Is this a rendering bug in the source design (an incomplete promo-price component), a genuine per-program inconsistency, or does the promo price appear in a tooltip/second line not captured in these crops? Needs the live site or a later screenshot in the corpus (Program 3, or a wider capture) to confirm.
6. **Forum post-detail URL/route**: not in the given route list (only `/forum` and `/forum/leaderboard` are documented). Likely `/forum/:postId` or a client-side modal state layered on `/forum` (note the URL bar in the Messenger browser chrome isn't legible/changing between forum-list and forum-detail shots in this slice — could not confirm either way from pixels alone).
7. **Where do Trending posts / Rating Leaderboard live on mobile?** Not observed in this 35-shot slice. Possibly under the "Trending" tab and a dedicated `/forum/leaderboard` route respectively, entirely replacing the desktop right-rail — but not directly confirmed here; later slices in the corpus should be checked.
8. **Footer's Quick Links omit "Enroll" and "Forum"** even though both are real, prominent routes (Enroll Now is the primary site-wide CTA). Confirm this is intentional editorial choice (footer as a "static pages only" index) rather than a missed link, ideally by cross-checking a later/desktop screenshot of the same footer.
9. **Background "code-bleed" artifacts** (shots 11, 13 showing faint source lines like `import { useState, useEffect } from 'react'`, `<ProgressBar value={progress}>`, `<Badge program={trainee.program}>`, `def generate_certificate(trainee_id)`, `pdf = render_template(...)`) appear to be a screenshot/compositing artifact (possibly a DevTools overlay or a prior frame bleeding through during a route-transition animation) rather than real visible UI. Flagging in case another slice shows this clearly enough to determine if it's meaningful (e.g., a code-preview easter egg) or purely an artifact to ignore.
