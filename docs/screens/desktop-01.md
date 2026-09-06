> **Note on "I.T. Software Development":** this document and the other screen
> transcriptions in `docs/screens/` are factual transcriptions of the original
> Figma reference screenshots and are left as-is — `.claude/rules/20-design-fidelity.md`
> treats them as ground truth, and rewriting a historical record to match a
> later product decision would destroy provenance. "I.T. Software Development"
> appears throughout these transcriptions only because it was one of three
> programs in that original design. The client discontinued it (2026-08-26)
> and it has since been removed from the codebase, seed data, and database.
> HardTech's actual product is the two remaining programs: Computer Hardware
> Servicing and Cellphone Hardware Servicing.

# Desktop Screenshot Spec — Slice 1 (screenshots 1–32)

Source folder: `D:\Win10_UserData\Downloads\Hardtech\Desktop\*.png`, sorted ascending by filename,
first 32 files (all timestamps `2026-07-28`, 11:24:50 PM through 11:31:08 PM).

All screenshots are the same browser window (Chrome, bookmarks bar visible) pointed at
`slot-pear-69660733.figma.site`. Browser chrome (tabs, address bar, bookmarks bar) is **not**
product UI and is excluded from the component/copy notes below except where the URL path
identifies the route.

## Summary table

| # | Filename | Route | Section / scroll position |
|---|---|---|---|
| 1 | 11.24.50 PM | `/` | Hero top: headline, live-updates card, start of Core Programs carousel |
| 2 | 11.25.04 PM | `/` | Scrolled: Core Programs carousel, "I.T. Software Development" active |
| 3 | 11.25.11 PM | `/` | "Built for Success" — why-HardTech copy + 2×3 feature grid |
| 4 | 11.25.24 PM | `/` | "What Our Graduates Say" — featured testimonial + grid start |
| 5 | 11.25.37 PM | `/` | Testimonial grid (bottom) + full site footer |
| 6 | 11.25.56 PM | `/about` | Hero: "Shaping the Next Generation of Tech Experts" + stat grid |
| 7 | 11.26.10 PM | `/about` | "From a Vision to a Movement" (Our Story) |
| 8 | 11.26.19 PM | `/about` | Mission/Vision/Philosophy 3-card row + Instructors section heading |
| 9 | 11.26.31 PM | `/about` | "Meet Your Instructors" — 4 trainer cards |
| 10 | 11.26.41 PM | `/about` | "The HardTech Advantage" — checklist of 8 items |
| 11 | 11.26.54 PM | `/forum` | Top: hero, categories rail, guidelines, first 2 posts, trending/leaderboard rail |
| 12 | 11.27.03 PM | `/forum` | Scrolled: more posts, Forum Stats card |
| 13 | 11.27.23 PM | `/forum` | Scrolled further: micro-soldering + iPhone 15 posts |
| 14 | 11.27.36 PM | `/programs` | Hero + start of "Computer Hardware Servicing" card |
| 15 | 11.27.43 PM | `/programs` | Full "Computer Hardware Servicing" program card |
| 16 | 11.27.51 PM | `/programs` | Full "Cellphone Hardware Servicing" program card |
| 17 | 11.28.00 PM | `/programs` | Full "I.T. Software Development" program card |
| 18 | 11.28.09 PM | `/gallery` | Hero "Training in Action" + stat grid + photo grid start |
| 19 | 11.28.18 PM | `/gallery` | Same page, with "Explore" nav dropdown open (overlay) |
| 20 | 11.28.32 PM | `/contact` | Hero "Get in Touch & Find Us" + 4 contact-info cards |
| 21 | 11.28.40 PM | `/contact` | "Visit Us In Person" — two embedded-map office cards |
| 22 | 11.28.59 PM | `/contact` | FAQ accordion — "certificates recognized" item open |
| 23 | 11.29.03 PM | `/contact` | FAQ accordion — "How do I enroll" item open |
| 24 | 11.29.06 PM | `/contact` | FAQ accordion — "payment methods" item open |
| 25 | 11.29.07 PM | `/contact` | FAQ accordion — "job placement assistance" item open |
| 26 | 11.29.18 PM | `/enroll` | Step 1 of 5 — "Choose Your Programs" |
| 27 | 11.30.21 PM | `/enroll` | Step 3 of 5 — "Choose Payment Method" (top) |
| 28 | 11.30.25 PM | `/enroll` | Step 3 of 5 — payment fields + empty upload dropzone |
| 29 | 11.30.44 PM | `/enroll` | Step 3 of 5 — upload filled, "Confirm Payment" enabled |
| 30 | 11.30.51 PM | `/enroll` | Step 4 of 5 — "Payment Confirmed" receipt (top half) |
| 31 | 11.30.54 PM | `/enroll` | Step 4 of 5 — receipt (bottom) + "Proceed to Verification" |
| 32 | 11.31.08 PM | `/enroll` | Step 5 of 5 — "Awaiting Admin Verification" polling state |

---

## 1. 11.24.50 PM — `/` hero top

**Layout:** Full-bleed dark hero section, centered content column, floating glass navbar pinned at
top with rounded corners (not full-width — inset from the viewport edges).

**Navbar:** Logo mark (diamond/circuit-board badge icon) + wordmark "HardTech" / "IT CORP." (two
lines, second line smaller, green). Nav links: `Home` (active, green), `About`, `Forum` (small red
notification dot top-right of the label), `Explore` (with chevron-down, indicating a dropdown).
Right side: `Login` button (outline/ghost), `Enroll Now` button (solid green, with trailing arrow
icon).

**Hero body:**
- Badge/pill: "● ENROLLMENTS OPEN — 2026" (green dot + green outlined pill)
- H1 (two lines): "Build Your Future" / "in **Modern Technology**" (second phrase in green gradient)
- Paragraph: "Get professionally trained in Computer Hardware Servicing, Cellphone Repair, and I.T.
  Software Development through immersive hands-on learning."
- CTA row: `Enroll Now →` (solid green button, arrow icon) and `Explore Programs >` (outline dark
  button, chevron icon)
- Trust row (3 items, icon + label): green check-circle "Skills-First Training", blue check-circle
  "QR Certificates", purple check-circle "Job Placement Assist"

**Floating "Live Updates" card** (top-right, overlapping hero): header row with green-dot "LIVE
UPDATES" label, "UPDATE" outlined badge, pagination controls (‹ › arrows) and "1/2" page counter.
Card body: green circular checkmark icon, title "June 2026 Batch Enrollments Now Open!", truncated
body text "New batches for all programs are accepting enrollments....", footer meta "May 25, 2026 ·
Tap to read more", thumbnail photo (PCB/circuit board) on the right edge of the card.

**Below the fold (partially visible):** eyebrow "WHAT WE OFFER", H2 "Core Programs" (green), and the
start of a Carousel: 5 slides visible (edge slides scaled down/dimmed for a 3D coverflow effect),
center/active slide = "Computer Hardware Servicing" — chip icon, title, two badges "120 hrs" (neutral
pill) and "2,400+ enrolled" (blue pill). Circular prev/next arrow buttons at the far left/right edges
of the section.

**Components:** floating glass NavigationMenu, Badge (pill x multiple), Button (solid/outline,
w/ icon), Carousel with custom coverflow scaling, Card (live-updates widget).

---

## 2. 11.25.04 PM — `/` Core Programs carousel, alternate active slide

Same hero scrolled ~150px so the navbar overlaps the hero copy. Carousel has advanced: the active
(center, enlarged, border-highlighted) slide is now **"I.T. Software Development"** — code-brackets
icon, title, badges "160 hrs" (neutral pill) and "800+ enrolled" (**amber/orange** pill this time —
badge accent color changes per program). Active slide has an amber/orange glow border versus the
first screenshot's blue-ish border on the Computer Hardware slide — confirms per-category accent
theming (hardware = blue, software = amber/orange; cellphone accent not confirmed in this slice).

Carousel dot pagination visible below the slide: 3 dots total, third dot rendered as an elongated
green pill (active state) — confirms 3 total carousel items (Computer Hardware Servicing, Cellphone
Hardware Servicing, I.T. Software Development), looping/infinite (5 DOM slides rendered for the
coverflow effect, with duplicated cards flanking the edges).

Below the carousel, the top edge of the next section's first two feature cards peek into view
(trophy icon amber card, people icon blue card) — see screenshot 3.

---

## 3. 11.25.11 PM — `/` "Built for Success"

**Layout:** two-column split. Left: eyebrow badge "◆ WHY HARDTECH" (diamond icon, green), H2 "Built
for **Success**" (Success in green), paragraph "We don't just teach — we transform. Our training
methodology is built around industry standards, real equipment, and expert mentorship.", button
"Our Story >" (outline).

Right: 2-column × 3-row grid of 6 feature Cards, each: icon in a small rounded-square colored badge,
bold title, muted description paragraph.

1. Trophy icon (amber badge) — **Completion Certificate** — "Receive a HardTech e-certificate with
   QR verification once you finish your program."
2. People icon (blue badge) — **Expert Trainers** — "Learn from working professionals with years of
   real-world industry experience."
3. Graduation-cap icon (purple badge) — **Flexible Schedules** — "Choose from multiple batch
   schedules — morning, afternoon, or weekend classes."
4. Shield icon (green badge) — **Lifetime Support** — "Access resources, alumni network, and
   community support even after graduation."
5. Lightning-bolt icon (blue badge) — **Hands-On Labs** — "Practice on real hardware and equipment
   in our fully equipped training facility."
6. WiFi icon (purple badge) — **Online Portal** — "Track progress, download materials, and connect
   with trainers through our digital platform."

**Components:** Badge (eyebrow), Button (outline), Card × 6 (icon + title + description pattern).

---

## 4. 11.25.24 PM — `/` "What Our Graduates Say" (featured testimonial)

**Layout:** centered eyebrow badge "◆ SUCCESS STORIES" (green diamond), H2 "What Our Graduates Say",
subtext "Real reviews from real graduates who transformed their careers".

**Featured testimonial Card** (full-width, large): faint decorative ribbon/medal watermark icon in
the card background (top-left), badge "🎖 Certified" (amber/gold), quote text: `"HardTech completely
transformed my career. The hands-on training was exactly what I needed. Within 2 months of
graduating, I landed a job at a major tech company. Worth every peso."` Footer row: square Avatar
with initials "MS" (green-tinted bg), name "Maria Santos" (bold), role "Hardware Technician —
TechCorp Philippines" (muted), and a right-aligned category Badge "Computer Hardware" (amber outline
pill).

**Below:** start of a 4-column grid of smaller testimonial Cards (first row of 4, headers visible):
each has its own colored "Certified" badge (green / blue / purple / amber — color varies per card,
see screenshot 5 for full text) and begins a quote.

---

## 5. 11.25.37 PM — `/` testimonial grid (bottom) + footer

**Testimonial grid, 4 cards** (full text now visible), each: colored "Certified" badge (icon = award
ribbon), quote, Avatar (colored initials), name (bold), role (muted), category Badge (green pill) at
card footer.

1. Badge "Certified" (green) — `"The best investment I ever made. The instructors are top-notch and
   the curriculum is comprehensive. I now run my own successful mobile repair shop thanks to
   HardTech."` — Avatar "JC" — **Juan dela Cruz** — Mobile Repair Specialist — chip "Cellphone Repair"
2. Badge "Certified" (blue) — `"I went from zero coding knowledge to building real applications in
   just a few months. The project-based approach made all the difference. HardTech gives you real
   skills, not just theory."` — Avatar "AR" — **Angelica Reyes** — Junior Developer — chip
   "Software Dev"
3. Badge "Certified" (purple) — `"Excellent trainers who genuinely care about your success. The
   hands-on skills I picked up at HardTech opened so many doors. My salary doubled after the
   program."` — Avatar "RL" — **Roberto Lim** — IT Support Engineer — chip "Computer Hardware"
4. Badge "Certified" (amber) — `"The micro-soldering training at HardTech is unmatched. Mr. Henry
   Gomata Lopez is incredibly knowledgeable and patient. I was hired by Samsung's authorized service
   center straight after graduation."` — Avatar "CV" — **Cristina Valdez** — Authorized Service
   Techn[ician] (name truncated in UI with ellipsis) — chip "Cellphone Repair"

Note: the "Certified" badge color does not map 1:1 to program category (e.g. two "Cellphone Repair"
cards have different badge colors) — appears to be a rotating/decorative accent, not a semantic code.
The bottom category chip is consistently a green pill regardless of badge color.

**Footer** (3-column):
- Col 1: Logo lockup "HardTech / IT CORP.", tagline "Professional IT training for tomorrow's tech
  leaders.", button "📘 Follow on Facebook" (outline pill, Facebook icon, text appears selected/
  highlighted in the screenshot — likely a hover/focus state)
- Col 2: heading "QUICK LINKS" (green, small-caps) — links: Home, About, Programs, Gallery, Contact
- Col 3: heading "CONTACT" (green, small-caps) — pin icon "673 Quirino Highway, Novaliches, QC",
  phone icon "(123) 456-7890", mail icon "hardtechitcorp@gmail.com"
- Bottom bar (full-width, separated by rule): "© 2026 HardTech IT Corp. All rights reserved.  ·
  Powered by **Prince IT Solutions**" (Prince IT Solutions styled as a green link)

---

## 6. 11.25.56 PM — `/about` hero

**Layout:** two-column. Left: eyebrow badge "◆ ABOUT HARDTECH", H1 (3 lines) "Shaping the Next
Generation of **Tech Experts**" (Tech Experts in green), paragraph "HardTech IT Corporation is a
leading provider of IT training and services. We specialize in delivering high-quality education and
support to individuals and businesses.", buttons "View Programs →" (solid green) and "Contact Us >"
(outline).

Right: 2×2 stat grid, each a Card with large green number + small-caps gray label:
- "20+" — YEARS OF EXPERIENCE
- "10,000+" — PEOPLE TRAINED
- "4" — MASTER TRAINERS
- "3" — CORE PROGRAMS

Faint code-editor-like decorative text is visible bleeding through in the page background behind the
hero (a TypeScript-ish snippet mentioning `Trainee`, `TrainingProgram`, `HardTech.loadCurriculum`,
`HardTech.certify` — appears to be a decorative/ambient background element, not literal content).

---

## 7. 11.26.10 PM — `/about` "Our Story"

**Layout:** two-column, image left / text right (within a bordered Card container).

Left: photo of a group of trainees/trainers holding certificates, with a caption bar below the image
inside the same card: bold "HardTech IT Corp." / muted "Established 2011".

Right: eyebrow badge "◆ OUR STORY", H2 "From a Vision to a **Movement**" (Movement green), three
paragraphs:
1. "HardTech IT Corp. was born from a simple conviction: *everyone deserves access to quality
   technology education.* Founded by a group of passionate engineers and educators, we set out to
   bridge the gap between classroom theory and industry reality."
2. "What started as a single room with three trainers has grown into a community of working
   technicians and developers, serving thousands of graduates across three specialized hands-on
   programs."
3. "Today, most of our 10,000+ trained learners run their own mobile, desktop, and electronics
   servicing businesses — exactly the independent, skills-first outcome HardTech was built for."

(Founding year "2011" here is worth flagging against the "20+ years of experience" stat on the
previous screenshot — see Open Questions.)

---

## 8. 11.26.19 PM — `/about` Mission/Vision/Philosophy + Instructors heading

**"Our Foundation" section:** eyebrow badge "◆ OUR FOUNDATION", H2 "Mission, Vision & **Philosophy**"
(Philosophy green). 3-column card row, each: icon (green) in a small square badge, small-caps green
label, description:
1. Target/bullseye icon — "OUR MISSION" — "To empower individuals and businesses through innovative
   electronic devices servicing and software development."
2. Eye icon — "OUR VISION" — "A future where people have knowledge on hardware servicing and I.T.
   software development."
3. Heart icon — "OUR PHILOSOPHY" — "Learning happens through doing — every lesson is grounded in
   real-world practice and industry tools."

**Next section heading (top of viewport, partially into view):** eyebrow badge "◆ EXPERT TRAINERS",
H2 "Meet Your **Instructors**" (Instructors green), subtext "The four working professionals leading
every HardTech session — not just academics".

Same decorative code-snippet background text bleeds through behind the section (ambient, not literal
content).

---

## 9. 11.26.31 PM — `/about` "Meet Your Instructors"

4-column grid of instructor Cards, each: square Avatar (initials, dark bg, green border), name
(bold), role Badge (green outline), horizontal rule, bio paragraph, horizontal rule, "Experience &
Credentials" row with a chevron-down (Accordion trigger — collapsed in all 4 cards here), and a
"Facebook Profile" pill/Button (blue-tinted) at the card's bottom edge.

1. Avatar "HL" — **Mr. Henerosalio "Henry" G. Lopez** — badge "Owner & President" — "Founder of
   HardTech IT Corp with over two decades of hands-on expertise in advanced mobile board-level
   servicing. He leads the school's most technical sessions covering micro-soldering, chip-level
   diagnostics, and complex hardware fault resolution."
2. Avatar "AS" — **Prof. Adelan "Dylan" P. Sistoso** — badge "Vice President" — "Vice President of
   HardTech IT Corp and owner of Prince IT Solutions. A Licensed Professional Teacher holding NC II
   and NC III credentials in web development and visual graphic design, he brings both pedagogical
   rigor and real-world software expertise to every class."
3. Avatar "JF" — **Mr. Jammy "Jam" S. Furagganan** — badge "Trainer" — "Certified trainer holding a
   National Certificate III in Mobile Phones and Handheld Gadgets Servicing. He guides trainees
   through hands-on device teardown, component testing, and systematic fault-finding workflows used
   in professional repair centers."
4. Avatar "AM" — **Mr. Arl Mazz** — badge "Trainer" — "A veteran practitioner with over two decades
   in mobile phone repair, specializing in Android system-level troubleshooting. His deep field
   experience gives trainees practical insight into real-world repair scenarios beyond the
   classroom."

Each card's "Facebook Profile" link corresponds to the real staff Facebook handles noted in the
design source doc (`henry.gomata.lopez`, `Dongdylan`, `jamfu199`, `arl.mazz`).

---

## 10. 11.26.41 PM — `/about` "The HardTech Advantage"

**Layout:** two-column. Left: eyebrow badge "◆ WHY CHOOSE US", H2 "The HardTech **Advantage**"
(Advantage green), paragraph "We don't just certify — we transform careers. Here's why thousands of
students trust us.", button "Join HardTech →" (solid green).

Right: vertical stack of 8 checklist row-Cards, each a full-width dark rounded rectangle with a green
check-circle icon + left-aligned text:
1. Skills-first training — no prior credentials required
2. Hands-on training with professional-grade equipment
3. Expert trainers with real industry backgrounds
4. Small class sizes for personalized attention
5. Auto-generated e-certificates with QR verification
6. Business-starter guidance for graduates opening their own shop
7. Flexible scheduling: morning, afternoon, and weekend
8. Lifetime alumni access and community support

---

## 11. 11.26.54 PM — `/forum` top

**Hero:** badge "COMMUNITY" (pill), H1 "Community Forum" (green), subtext "Discuss, share knowledge,
and grow together with the HardTech community". Top-right: button "Sign in to Post" (outline).

**Toolbar row:** Search Input (icon + placeholder "Search posts, authors, or tags..."), Select/
dropdown "↕ Newest ⌄" (sort control) at far right.

**Tabs:** "All Posts" (active/filled pill), "Trending", "Communities", "Bookmarks". Below the tabs:
"6 posts" count label.

**Left rail:**
- Card "CATEGORIES": "All Categories" row (count "6", currently selected/highlighted green), then:
  General Discussion (1), Q&A Help (1), Resources & Tips (1), Troubleshooting (1), Career & Jobs (1),
  Announcements (1) — each row has a leading icon + trailing count Badge.
- Card "GUIDELINES" (shield icon header), numbered list 1–5: "Be respectful and professional", "Stay
  on-topic for IT training", "No spam or self-promotion", "Cite your sources", "Trainee posts require
  approval".
- Card "FORUM STATS" (bar-chart icon header) — heading visible, values cut off below the fold (see
  screenshot 12).

**Center column — post cards:**
1. Badges "📌 PINNED" + "📈 TRENDING" (both amber). Author row: Avatar "HA", **HardTech Admin**, role
   Badge "ADMIN" (amber), status Badge "ACTIVE" (green), star rating "★★★★☆ 4.8 (4)", "🗎 4 posts",
   "434d ago". Category chip top-right: "⚑ Announcements". Title: "Welcome to the HardTech Community
   Forum! 🎉". Excerpt: "We're thrilled to launch the official HardTech IT Corp community forum — a
   dedicated space for trainees, trainers, and graduates to connect, share knowledge, and grow
   together. What you can do here: -…" (truncated). Hashtags: `#welcome #community #guidelines`.
   Footer icons: 👍 3, ↻ (repost?), 💡, 👁 312, 💬 "0 replies", 🔖 bookmark.
2. Author row: Avatar "LC", **Liza Cruz**, role Badge "TRAINEE" (green), status Badge "NEWCOMER"
   (gray), rating "★★★★★ 5.0 (2)", "🗎 2 posts", "428d ago". Category chip: "General Discussion".
   Title: "I completed my first solo motherboard-level repair! 🙌". Excerpt: "Just wanted to share
   this with the community — I successfully diagnosed and repaired a dead iPhone 12 motherboard
   completely on my own today, no trainer hovering! The device came in with no power and …" Hashtags:
   `#success-story #iphone-12 #motherboard #ic-repair`. Footer: 👍1, 💡1, 👁92, 💬 "2 replies", 🔖.

**Right rail:**
- Card "📈 TRENDING": numbered list 1–5 (orange numerals), each a post title (truncated to ~2 lines):
  1. "Welcome to the HardTech Community Forum! 🎉"
  2. "Micro-soldering starter toolkit — what you actually need vs. what's nice to have"
  3. "Repair Shop Hiring — Mandaluyong & BGC (May 2026)"
  4. "I completed my first solo motherboard-level repair! 🙌"
  5. "How do I safely remove an iPhone 15 screen without damaging Face ID?"
- Card "⭐ RATING LEADERBOARD": ranked rows with medal icon (gold/silver/bronze for #1–3, plain "#4"
  numeral for lower ranks), Avatar, name, star-rating pill (colored Badge, e.g. green "5.0★"):
  🥇 Mr. Henry G[omata Lopez]… — ★★★★★ (4) — 5.0★
  🥈 Liza Cruz — ★★★★★ (2) — 5.0★
  🥉 HardTech A[dmin]… — ★★★★☆ (4) — 4.8★
  #4 Carlos Reyes — (partially cut off, continues next screenshot)

---

## 12. 11.27.03 PM — `/forum` scrolled

Continues the center column with 2 more posts, and reveals the left-rail "FORUM STATS" values and
more of the right-rail leaderboard.

1. Author row: Avatar "HA", **HardTech Admin**, ADMIN/ACTIVE badges, ★★★★☆ 4.8 (4), 4 posts, "429d
   ago". Category chip: "💼 Career & Jobs". Title: "Repair Shop Hiring — Mandaluyong & BCC (May
   2026)". Excerpt: "We've received several job referrals from partner employers this month. See the
   openings below. TechFixPH — SM Megamall Mandaluyong - Position: Junior Mobile Technician - Rate:
   ₱18,000–₱22,000/month +…" Hashtags: `#jobs #hiring #mandaluyong #bgc #career`. Footer: 👍1, 💬1,
   👁148, 💬 "0 replies".
2. Author row: Avatar "JD", **Juan Dela Cruz**, badges TRAINEE (green) / NEWCOMER (gray), ★★★☆☆ 3.0
   (1), 1 posts, "430d ago". Category chip: "🔧 Troubleshooting". Title: "Samsung Galaxy S23 not
   charging after ultrasonic cleaning — board issue or connector?". Excerpt: "Took in a
   water-damaged S23 last week. After disassembly and ultrasonic cleaning with IPA solution, the
   board looks clean under a microscope — no visible corrosion remaining. Problems now: - Doesn't
   c…" Hashtags: `#samsung #s23 #water-damage #usb-c #charging`. Footer: 👁63, 💬 "1 reply".

**Left rail "FORUM STATS" card** (fully visible): Posts 6, Replies 9, Total Views 906, Members 6.

**Right rail leaderboard** now shows: #4 Carlos Reyes ★★★★☆ (2) 4.0★, #5 Maria Santos ★★★★☆ (1)
4.0★.

---

## 13. 11.27.23 PM — `/forum` scrolled further

1. Badge "📈 TRENDING" (amber). Author row: Avatar "HL", **Mr. Henry Gomata Lopez**, badges TRAINER
   (blue) / ACTIVE (green), ★★★★★ 5.0 (4), "5 posts", "431d ago". Category chip: "📖 Resources &
   Tips". Title: "Micro-soldering starter toolkit — what you actually need vs. what's nice to have".
   Excerpt: "After two years of hands-on micro-soldering work, here's an honest breakdown of what you
   truly need vs. what the YouTube channels make you think you need. Non-negotiables (Day 1
   purchases): - Hakko FX…" Hashtags: `#micro-soldering #tools #beginners #resources`. Footer: 👍2,
   💡1, 👁204, 💬 "3 replies".
2. Badge "📈 TRENDING". Author row: Avatar "CR", **Carlos Reyes**, badges TRAINEE (green) / NEWCOMER
   (gray), ★★★★☆ 4.0 (2), "2 posts", "432d ago". Category chip: "❓ Q&A Help". Title: "How do I safely
   remove an iPhone 15 screen without damaging Face ID?". Excerpt: "Hi everyone! I'm working on my
   first iPhone 15 screen replacement and I'm a bit nervous about the Face ID flex cables underneath
   the display assembly. My main concerns: 1. Where exactly are the Face I…" Hashtags: `#iphone-15
   #screen-replacement #face-id`. Footer: 👁87, 💬 "3 replies".

Left/right rails unchanged from screenshot 12 (categories, guidelines, forum stats / trending,
leaderboard).

---

## 14. 11.27.36 PM — `/programs` hero

**Hero:** eyebrow badge "◆ TRAINING PROGRAMS", H1 "Our Core **Programs**" (Programs green), subtext
"Practical, industry-aligned training programs designed to build real skills and launch your
technology career — no prior credentials required." Trust row (icon + label): "🎖 Skills-First
Training", "👥 50+ Expert Trainers", "⚡ Hands-On Labs".

**First program Card begins** (image left / content right): image badge "SKILLS TRAINING" (green
pill) over a photo of a computer-repair classroom (monitors on a bench, "NO SMOKING" sign). Content
side: chip icon (green), H3 "Computer Hardware Servicing", subtitle "Become a Certified Hardware
Technician" (green), description: "Master computer assembly, repair, maintenance, and advanced
diagnostics. This program covers everything from basic component identification to enterprise-level
hardware troubleshooting and network infrastructure basics." Info grid (2×2), each cell icon + label +
value: 🕐 DURATION "3 Months (120 hrs)", 📅 SCHEDULE "Mon–Fri | 8AM–12PM", ⚡ LEVEL "Beginner to
Professional", 💲 INVESTMENT "₱5,000".

---

## 15. 11.27.43 PM — `/programs` Computer Hardware Servicing (full card)

Same card as screenshot 14, fully in view, continuing with:

**COURSE MODULES** (green heading) — checklist (green check-circles):
- Computer Hardware Components & Architecture
- OS Installation & Configuration
- Troubleshooting & Diagnostics
- Network Cabling & Infrastructure
- Data Recovery & Backup Systems
- Final Skills Assessment

**Trainer row:** person icon + "Prof. Adelan P. Sistoso" / "EDPSE · LPT · MAEd | Network & Systems
Servicing".

**Buttons:** "Enroll Now →" (solid green, full-width-ish) + "Inquire" (outline).

---

## 16. 11.27.51 PM — `/programs` Cellphone Hardware Servicing (full card)

Layout **mirrors** the previous card (content left / image right this time — cards appear to
alternate image side). Image badge "SKILLS TRAINING" (green pill) over a photo of two men at a
micro-soldering workstation in front of a "HARDTECH" banner.

Content: phone icon, H3 "Cellphone Hardware Servicing", subtitle "Master Mobile Device Repair"
(green), description: "Learn professional mobile device repair covering teardown, diagnosis,
micro-soldering, and software flashing. Gain skills for Android and iOS devices from basic glass
replacement to advanced board repair." Info grid: 🕐 DURATION "2 Months (80 hrs)", 📅 SCHEDULE
"Mon–Fri | 1PM–5PM", ⚡ LEVEL "Beginner to Intermediate", 💲 INVESTMENT "₱5,000".

**COURSE MODULES:**
- Mobile Device Architecture & Teardown
- Display & Touch Panel Replacement
- Micro-soldering Techniques
- Battery & Charging Systems
- Software Flashing & Unlocking
- Business Operations & Pricing

**Trainer row:** "Mr. Henry Gomata Lopez" / "Owner & Lead Trainer · 20+ yrs Mobile Servicing".

**Buttons:** "Enroll Now →" (solid green) + "Inquire" (outline).

---

## 17. 11.28.00 PM — `/programs` I.T. Software Development (full card)

Layout matches screenshot 15's orientation (image left / content right). Image badge **"INDUSTRY
CERT"** (green pill — different label text than the other two cards' "SKILLS TRAINING") over a photo
of two trainees at a dev workstation in front of the "HARDTECH" banner.

Content: code-brackets icon, H3 "I.T. Software Development", subtitle "Build Real-World
Applications" (green), description: "A comprehensive software development training covering web
development, programming fundamentals, database management, and modern frameworks. Build a portfolio
of real-world projects you can show to employers." Info grid: 🕐 DURATION "6 Months (160 hrs)", 📅
SCHEDULE "Mon–Sat | 8AM–12PM", ⚡ LEVEL "Beginner to Advanced", 💲 INVESTMENT "₱5,000".

**COURSE MODULES:**
- Programming Fundamentals (Python & JS)
- HTML, CSS & Responsive Web Design
- React & Modern Frontend Frameworks
- Node.js & Backend Development
- Database Design (SQL & NoSQL)
- Portfolio Project & Career Coaching

**Trainer row:** "Prof. Adelan P. Sistoso" / "EDPSE · LPT · MAEd | Owner, PRINCE IT Solutions".

**Buttons:** "Enroll Now →" (solid green) + "Inquire" (outline).

(Note: this is the same trainer as the Computer Hardware Servicing program but with a different
credential line — "Owner, PRINCE IT Solutions" here vs. "Network & Systems Servicing" on the hardware
card. Both are presumably accurate per-program bios for the same person.)

---

## 18. 11.28.09 PM — `/gallery` hero + stats

**Hero:** eyebrow badge "◆ GALLERY", H1 "Training in **Action**" (Action green), paragraph "Real
moments from our training sessions, workshops, and graduation ceremonies. Every photo tells the story
of someone building their future." Right: 2×2 stat grid (Cards): 📷 "500+ Photos", 👥 "10,000+ People
Trained", 🎖 "50+ Ceremonies", ⚡ "20+ Years of Training".

**Photo grid begins** below: 3-column grid of raw training-session photographs (group photos at
workstations, no captions visible in this crop).

---

## 19. 11.28.18 PM — `/gallery` Explore dropdown open

Same page/scroll position as screenshot 18, but the **"Explore" nav item's dropdown is open**
(chevron flipped to point up). This is the definitive reference for the Explore menu structure — a
dark rounded panel anchored under the nav item, containing 4 rows, each: icon in a small
rounded-square badge, bold title, muted one-line description. Current page is highlighted (green
text/icon):

1. 📖 icon — **Programs** — "Our training courses"
2. 🖼 icon — **Gallery** — "Training facility photos" *(current page — highlighted green)*
3. 📍 icon — **Contact & Location** — "Find us & get in touch"
4. ❓ icon — **User Guide** — "Manual & interactive tour"

This confirms `/help` (the "User Guide" route from the known route map) is reached via this Explore
menu, and that `/gallery` and `/contact` are also grouped here rather than as top-level nav items.

---

## 20. 11.28.32 PM — `/contact` hero

**Hero:** eyebrow badge "◆ CONTACT & LOCATION", H1 "Get in Touch & **Find Us**" (Find Us green),
subtext "Have questions about our programs? Visit us at either of our two locations or reach out
through any of our contact channels."

**4-card row**, each icon + bold label + 2 lines of detail:
1. 📞 "Call Us" — "(123) 456-7890" (green/link-colored) — "Mon–Fri 9AM–5PM"
2. ✉️ "Email Us" — "hardtechitcorp@gmail.com" (green) — "Reply within 24hrs"
3. 🏢 "Main Office" — "673 Quirino Hwy" — "Novaliches, Quezon City"
4. 📍 "Branch Office" — "Batasan Rd, QC" — "Quezon City, Metro Manila"

Below: eyebrow badge "◆ OUR OFFICES", H2 "Visit Us **In Person**" (In Person green), and the top
edge of two embedded Google Maps beginning.

---

## 21. 11.28.40 PM — `/contact` "Visit Us In Person" (maps)

Two side-by-side map Cards, each: embedded Google Map (with a red pin) + "Open in Maps ↗" link
overlay top-left, a colored label pill bottom-left of the map ("MAIN OFFICE" / "BRANCH OFFICE", green
pill), then below the map an address block (icon + text rows): pin+address, phone+number,
mail+email, clock+hours, and a full-width "Get Directions ➹" Button (solid green) at the card's
bottom.

- **Main Office:** 673 Quirino Highway, Novaliches, Quezon City, Metro Manila · (123) 456-7890 ·
  hardtechitcorp@gmail.com · Mon–Fri 9:00 AM – 5:00 PM
- **Branch Office:** M3QV+MM5, Batasan Rd, Quezon City, Metro Manila · (0987) 654-3210 ·
  hardtechitcorp@gmail.com · Mon–Fri 9:00 AM – 5:00 PM

(Browser status bar shows a hover-preview URL `https://maps.google.com/?q=Batasan+Road+Quezon+City+
Metro+Manila` — confirms "Get Directions" is a plain outbound link to Google Maps, not an in-app
modal.)

---

## 22. 11.28.59 PM — `/contact` FAQ — "certificates" open

**Section:** eyebrow badge "◆ FAQ", H2 "Frequently Asked **Questions**" (Questions green). Accordion,
4 items, single-open behavior (opening one appears to close others — confirmed across screenshots
22–25, each shows exactly one item expanded):

1. "How do I enroll in a program?" (collapsed, chevron down)
2. "What payment methods do you accept?" (collapsed, chevron down)
3. **"Are the certificates recognized by employers?"** (expanded, chevron up) — answer: "Our
   certificates are skills-based credentials issued by HardTech IT Corp, not a government
   accreditation. They document the hands-on competencies you mastered during the program, include QR
   verification, and pair best with a portfolio of work you complete in class — which is what
   employers in mobile, desktop, and other servicing roles look at most."
4. "Do you offer job placement assistance?" (collapsed, chevron down)

---

## 23. 11.29.03 PM — `/contact` FAQ — "How do I enroll" open

Same Accordion, item 1 now expanded instead: **"How do I enroll in a program?"** — answer: "You can
enroll online through our website by clicking "Enroll Now" and filling out the registration form. You
may also visit any of our campuses in person. Our admissions team will guide you through the
process."

A small floating **page-thumbnail/minimap widget** appears in the bottom-right corner of the viewport
for the first time in this slice — a miniature rendering of the full page with a white outline box
marking the current viewport position. (See Open Questions — likely Figma Make's own site-chrome
rather than product UI.)

---

## 24. 11.29.06 PM — `/contact` FAQ — "payment methods" open

Item 2 expanded: **"What payment methods do you accept?"** — answer: "We accept GCash, Maya,
credit/debit cards, and bank transfers. We also offer installment payment plans for eligible
enrollees. Contact our admissions office for details on financing options." Minimap widget still
present, bottom-right.

---

## 25. 11.29.07 PM — `/contact` FAQ — "job placement" open

Item 4 expanded: **"Do you offer job placement assistance?"** — answer: "Most of our graduates choose
to open their own mobile, desktop, or electronics servicing business rather than seek employment. We
support that path with business-starter guidance — tooling checklists, pricing advice, supplier
intros, and ongoing alumni mentorship from our master trainers." Minimap widget present.

---

## 26. 11.29.18 PM — `/enroll` Step 1 of 5

**Header:** small-caps centered label "ONLINE ENROLLMENT PORTAL". Below it, a horizontal 5-step
Stepper with connecting line: circular icon nodes for **Select Plan** (open-book icon, active/green
ring+fill), **Sign Up** (person icon, inactive/gray), **Payment** (card icon, inactive), **Receipt**
(receipt icon, inactive), **Verification** (shield icon, inactive). Step label text under each node.

**Card container:** badge "STEP 1 OF 5" (green pill), H2 "Choose Your Programs", subtext "Pick one or
more programs — combine 2 or 3 if you want to learn multiple tracks."

3 selectable program rows (each a bordered Card with a radio-style circle control at the far right,
all unselected in this screenshot):
1. Green chip icon — badge "Skills Track" (green) — **Computer Hardware Servicing** — meta "🕐 40 hrs
   / 5 weeks  📅 Mon–Fri, 8AM–12PM  [Certified]" — price "₱5,000" (green, right-aligned)
2. Blue phone icon — badge "Skills Track" (blue) — **Cellphone Hardware Servicing** — meta "40 hrs /
   5 weeks, Mon–Fri, 1PM–5PM, Certified" — price "₱5,000"
3. Purple document icon — badge "Skills Track" (purple) — **I.T. Software Development** — meta "80
   hrs / 10 weeks, Mon–Fri, 8AM–5PM, Certified" — price "₱5,000"

Note: durations/schedules here (40 hrs/5 weeks, 40 hrs/5 weeks, 80 hrs/10 weeks) are shorter than the
full-program durations on `/programs` (120/80/160 hrs) — this enrollment step may represent a
shorter "module" or "batch" cycle rather than the full program; flagged in Open Questions.

**Footer button:** "Continue >" (green, rendered in a muted/lower-opacity state — likely disabled
until a program is selected).

---

## 27. 11.30.21 PM — `/enroll` Step 3 of 5 (payment method, top)

(Note: the browser address bar in this and subsequent enroll screenshots shows stray text
"asdasdad1122bb@Z" — this is the tester's own omnibox input, unrelated to the app; ignore.)

Stepper now shows Select Plan / Sign Up / Payment as completed (green), Receipt/Verification still
pending (exact checkmark rendering cut off above the fold, inferred from screenshot 30's fully-visible
stepper).

**Card:** badge "STEP 3 OF 5", H2 "Choose Payment Method", subtext "Select how you would like to pay
your enrollment fee."

**Order summary box:** "Enrolling in" / "Computer Hardware Servicing" — "₱5,000", and a large total
"₱5,000" (green) below it.

**Payment method selector** — 2×2 grid of selectable Cards (radio-style, selected state = blue ring +
filled blue checkmark circle):
1. 📱 **GCash** — "Instant transfer" — **selected**
2. 💳 **Maya** — "Instant transfer" — unselected
3. 🏦 **Bank Transfer** (amber icon) — "BDO, BPI, Metrobank" — unselected
4. 💳 **Credit / Debit Card** (green icon) — "Visa / Mastercard" — unselected

**"Send payment to:" section begins** below (heading only, fields continue in screenshot 28).

---

## 28. 11.30.25 PM — `/enroll` Step 3 of 5 (payment fields + empty upload)

**"Send payment to:" field rows** (each a read-only row with a copy-to-clipboard icon button):
- Number: **0917-123-4567**
- Account Name: **HardTech IT Corp**
- Amount: **₱5,000**
- Reference: **HT-ENR-549502**

**Warning callout** (amber icon + tinted box): "Include the Reference No. in your payment remarks so
we can match your payment quickly."

**"Upload Proof of Payment" section:** heading + description "Screenshot or photo of your GCash
payment receipt. The admin will check this before approving." Dropzone (dashed border, upload-cloud
icon): "Click to upload screenshot" / "PNG or JPG · up to 5 MB".

**Footer buttons:** "< Back" (outline) + "Confirm Payment >" (green, muted/disabled-looking state).

---

## 29. 11.30.44 PM — `/enroll` Step 3 of 5 (upload filled)

Same section, but the dropzone now shows an **uploaded image preview** (a scanned delivery-receipt
document, clearly test/placeholder QA content — not real product copy) with filename caption "ChatGPT
Image Jul 3, 2026, 04_32_08 PM (1).png" and a "🗑 Remove" button (red outline) beside it. "Confirm
Payment >" is now fully bright/enabled, confirming the button's disabled→enabled transition is gated
on a file being attached.

---

## 30. 11.30.51 PM — `/enroll` Step 4 of 5 (Payment Confirmed, top)

**Stepper:** Select Plan / Sign Up / Payment all show green filled checkmark circles; **Receipt** is
now the active node (green ring, receipt icon); Verification still gray/inactive.

**Card:** badge "STEP 4 OF 5", H2 "Payment Confirmed", subtext "Here is your official receipt — save
a copy for your records."

**Success banner** (green-tinted full-width bar, checkmark icon): "Payment received successfully".

**Receipt card:** header row "🧾 OFFICIAL RECEIPT" + date "7/28/2026" (right-aligned). Field rows
(label left / value right):
- Reference No. — **HT-ENR-549502** (green)
- Trainee — "asda z" *(test/QA input, not real placeholder copy)*
- Email — "Jz@gmail.com" *(test input)*
- Phone — "1" *(test input)*
- Program — **Computer Hardware Servicing**
- Schedule — **Mon–Fri, 8AM–12PM**
(continues below the fold — see screenshot 31)

---

## 31. 11.30.54 PM — `/enroll` Step 4 of 5 (receipt bottom)

Continuation of the same receipt card:
- Payment Method — **GCash**
- Amount Paid — **₱5,000.00** (green)
- Status — **"PAID — Pending Verification"** (green)

**Button:** "⬇ Download Receipt" (outline, full-width).

**Info callout** (green-tinted, shield icon): "Your payment has been recorded. Next, an administrator
will verify your enrollment in real time before granting account access."

**Footer buttons:** "< Back" (outline) + "Proceed to Verification >" (solid green).

---

## 32. 11.31.08 PM — `/enroll` Step 5 of 5 (Awaiting Admin Verification)

Label "STEP 5 OF 5" (centered, green pill). Large circular **loading spinner** (amber/orange ring
with an animated partial-arc). H2 "**Awaiting Admin Verification...**" (amber/orange). Bold subtext
"An administrator is reviewing your payment". Paragraph: "This usually takes only a few seconds.
Please keep this page open — we'll grant you account access as soon as your payment is confirmed."

**Progress checklist** (5 sequential items, top 3 done / bottom 2 pending):
- ✓ Payment received & logged (green check)
- ✓ Receipt generated (green check)
- ✓ Admin notified in real time (green check)
- ⟳ Enrollment verified by admin (gray spinner/pending icon)
- ⟳ Account access granted (gray spinner/pending icon)

**Reference box:** small-caps label "REFERENCE NUMBER" + large green value "HT-ENR-549502".

**Footer buttons:** "Enter My Account >" (green, muted/disabled-looking — presumably enabled only
after admin verification completes) + "Back to Home" (outline).

This screen is a real-time/polling wait-state — behaviorally significant: it implies the backend
processes enrollment verification asynchronously (admin action elsewhere flips this state), matching
an outbox/notify-then-poll pattern rather than a synchronous response.

---

## Components observed in this slice

- **Floating glass Navbar** — logo, active-link highlighting, notification-dot badge on "Forum",
  `Explore` trigger for a dropdown/mega-menu (icon + title + description rows, current-page
  highlight)
- **Badge** — countless pill variants: status pills ("ENROLLMENTS OPEN — 2026", "LIVE UPDATES",
  "UPDATE", "PINNED", "TRENDING"), role badges (ADMIN/TRAINEE/TRAINER), state badges (ACTIVE/
  NEWCOMER/Certified), category chips (Announcements, Troubleshooting, Career & Jobs, etc.), track
  badges ("Skills Track", "SKILLS TRAINING", "INDUSTRY CERT"), step badges ("STEP X OF 5"), rating
  pills (colored, e.g. "5.0★")
- **Button** — solid green (primary), outline/ghost (secondary), with leading/trailing icons; visibly
  disabled/muted low-opacity state used for gated CTAs (Continue, Confirm Payment, Enter My Account)
- **Card** — used pervasively: feature cards, stat cards, testimonial cards, program cards, forum
  post cards, instructor cards, FAQ items, contact-info cards, map cards, payment-method selector
  cards, program-selector cards, receipt card
- **Carousel** — homepage "Core Programs" 3D coverflow carousel with prev/next circular arrow buttons
  and dot pagination (active dot = elongated green pill)
- **Avatar** — square, initials-based, colored background/border, used for testimonials, forum
  authors, leaderboard, instructors
- **Tabs** — forum "All Posts / Trending / Communities / Bookmarks"
- **Accordion** — FAQ page (single-open behavior confirmed); Instructor card "Experience &
  Credentials" (collapsed in this slice, not seen expanded)
- **Stepper/Progress** (custom, not a shadcn primitive but composed from Badge + connecting lines) —
  5-step enrollment flow with icon nodes, connecting line, and checkmark-on-complete state
- **Input** — forum search bar with leading icon + placeholder
- **Select/DropdownMenu** — forum sort control ("Newest"); nav "Explore" menu
- **Radio-style selection cards** — program picker (Step 1) and payment-method picker (Step 3), both
  a bordered Card wrapping a circular selection indicator rather than a bare shadcn RadioGroup
- **File upload / Dropzone** — custom styled file input with icon, helper text, file-type/size
  constraint text, and an uploaded-file preview + Remove button state
- **Alert/Callout** — amber warning box (reference-number reminder), green info box (post-payment
  reassurance)
- **Table** — not observed in this slice
- **Dialog/Sheet** — not observed in this slice (Explore menu behaves like a dropdown/mega-menu, not
  a modal)
- **Tooltip** — not clearly observed (only a browser link-hover status bar, which is not product UI)
- **Skeleton / Sonner toast / Chart (recharts)** — not observed in this slice; expected on
  dashboard-related screens outside this slice per the design source doc

## Open questions

1. **Bottom-right floating minimap/page-thumbnail widget** (first appears at 11.29.03 PM, persists
   through the rest of the FAQ and receipt screens): is this real product UI (e.g., a scroll-position
   affordance) or is it Figma Make's own published-site chrome that should **not** be reproduced in
   the rebuild? Recommend treating it as non-product chrome unless another slice shows it behaving
   interactively.
2. **Carousel accent color per program:** confirmed Computer Hardware Servicing = blue accent/badge,
   I.T. Software Development = amber/orange accent/badge. Cellphone Hardware Servicing's active-state
   accent color was not visible as the centered/active carousel slide in this slice — check other
   slices to confirm (a green or pink/rose accent would be a reasonable guess given the enroll-flow
   icon uses blue for this program there, which conflicts with a naive "one distinct color per
   category" assumption — needs visual confirmation).
3. **"Certified" badge color on testimonial cards** varies (green/blue/purple/amber) without an
   obvious rule tied to program category (e.g. two "Cellphone Repair" cards use different colors).
   Confirm whether this is purely decorative/rotating or tied to some other attribute (e.g. rating
   tier, certification level) not visible in static screenshots.
4. **Enroll flow "Sign Up" step (Step 2 of 5)** was not captured in this slice — the flow jumps from
   Step 1 ("Choose Your Programs") directly to Step 3 ("Choose Payment Method") because the source
   screenshots were taken out of sequence. Form fields, validation, and copy for Sign Up are unknown
   from this slice and must come from another slice.
5. **Program duration/schedule mismatch:** `/programs` lists Computer Hardware Servicing as "3 Months
   (120 hrs)" but the `/enroll` Step 1 program-selector shows the same program as "40 hrs / 5 weeks."
   Likewise Cellphone (`/programs` "2 Months / 80 hrs" vs. enroll "40 hrs / 5 weeks") and Software Dev
   (`/programs` "6 Months / 160 hrs" vs. enroll "80 hrs / 10 weeks"). This may represent distinct
   "full program" vs. "enrollment batch/module" concepts, or may be a content inconsistency in the
   source site itself — flag for the builder rather than silently reconciling.
6. **Test/dummy data in the enroll flow** (Trainee "asda z", Email "Jz@gmail.com", Phone "1", and an
   uploaded "GOLDENSTARS PACKAGING" delivery-receipt scan as the payment-proof image) is clearly the
   original tester's scratch input captured mid-QA, not real placeholder copy — do not reproduce
   these literal values as product content; only the field labels/structure/layout around them are
   spec-worthy.
7. **Founding-year inconsistency:** About page "Our Story" card says "Established 2011" while the
   hero stat block on the same page says "20+ Years of Experience" (2011→2026 is 15 years, not 20+).
   Flag for the builder rather than silently correcting.
8. Login, Forgot Password, Dashboard (all 3 roles), Communities, and Forum Leaderboard routes are not
   present in this slice — expected to be covered by other slices in the corpus.
