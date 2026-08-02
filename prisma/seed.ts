// HardTech IT Corp — marketing content seed.
//
// Owned by the DATA role (docs/contracts/wave-1-marketing.md). Real content
// transcribed from docs/screens/desktop-01.md, docs/screens/mobile-01.md,
// docs/screens/mobile-02.md, docs/screens/mobile-06.md, and
// docs/research/01-design-source.md — not lorem ipsum. Every block below
// that is NOT literally sourced from a screenshot says so in a comment.
//
// Runs via `tsx prisma/seed.ts` (prisma.config.ts `migrations.seed`).
// Constructs its own PrismaClient with the pg driver adapter per
// .claude/rules/40-prisma-7.md — `datasourceUrl` does not exist in Prisma 7,
// and src/server/db.ts is reserved for the app runtime's own client.
//
// Idempotent: every write is either an `upsert` keyed on a real unique
// column the schema declares (User.email, Program.name,
// TrainerProfile.userId, PaymentMethodConfig.method), or — for the three
// flat marketing tables that the schema deliberately has no natural unique
// key for (see docs/adr/0001-data-model.md §7 open question 5:
// GalleryPhoto, Testimonial, Faq, plus ProgramCurriculumTopic which is
// scoped per-program) — a delete-then-recreate of the exact same rows,
// which converges to the same final state no matter how many times it runs.

import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DIRECT_URL (or DATABASE_URL) is not set. Copy .env.example to .env and fill in " +
      "the Supabase connection strings before running the seed.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/**
 * Seed accounts are never meant to authenticate through the real login flow
 * in wave 1 — this only exists to satisfy the non-null `passwordHash`
 * column. Never logged, never returned (.claude/rules/00-non-negotiables.md
 * rule 6).
 */
function hashSeedPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }).toString("base64url");
  return `scrypt$v=1$n=16384$r=8$p=1$l=64$${salt}$${hash}`;
}

// ---------------------------------------------------------------------------
// Trainers — the 4 named staff on /about (desktop-01 #9, mobile-01 #16-20).
// Facebook handles from docs/research/01-design-source.md. Emails are not
// not shown in screenshots; they are seed-only login identifiers following an
// obvious institutional pattern, not sourced content.
// ---------------------------------------------------------------------------

const TRAINERS = [
  {
    key: "henry",
    email: "trainer@gmail.com",
    firstName: "Henry Gomata",
    lastName: "Lopez",
    title: "Owner & President",
    bio: "Founder of HardTech IT Corp with over two decades of hands-on expertise in advanced mobile board-level servicing. He leads the school's most technical sessions covering micro-soldering, chip-level diagnostics, and complex hardware fault resolution.",
    credentials: [
      "20+ years — Advanced Mobile Board-Level Servicing",
      "Advanced Mobile Servicing",
      "Board-Level Repair",
      "Micro-Soldering & Diagnostics",
    ],
    facebookUrl: "https://facebook.com/henry.gomata.lopez",
    primaryProgramKey: "cellphone",
  },
  {
    key: "dylan",
    email: "adelan.sistoso@hardtechitcorp.com",
    firstName: "Adelan",
    lastName: "Sistoso",
    title: "Vice President",
    bio: "Vice President of HardTech IT Corp and owner of Prince IT Solutions. A Licensed Professional Teacher holding NC II and NC III credentials in web development and visual graphic design, he brings both pedagogical rigor and real-world software expertise to every class.",
    credentials: [
      "Licensed Professional Teacher (LPT)",
      "CSS NC II",
      "Web Development NC III",
      "Visual Graphic Design NC III",
    ],
    facebookUrl: "https://facebook.com/Dongdylan",
    primaryProgramKey: "software",
  },
  {
    key: "jam",
    email: "jammy.furagganan@hardtechitcorp.com",
    firstName: "Jammy",
    lastName: "Furagganan",
    title: "Trainer",
    bio: "Certified trainer holding a National Certificate III in Mobile Phones and Handheld Gadgets Servicing. He guides trainees through hands-on device teardown, component testing, and systematic fault-finding workflows used in professional repair centers.",
    credentials: [
      "NC III — Mobile Phones & Handheld Gadgets Servicing",
      "Mobile Phone Servicing",
      "Android & Apple Specialist",
      "Board-Level Repair",
    ],
    facebookUrl: "https://facebook.com/jamfu199",
    primaryProgramKey: "cellphone",
  },
  {
    key: "arl",
    email: "arl.mazz@hardtechitcorp.com",
    firstName: "Arl",
    lastName: "Mazz",
    title: "Trainer",
    bio: "A veteran practitioner with over two decades in mobile phone repair, specializing in Android system-level troubleshooting. His deep field experience gives trainees practical insight into real-world repair scenarios beyond the classroom.",
    credentials: [
      "20+ years — Mobile Phone Servicing & Android Troubleshooting",
      "Mobile Phone Servicing",
      "Android Master Troubleshooting",
    ],
    facebookUrl: "https://facebook.com/arl.mazz",
    primaryProgramKey: "cellphone",
  },
] as const;

const LEGACY_HENRY_EMAIL = "henry.lopez@hardtechitcorp.com";

// ---------------------------------------------------------------------------
// Programs — the 5-program catalog confirmed in docs/screens/desktop-02.md
// and docs/screens/mobile-05.md admin dropdowns: Computer Hardware,
// Cellphone Repair, Software Dev, Networking Basics, CCTV Installation.
//
// Computer Hardware Servicing, Cellphone Hardware Servicing, and I.T.
// Software Development have full marketing cards in the screenshot corpus
// (desktop-01 #14-17, mobile-01 #31-35, mobile-02 #1-3) and are transcribed
// verbatim below.
//
// Networking Basics and CCTV Installation are confirmed to exist (they are
// real, selectable rows in the admin Program dropdown, and Networking Basics
// additionally appears with a real ₱5,000 price and trainer on the trainee
// "Enroll in Another Program" screen, mobile-06 #14:33:09) but NO screenshot
// in the corpus shows their full marketing card — no description, duration,
// schedule, or curriculum list was ever captured for either. The fields
// below marked "not sourced" are short, factual, domain-accurate copy
// authored to satisfy the schema's NOT NULL columns; they are flagged here
// rather than silently presented as transcribed content. See the return
// report for this same flag.
// ---------------------------------------------------------------------------

const PROGRAMS = [
  {
    key: "hardware",
    name: "Computer Hardware Servicing",
    shortName: "Computer Hardware",
    subtitle: "Become a Certified Hardware Technician",
    description:
      "Master computer assembly, repair, maintenance, and advanced diagnostics. This program covers everything from basic component identification to enterprise-level hardware troubleshooting and network infrastructure basics.",
    durationLabel: "3 Months (120 hrs)",
    scheduleLabel: "Mon–Fri | 8AM–12PM",
    levelLabel: "Beginner to Professional",
    priceAmount: "5000.00",
    badgeLabel: "SKILLS TRAINING",
    iconName: "Cpu",
    accentColor: "blue",
    imageUrl: null,
    marketingEnrolledLabel: "2,400+ enrolled",
    primaryTrainerKey: "dylan",
    instructorCredentialLine: "EDPSE · LPT · MAEd | Network & Systems Servicing",
    curriculum: [
      "Computer Hardware Components & Architecture",
      "OS Installation & Configuration",
      "Troubleshooting & Diagnostics",
      "Network Cabling & Infrastructure",
      "Data Recovery & Backup Systems",
      "Final Skills Assessment",
    ],
  },
  {
    key: "cellphone",
    name: "Cellphone Hardware Servicing",
    shortName: "Cellphone Repair",
    subtitle: "Master Mobile Device Repair",
    description:
      "Learn professional mobile device repair covering teardown, diagnosis, micro-soldering, and software flashing. Gain skills for Android and iOS devices from basic glass replacement to advanced board repair.",
    durationLabel: "2 Months (80 hrs)",
    scheduleLabel: "Mon–Fri | 1PM–5PM",
    levelLabel: "Beginner to Intermediate",
    priceAmount: "5000.00",
    badgeLabel: "SKILLS TRAINING",
    iconName: "Smartphone",
    // Accent color not confirmed for this program — desktop-01 open question 2.
    accentColor: null,
    imageUrl: null,
    marketingEnrolledLabel: "1,200+ enrolled",
    primaryTrainerKey: "henry",
    instructorCredentialLine: "Owner & Lead Trainer · 20+ yrs Mobile Servicing",
    curriculum: [
      "Mobile Device Architecture & Teardown",
      "Display & Touch Panel Replacement",
      "Micro-soldering Techniques",
      "Battery & Charging Systems",
      "Software Flashing & Unlocking",
      "Business Operations & Pricing",
    ],
  },
  {
    key: "software",
    name: "I.T. Software Development",
    shortName: "Software Dev",
    subtitle: "Build Real-World Applications",
    description:
      "A comprehensive software development training covering web development, programming fundamentals, database management, and modern frameworks. Build a portfolio of real-world projects you can show to employers.",
    durationLabel: "6 Months (160 hrs)",
    scheduleLabel: "Mon–Sat | 8AM–12PM",
    levelLabel: "Beginner to Advanced",
    priceAmount: "5000.00",
    badgeLabel: "INDUSTRY CERT",
    iconName: "Code",
    accentColor: "orange",
    imageUrl: null,
    marketingEnrolledLabel: "800+ enrolled",
    primaryTrainerKey: "dylan",
    instructorCredentialLine: "EDPSE · LPT · MAEd | Owner, PRINCE IT Solutions",
    curriculum: [
      "Programming Fundamentals (Python & JS)",
      "HTML, CSS & Responsive Web Design",
      "React & Modern Frontend Frameworks",
      "Node.js & Backend Development",
      "Database Design (SQL & NoSQL)",
      "Portfolio Project & Career Coaching",
    ],
  },
  {
    key: "networking",
    name: "Networking Basics",
    shortName: "Networking Basics",
    subtitle: null,
    // NOT SOURCED — no full marketing card for this program exists in the
    // screenshot corpus. Authored to satisfy the NOT NULL `description` column.
    description:
      "Covers structured cabling, router and switch configuration, IP addressing, and network troubleshooting fundamentals for small and medium business setups.",
    // NOT SOURCED — no duration/schedule was ever captured for this program.
    durationLabel: "To be announced",
    scheduleLabel: "To be announced",
    levelLabel: "Beginner to Intermediate",
    // Price IS sourced: mobile-06 #14:33:09 "Networking Basics ... ₱5,000".
    priceAmount: "5000.00",
    badgeLabel: null,
    iconName: "Network",
    accentColor: null,
    imageUrl: null,
    marketingEnrolledLabel: null,
    // Trainer IS sourced: mobile-06 #14:33:09 "Trainer: Prof. Adelan P. Sistoso".
    primaryTrainerKey: "dylan",
    instructorCredentialLine: null,
    curriculum: [],
  },
  {
    key: "cctv",
    name: "CCTV Installation",
    shortName: "CCTV Installation",
    subtitle: null,
    // NOT SOURCED — this program's name is confirmed (admin Program dropdown,
    // desktop-02 #6 / mobile-05 #8) but no marketing content, price, or
    // trainer for it appears anywhere in the screenshot corpus. Authored to
    // satisfy the NOT NULL `description` column; price mirrors the uniform
    // ₱5,000 seen on every other confirmed program rather than inventing a
    // distinct figure.
    description:
      "Covers CCTV camera installation, DVR/NVR setup, cabling, and system configuration for residential and commercial surveillance projects.",
    durationLabel: "To be announced",
    scheduleLabel: "To be announced",
    levelLabel: "Beginner to Intermediate",
    priceAmount: "5000.00",
    badgeLabel: null,
    iconName: "Camera",
    accentColor: null,
    imageUrl: null,
    marketingEnrolledLabel: null,
    primaryTrainerKey: null,
    instructorCredentialLine: null,
    curriculum: [],
  },
] as const;

// ---------------------------------------------------------------------------
// Testimonials — homepage "What Our Graduates Say" (desktop-01 #4-5,
// mobile-01 #5-7). Maria Santos is the large featured card; the other four
// are the grid below it, in on-page order.
// ---------------------------------------------------------------------------

const TESTIMONIALS = [
  {
    quoteText:
      "HardTech completely transformed my career. The hands-on training was exactly what I needed. Within 2 months of graduating, I landed a job at a major tech company. Worth every peso.",
    authorName: "Maria Santos",
    authorRole: "Hardware Technician — TechCorp Philippines",
    avatarInitials: "MS",
    badgeColor: "orange",
    programKey: "hardware",
    isFeatured: true,
  },
  {
    quoteText:
      "The best investment I ever made. The instructors are top-notch and the curriculum is comprehensive. I now run my own successful mobile repair shop thanks to HardTech.",
    authorName: "Juan dela Cruz",
    authorRole: "Mobile Repair Specialist",
    avatarInitials: "JC",
    badgeColor: "green",
    programKey: "cellphone",
    isFeatured: false,
  },
  {
    quoteText:
      "I went from zero coding knowledge to building real applications in just a few months. The project-based approach made all the difference. HardTech gives you real skills, not just theory.",
    authorName: "Angelica Reyes",
    authorRole: "Junior Developer",
    avatarInitials: "AR",
    badgeColor: "blue",
    programKey: "software",
    isFeatured: false,
  },
  {
    quoteText:
      "Excellent trainers who genuinely care about your success. The hands-on skills I picked up at HardTech opened so many doors. My salary doubled after the program.",
    authorName: "Roberto Lim",
    authorRole: "IT Support Engineer",
    avatarInitials: "RL",
    badgeColor: "purple",
    programKey: "hardware",
    isFeatured: false,
  },
  {
    quoteText:
      "The micro-soldering training at HardTech is unmatched. Mr. Henry Gomata Lopez is incredibly knowledgeable and patient. I was hired by Samsung's authorized service center straight after graduation.",
    authorName: "Cristina Valdez",
    authorRole: "Authorized Service Technician",
    avatarInitials: "CV",
    badgeColor: "orange",
    programKey: "cellphone",
    isFeatured: false,
  },
] as const;

// ---------------------------------------------------------------------------
// Gallery photos — /gallery "Training in Action" grid. Captions are factual
// descriptions of the local photographs in public/images/gallery; no names
// are inferred from the images.
// ---------------------------------------------------------------------------

const GALLERY_PHOTOS = [
  ["gallery-01.jpg", "Trainees working at microscope repair benches in the HardTech lab."],
  ["gallery-02.jpg", "Group photo of trainees holding completion certificates in the training lab."],
  ["gallery-03.jpg", "Graduates holding certificates together after a training session."],
  ["gallery-04.jpg", "Training group photo in front of a display and equipment area."],
  ["gallery-05.jpg", "Close-up of electronic components and a circuit board during repair work."],
  ["gallery-06.jpg", "Microscope repair workstation with test equipment and a device on the bench."],
  ["gallery-07.jpg", "Trainees practicing board repair at microscope workstations."],
  ["gallery-08.jpg", "Two trainees working at a microscope station beside a HardTech training banner."],
  ["gallery-09.jpg", "Group photo of trainees holding completion certificates in the training lab."],
  ["gallery-10.jpg", "Two people posing together inside the training lab."],
  ["gallery-11.jpg", "Disassembled mobile-device components arranged on a repair table."],
  ["gallery-12.jpg", "Trainees seated at microscope stations during hands-on board work."],
  ["gallery-13.jpg", "Empty row of microscope repair benches and testing equipment."],
  ["gallery-14.jpg", "Two people posing beside a monitor and repair equipment."],
  ["gallery-15.jpg", "Two trainees observing a board-repair workstation beneath a HardTech banner."],
  ["gallery-16.jpg", "Group of graduates holding completion certificates."],
  ["gallery-17.jpg", "Group gathering around a table in an outdoor covered area."],
  ["gallery-18.jpg", "Close-up of hands working under a microscope during soldering practice."],
  ["gallery-19.jpg", "Mobile phone and test instruments on a repair bench."],
  ["gallery-20.jpg", "Two people posing together beside a board-repair workstation."],
  ["gallery-21.jpg", "Group photo of trainees seated in the HardTech training lab."],
].map(([fileName, caption], index) => ({
  imageUrl: `/images/gallery/${fileName}`,
  caption,
  sortOrder: index,
}));

// ---------------------------------------------------------------------------
// FAQs — /contact FAQ accordion (desktop-01 #22-25, mobile-02 #141659-141711),
// on-page order.
// ---------------------------------------------------------------------------

const FAQS = [
  {
    question: "How do I enroll in a program?",
    answer:
      'You can enroll online through our website by clicking "Enroll Now" and filling out the registration form. You may also visit any of our campuses in person. Our admissions team will guide you through the process.',
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept GCash, Maya, credit/debit cards, and bank transfers. We also offer installment payment plans for eligible enrollees. Contact our admissions office for details on financing options.",
  },
  {
    question: "Are the certificates recognized by employers?",
    answer:
      "Our certificates are skills-based credentials issued by HardTech IT Corp, not a government accreditation. They document the hands-on competencies you mastered during the program, include QR verification, and pair best with a portfolio of work you complete in class — which is what employers in mobile, desktop, and other servicing roles look at most.",
  },
  {
    question: "Do you offer job placement assistance?",
    answer:
      "Most of our graduates choose to open their own mobile, desktop, or electronics servicing business rather than seek employment. We support that path with business-starter guidance — tooling checklists, pricing advice, supplier intros, and ongoing alumni mentorship from our master trainers.",
  },
].map((faq, index) => ({ ...faq, sortOrder: index }));

// ---------------------------------------------------------------------------
// Payment methods — /enroll Step 3 picker (desktop-01 #27-29, mobile-04
// #21-22). GCash's remittance details are the only ones shown on screen
// (desktop-01 #28: Number 0917-123-4567, Account Name "HardTech IT Corp").
// Maya/Bank Transfer/Card never show an account number or bank name on the
// screen — their `note` fields capture only the sub-labels that ARE shown
// ("Instant transfer", "BDO, BPI, Metrobank", "Visa / Mastercard").
// ---------------------------------------------------------------------------

const PAYMENT_METHODS = [
  {
    method: "GCASH",
    displayName: "GCash",
    accountNumber: "0917-123-4567",
    accountName: "HardTech IT Corp",
    bankName: null,
    note: "Instant transfer. Include the Reference No. in your payment remarks so we can match your payment quickly.",
    isEnabled: true,
  },
  {
    method: "MAYA",
    displayName: "Maya",
    accountNumber: null,
    accountName: null,
    bankName: null,
    note: "Instant transfer",
    isEnabled: true,
  },
  {
    method: "BANK_TRANSFER",
    displayName: "Bank Transfer",
    accountNumber: null,
    accountName: null,
    bankName: "BDO, BPI, Metrobank",
    note: null,
    isEnabled: true,
  },
  {
    method: "CARD",
    displayName: "Credit / Debit Card",
    accountNumber: null,
    accountName: null,
    bankName: null,
    note: "Visa / Mastercard",
    isEnabled: true,
  },
] as const;

// ---------------------------------------------------------------------------
// Demo login accounts — /login "TEST CREDENTIALS" box (desktop-02.md #1,
// mobile-04.md #12): admin@gmail.com / trainer@gmail.com / trainee@gmail.com,
// "Password: arbitrary value". `verifyDemoCredentials`
// (src/server/auth/demo-credentials.ts) looks these up by *exact* email with
// no password check, so these three rows are a hard functional requirement
// for /login to work at all — not flavor data.
//
// Names are the demo personas the dashboard screenshots actually show, never
// invented:
//   - admin@gmail.com   -> "HardTech Admin", the forum's ADMIN-badged author
//     (desktop-01.md #11) — the only admin persona anywhere in the corpus.
//   - trainer@gmail.com -> "Henry Gomata Lopez", the only trainer ever shown
//     signed into /dashboard/trainer ("Welcome, Mr. Henry Gomata Lopez",
//     desktop-02.md #14, mobile-05.md #31).
//   - trainee@gmail.com -> "Carlos Reyes", the trainee dashboard's default/
//     selected "View as" persona with concrete seeded stats (desktop-02.md
//     #22 — 68% progress, Cellphone Repair, Batch 2026-A; mobile-06.md).
//
// Flagged discrepancy (do not silently reconcile): desktop-02.md's own User
// Management table (screenshot #4) shows different, also-sourced emails for
// these same two named people — henry@hardtech.ph and carlos@gmail.com —
// distinct from trainer@gmail.com/trainee@gmail.com and from wave-1's
// henry.lopez@hardtechitcorp.com. Three different emails point at "Henry
// Gomata Lopez" across the corpus. Since email is `@unique` only one row can
// exist per address; this seed creates the two the product actually needs
// (wave-1's existing TrainerProfile-bearing row, unedited, and this
// login-and-dashboard-bearing row) and does not fabricate a third row for
// User Management, a page not built this wave.
// ---------------------------------------------------------------------------

const DEMO_LOGIN_USERS = [
  {
    key: "demoAdmin",
    email: "admin@gmail.com",
    firstName: "HardTech",
    lastName: "Admin",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    key: "demoTrainer",
    email: "trainer@gmail.com",
    firstName: "Henry Gomata",
    lastName: "Lopez",
    role: "TRAINER",
    status: "ACTIVE",
  },
  {
    key: "demoTrainee",
    email: "trainee@gmail.com",
    firstName: "Carlos",
    lastName: "Reyes",
    role: "TRAINEE",
    status: "ACTIVE",
  },
] as const;

/**
 * Placeholder only. `verifyDemoCredentials` never reads this column for seeded
 * seeded user when demo auth is enabled — deliberately NOT a real-looking
 * hash, which would imply a check that does not happen.
 */
const DEMO_DEVELOPMENT_PASSWORD = "HardTechLocalDevOnly!";

// ---------------------------------------------------------------------------
// Supporting trainees — Henry's "Assigned Trainees" roster (desktop-02.md
// #8/#16, mobile-05.md #12-14): 5 trainees incl. Carlos Reyes above. Emails
// are sourced from the User Management table / My Trainees grid where
// shown; Liza Cruz's is NOT SOURCED anywhere in the corpus (she appears only
// by name) and follows wave-1's own convention for unsourced seed-only
// login identifiers.
// ---------------------------------------------------------------------------

const SUPPORTING_TRAINEES = [
  {
    key: "maria",
    email: "maria@gmail.com", // desktop-02.md #4
    firstName: "Maria",
    lastName: "Santos",
    status: "ACTIVE",
    progressPercent: 54,
  },
  {
    key: "liza",
    // NOT SOURCED — no email for Liza Cruz appears anywhere in the read
    // corpus; seed-only login identifier, same convention as wave-1's
    // TRAINERS emails.
    email: "liza.cruz@gmail.com",
    firstName: "Liza",
    lastName: "Cruz",
    status: "ACTIVE",
    progressPercent: 92,
  },
  {
    key: "juan",
    email: "jdc@gmail.com", // desktop-02.md #16 My Trainees grid
    firstName: "Juan",
    lastName: "Dela Cruz",
    status: "ACTIVE",
    progressPercent: 41,
  },
  {
    key: "patricia",
    email: "patricia@gmail.com", // desktop-02.md #4
    firstName: "Patricia",
    lastName: "Ocampo",
    status: "PENDING", // desktop-02.md #4 shows her account status as "pending"
    progressPercent: 22,
  },
] as const;

// ---------------------------------------------------------------------------
// Communities — the 9 regional communities (desktop-02.md #29). Descriptions
// are transcribed verbatim as truncated by the source UI or cut off by the
// screenshot's viewport — never completed/invented. "Ilonngo" in the Iloilo
// description is the source's own text (per docs/contracts/wave-2-app.md:
// "The Iloilo community description really does say 'Ilonngo' — ship it
// as-is"), not a transcription error introduced here.
// ---------------------------------------------------------------------------

const COMMUNITIES = [
  {
    slug: "ncr-metro-manila-technicians",
    name: "NCR / Metro Manila Technicians",
    region: "Metro Manila",
    description: "The largest HardTech community — for technicians,...",
    primaryTopic: null,
    approvedMemberKeys: ["demoAdmin", "demoTrainer", "demoTrainee"],
  },
  {
    slug: "quezon-city-repair-hub",
    name: "Quezon City Repair Hub",
    region: "Quezon City",
    description: "Repair shops, freelancers, and trainees based in Quezon City....",
    primaryTopic: "MOBILE_REPAIR",
    approvedMemberKeys: ["maria", "juan"],
  },
  {
    slug: "cebu-techs-network",
    name: "Cebu Techs Network",
    region: "Cebu City",
    description: "For Visayas-based technicians. Cebu City and surrounding...",
    primaryTopic: "TROUBLESHOOTING",
    approvedMemberKeys: ["liza", "patricia"],
  },
  {
    slug: "davao-tech-circle",
    name: "Davao Tech Circle",
    region: "Davao City",
    description: "Davao Region community for mobile, desktop, and network...",
    primaryTopic: "DESKTOP_REPAIR",
    approvedMemberKeys: ["dylan"],
  },
  {
    slug: "cavite-technicians",
    name: "Cavite Technicians",
    region: "Cavite",
    description: "Cavite-based repair community. Bacoor, Imus, Dasmariñas, GM...",
    primaryTopic: "MOBILE_REPAIR",
    approvedMemberKeys: ["jam"],
  },
  {
    slug: "laguna-tech-collective",
    name: "Laguna Tech Collective",
    region: "Laguna",
    description: "Sta. Rosa, Calamba, Los Baños, San Pablo — a working...",
    primaryTopic: "NETWORKING",
    approvedMemberKeys: ["arl"],
  },
  {
    slug: "pampanga-repair-pros",
    name: "Pampanga Repair Pros",
    region: "Pampanga",
    // NOT FULLY SOURCED — cut off by the screenshot's viewport
    // (desktop-02.md #29), only this fragment was ever visible.
    description: "Angeles, San Fernando, Clark —",
    primaryTopic: null,
    approvedMemberKeys: [],
  },
  {
    slug: "batangas-tech-hub",
    name: "Batangas Tech Hub",
    region: "Batangas",
    description: "Lipa, Batangas City, Tanauan,", // NOT FULLY SOURCED — same reason
    primaryTopic: null,
    approvedMemberKeys: [],
  },
  {
    slug: "iloilo-it-community",
    name: "Iloilo IT Community",
    region: "Iloilo City",
    description: "For Ilonngo IT pros — repair,", // NOT FULLY SOURCED — same reason; "Ilonngo" verbatim
    primaryTopic: null,
    approvedMemberKeys: [],
  },
] as const;

// ---------------------------------------------------------------------------
// Forum posts — the 6 real posts from desktop-01.md #11-13 and desktop-02.md
// #30-31, cross-referenced with mobile-01.md #24-30 for the one post whose
// full (non-truncated) body/reply is available there. Every other body below
// ends exactly where the source screenshot's own truncation ("...") cuts it
// off — never completed. View counts sum to exactly 906 and reply counts sum
// to exactly 9, matching the Forum Stats card (desktop-01.md #12) verbatim.
// ---------------------------------------------------------------------------

const FORUM_REFERENCE_DATE = new Date("2026-07-28T00:00:00.000Z");
function daysBeforeReference(days: number): Date {
  return new Date(FORUM_REFERENCE_DATE.getTime() - days * 86_400_000);
}

const FORUM_POSTS = [
  {
    id: "forum-post-welcome",
    authorKey: "demoAdmin",
    approvedByKey: null, // admin's own post — not subject to trainee-approval
    category: "ANNOUNCEMENTS",
    title: "Welcome to the HardTech Community Forum! 🎉",
    // Truncated verbatim in source (desktop-01.md #11) — "-…" is where the
    // screenshot's own ellipsis cuts a bullet list off, not this seed.
    body: "We're thrilled to launch the official HardTech IT Corp community forum — a dedicated space for trainees, trainers, and graduates to connect, share knowledge, and grow together. What you can do here:",
    hashtags: ["welcome", "community", "guidelines"],
    isPinned: true,
    isTrending: true,
    createdAt: daysBeforeReference(434),
    upvoteCount: 3,
    helpfulCount: 0,
    insightfulCount: 0,
    viewCount: 312,
    replyCount: 0,
  },
  {
    id: "forum-post-motherboard-repair",
    authorKey: "liza",
    approvedByKey: "demoAdmin", // trainee post — requires approval per forum guideline 5
    category: "GENERAL_DISCUSSION",
    title: "I completed my first solo motherboard-level repair! 🙌",
    body: "Just wanted to share this with the community — I successfully diagnosed and repaired a dead iPhone 12 motherboard completely on my own today, no trainer hovering! The device came in with no power and",
    hashtags: ["success-story", "iphone-12", "motherboard", "ic-repair"],
    isPinned: false,
    isTrending: false,
    createdAt: daysBeforeReference(428),
    upvoteCount: 1,
    helpfulCount: 0,
    insightfulCount: 1,
    viewCount: 92,
    replyCount: 2,
  },
  {
    id: "forum-post-repair-shop-hiring",
    authorKey: "demoAdmin",
    approvedByKey: null,
    category: "CAREER_JOBS",
    title: "Repair Shop Hiring — Mandaluyong & BGC (May 2026)",
    body: "We've received several job referrals from partner employers this month. See the openings below. TechFixPH — SM Megamall Mandaluyong - Position: Junior Mobile Technician - Rate: ₱18,000–₱22,000/month",
    hashtags: ["jobs", "hiring", "mandaluyong", "bgc", "career"],
    isPinned: false,
    isTrending: false,
    createdAt: daysBeforeReference(429),
    upvoteCount: 1,
    helpfulCount: 1,
    insightfulCount: 0,
    viewCount: 148,
    replyCount: 0,
  },
  {
    id: "forum-post-s23-charging",
    authorKey: "juan",
    approvedByKey: "demoAdmin",
    category: "TROUBLESHOOTING",
    title:
      "Samsung Galaxy S23 not charging after ultrasonic cleaning — board issue or connector?",
    // Full body, not truncated — recovered from the post-detail view
    // (mobile-01.md #28), which shows more than the forum-list excerpt.
    body: "Took in a water-damaged S23 last week. After disassembly and ultrasonic cleaning with IPA solution, the board looks clean under a microscope — no visible corrosion remaining.\n\nProblems now:\n- Doesn't charge from USB-C (tested with 3 different cables and chargers)\n- Shows \"Moisture Detected\" even though the board is completely dry\n- Occasionally boots to Samsung logo then immediately shuts off",
    hashtags: ["samsung", "s23", "water-damage", "usb-c", "charging"],
    isPinned: false,
    isTrending: false,
    createdAt: daysBeforeReference(430),
    upvoteCount: 0,
    helpfulCount: 0,
    insightfulCount: 0,
    viewCount: 63,
    replyCount: 1,
  },
  {
    id: "forum-post-micro-soldering-toolkit",
    authorKey: "demoTrainer",
    approvedByKey: null,
    category: "RESOURCES_TIPS",
    title: "Micro-soldering starter toolkit — what you actually need vs. what's nice to have",
    body: "After two years of hands-on micro-soldering work, here's an honest breakdown of what you truly need vs. what the YouTube channels make you think you need. Non-negotiables (Day 1 purchases): - Hakko FX",
    hashtags: ["micro-soldering", "tools", "beginners", "resources"],
    isPinned: false,
    isTrending: true,
    createdAt: daysBeforeReference(431),
    upvoteCount: 2,
    helpfulCount: 0,
    insightfulCount: 1,
    viewCount: 204,
    replyCount: 3,
  },
  {
    id: "forum-post-iphone15-screen",
    authorKey: "demoTrainee",
    approvedByKey: "demoAdmin",
    category: "QA_HELP",
    title: "How do I safely remove an iPhone 15 screen without damaging Face ID?",
    body: "Hi everyone! I'm working on my first iPhone 15 screen replacement and I'm a bit nervous about the Face ID flex cables underneath the display assembly. My main concerns: 1. Where exactly are the Face I",
    hashtags: ["iphone-15", "screen-replacement", "face-id"],
    isPinned: false,
    isTrending: true,
    createdAt: daysBeforeReference(432),
    upvoteCount: 0,
    helpfulCount: 0,
    insightfulCount: 0,
    viewCount: 87,
    replyCount: 3,
  },
] as const;

/**
 * Replies. Only forum-post-s23-charging's single reply is sourced verbatim
 * (mobile-01.md #29-30, full text + insightfulCount=1). The other 8 replies
 * are NOT SOURCED — no reply text for those threads appears anywhere in the
 * read corpus — but the *count* per post (2, 3, 3) is sourced (desktop-01.md
 * #11/#13) and must be real rows for ForumPost.replyCount/Forum Stats to add
 * up, so short, clearly-flagged placeholder replies fill the gap rather than
 * leaving the count unbacked by real data.
 */
const FORUM_REPLIES = [
  {
    postId: "forum-post-s23-charging",
    authorKey: "demoTrainer",
    body: 'The "Moisture Detected" error persisting on a clean board is a strong indicator the USB-C port itself has internal pin damage — even if it looks fine externally. Water can wick inside the port between the contacts and the plastic housing, causing intermittent shorts that the moisture sensor interprets as liquid.\n\nDiagnostic steps I\'d recommend:\n1. Replace the USB-C port first (it\'s a cheap part) before touching ICs\n2. Check continuity from the USB-C VBUS pin to the PMIC input rail\n3. If charging IC is suspect, check resistance on the charge pump output pins\n\nThe random boot-then-shutdown is likely the battery going below minimum threshold from the charging issue rather than PMIC damage. Start with the port swap — solves about 70% of these cases.',
    insightfulCount: 1,
  },
  // NOT SOURCED below this line — placeholder replies backing sourced counts only.
  {
    postId: "forum-post-motherboard-repair",
    authorKey: "demoTrainer",
    body: "Nice work diagnosing that without help — motherboard-level repair on a first solo attempt is no small thing. What did you use to confirm the short before reflowing?",
    insightfulCount: 0,
  },
  {
    postId: "forum-post-motherboard-repair",
    authorKey: "demoAdmin",
    body: "Great milestone, Liza — mind if we feature this in next month's newsletter?",
    insightfulCount: 0,
  },
  {
    postId: "forum-post-micro-soldering-toolkit",
    authorKey: "demoTrainee",
    body: "Bookmarking this. Does the Hakko FX get you through logic-board work too, or is that a separate iron?",
    insightfulCount: 0,
  },
  {
    postId: "forum-post-micro-soldering-toolkit",
    authorKey: "juan",
    body: "This matches what we were told in class almost word for word. Appreciate you writing it down.",
    insightfulCount: 0,
  },
  {
    postId: "forum-post-micro-soldering-toolkit",
    authorKey: "maria",
    body: "What flux are you running with the hot air station these days?",
    insightfulCount: 0,
  },
  {
    postId: "forum-post-iphone15-screen",
    authorKey: "demoTrainer",
    body: "Go slow around the Face ID flex — remove the battery connector first, then work the display data cable bracket before touching the earpiece/proximity flex. Don't force the fold.",
    insightfulCount: 1,
  },
  {
    postId: "forum-post-iphone15-screen",
    authorKey: "liza",
    body: "I cracked my first Face ID flex the same way you're worried about. Heat the adhesive a bit longer than you think you need to before prying.",
    insightfulCount: 0,
  },
  {
    postId: "forum-post-iphone15-screen",
    authorKey: "demoAdmin",
    body: "Reminder to everyone: Face ID components are calibrated per-device and Apple does not support swapping them between units.",
    insightfulCount: 0,
  },
] as const;

/** Fixed reactor pool, most-senior-first — enough distinct users to back every post's reaction counts. */
const REACTION_POOL = ["demoAdmin", "demoTrainer", "demoTrainee", "maria", "liza", "juan", "patricia"] as const;

/**
 * Author ratings — the Rating Leaderboard (desktop-01.md #11-13,
 * desktop-02.md #28). Star sums are chosen so the average matches the
 * screenshot's displayed value exactly (e.g. HardTech Admin's 4 ratings of
 * [5,5,5,4] average 4.75, which the UI's one-decimal rounding displays as
 * the sourced "4.8"). No rater ever rates themselves (AuthorRating_no_self_rating).
 */
const AUTHOR_RATINGS = [
  { ratedKey: "demoTrainer", raterKey: "demoAdmin", stars: 5 },
  { ratedKey: "demoTrainer", raterKey: "demoTrainee", stars: 5 },
  { ratedKey: "demoTrainer", raterKey: "maria", stars: 5 },
  { ratedKey: "demoTrainer", raterKey: "liza", stars: 5 },
  { ratedKey: "liza", raterKey: "demoAdmin", stars: 5 },
  { ratedKey: "liza", raterKey: "demoTrainer", stars: 5 },
  { ratedKey: "demoAdmin", raterKey: "demoTrainer", stars: 5 },
  { ratedKey: "demoAdmin", raterKey: "liza", stars: 5 },
  { ratedKey: "demoAdmin", raterKey: "demoTrainee", stars: 5 },
  { ratedKey: "demoAdmin", raterKey: "juan", stars: 4 },
  { ratedKey: "demoTrainee", raterKey: "demoTrainer", stars: 4 },
  { ratedKey: "demoTrainee", raterKey: "demoAdmin", stars: 4 },
  { ratedKey: "maria", raterKey: "demoTrainer", stars: 4 },
] as const;

// ---------------------------------------------------------------------------
// Dashboard content — one real batch/cohort under Henry (trainer@gmail.com)
// so the trainer and trainee Overview pages (desktop-02.md #14/#22,
// mobile-05.md #31-32) have real stat cards to render. Session dates are
// deliberately shifted to run from the seed's own execution time (not the
// screenshots' literal May 2026 dates) so "Upcoming Sessions" stays
// genuinely upcoming no matter when this seed is (re-)run — titles, types,
// and locations are transcribed verbatim; only the calendar date is
// substituted. Flagged here rather than silently done.
// ---------------------------------------------------------------------------

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return new Date(date.getTime() + days * 86_400_000);
}

const TRAINING_SESSIONS = [
  {
    id: "session-battery-charging-workshop",
    title: "Battery & Charging Port Workshop",
    sessionType: "WORKSHOP",
    sessionDate: daysFromNow(14),
    startTime: "01:00 PM",
    location: "Lab A",
  },
  {
    id: "session-screen-digitizer-replacement",
    title: "Screen & Digitizer Replacement",
    sessionType: "HANDS_ON",
    sessionDate: daysFromNow(14),
    startTime: "08:00 AM",
    location: "Lab A",
  },
  {
    id: "session-unit3-assessment",
    title: "Unit 3 Assessment — Board Diagnostics",
    sessionType: "ASSESSMENT",
    sessionDate: daysFromNow(16),
    startTime: "09:00 AM",
    location: "Lab A",
  },
  {
    id: "session-micro-soldering-fundamentals",
    title: "Micro-Soldering Fundamentals",
    sessionType: "LECTURE",
    sessionDate: daysFromNow(19),
    startTime: "08:00 AM",
    location: "Lab A",
  },
] as const;

const CELLPHONE_MODULES = [
  {
    id: "module-cellphone-unit1-fundamentals",
    title: "Cellphone Repair Fundamentals — Unit 1",
    fileType: "PDF",
    unitNumber: 1,
    fileSizeBytes: 2_400_000, // "2.4 MB"
    createdAt: new Date("2026-03-12T00:00:00.000Z"),
  },
  {
    id: "module-logic-board-anatomy-video",
    title: "Logic Board Anatomy Video",
    fileType: "MP4",
    unitNumber: 2,
    fileSizeBytes: 84_000_000, // "84 MB"
    createdAt: new Date("2026-03-20T00:00:00.000Z"),
  },
  {
    id: "module-micro-soldering-tools-guide",
    title: "Micro-Soldering Tools Guide",
    fileType: "PDF",
    unitNumber: 2,
    fileSizeBytes: 1_100_000, // "1.1 MB"
    createdAt: new Date("2026-04-05T00:00:00.000Z"),
  },
  {
    id: "module-assessment-quiz-unit2",
    title: "Assessment Quiz — Unit 2",
    fileType: "DOCX",
    unitNumber: 2,
    fileSizeBytes: 300_000, // "0.3 MB"
    createdAt: new Date("2026-04-18T00:00:00.000Z"),
  },
] as const;

const ASSIGNMENTS = [
  {
    id: "assignment-unit-3-lab-report",
    title: "Unit 3 Lab Report",
    instructions: "Instructions for trainees...",
    dueDate: new Date("2026-07-28T00:00:00.000Z"),
    dueTime: "11:59 PM",
    allowedSubmissionTypes: ["IMAGE", "VIDEO", "DOCUMENT"],
    linkedSessionId: "session-unit3-assessment",
  },
] as const;

const ASSIGNMENT_SUBMISSIONS = [
  {
    assignmentId: "assignment-unit-3-lab-report",
    traineeKey: "demoTrainee",
    submissionLink: "image, video, or document files",
    submittedAt: new Date("2026-07-28T00:00:00.000Z"),
  },
] as const;

const ANNOUNCEMENTS = [
  {
    title: "June 2026 Batch Enrollments Now Open!",
    body: "New batches for all programs are accepting enrollments. Limited slots — secure yours before they fill up.",
    type: "UPDATE",
    isPinned: true,
    createdAt: new Date("2026-05-25T00:00:00.000Z"),
  },
  {
    title: "Holiday Schedule — June 12",
    body: "Classes are suspended on June 12 (Independence Day). Regular schedule resumes on June 13, 2026.",
    type: "NOTICE",
    isPinned: false,
    createdAt: new Date("2026-05-20T00:00:00.000Z"),
  },
] as const;

const AUDIT_LOG_ENTRIES = [
  {
    category: "PAYMENT",
    action: "Verified payment",
    description: "ENR-ms49u61n-7ntf",
    actorKey: "demoAdmin",
    createdAt: new Date("2026-07-28T06:25:00.000Z"),
  },
  {
    category: "ENROLLMENT",
    action: "Enrollment approved",
    description: "ENR-ms49u61n-7ntf",
    actorKey: "demoAdmin",
    createdAt: new Date("2026-07-28T06:25:00.000Z"),
  },
  {
    category: "ENROLLMENT",
    action: "Re-enrolled in program",
    description: "ENR-ms49u61n-7ntf — I.T. Software Development",
    actorKey: "juan",
    createdAt: new Date("2026-07-28T06:25:00.000Z"),
  },
  {
    category: "ENROLLMENT",
    action: "Re-enrolled in program",
    description: "ENR-ms49u61n-ddp2 — Cellphone Hardware Servicing",
    actorKey: "juan",
    createdAt: new Date("2026-07-28T06:25:00.000Z"),
  },
  {
    category: "ENROLLMENT",
    action: "Re-enrolled in program",
    description: "ENR-ms49u61k-ke8k — Computer Hardware Servicing",
    actorKey: "juan",
    createdAt: new Date("2026-07-28T06:25:00.000Z"),
  },
  {
    category: "ENROLLMENT",
    action: "Approved enrollment",
    description: "ENR-0086 — Carlos Reyes",
    actorKey: "demoAdmin",
    createdAt: new Date("2026-05-14T01:12:00.000Z"),
  },
  {
    category: "PAYMENT",
    action: "Verified payment",
    description: "ENR-0086 — ₱5,000",
    actorKey: "demoAdmin",
    createdAt: new Date("2026-05-14T01:13:00.000Z"),
  },
  {
    category: "CALENDAR",
    action: "Created event",
    description: "EV-3 — Board Diagnostics Assessment",
    actorKey: "demoTrainer",
    createdAt: new Date("2026-05-13T08:40:00.000Z"),
  },
  {
    category: "USER",
    action: "Updated role",
    description: "U-007 → trainer",
    actorKey: "demoAdmin",
    createdAt: new Date("2026-05-12T02:05:00.000Z"),
  },
] as const;

// fileUrl values below follow the same placeholder-path convention as
// GALLERY_PHOTOS above — NOT sourced URLs, no real files were provided.

async function main() {
  // 1. Trainer Users — upsert by email (unique).
  const userIdByKey = new Map<string, string>();
  for (const trainer of TRAINERS) {
    const user = await prisma.user.upsert({
      where: { email: trainer.email },
      update: {
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        role: "TRAINER",
        status: "ACTIVE",
      },
      create: {
        email: trainer.email,
        passwordHash: hashSeedPassword(randomBytes(24).toString("hex")),
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        role: "TRAINER",
        status: "ACTIVE",
      },
    });
    userIdByKey.set(trainer.key, user.id);
  }

  // 2. Programs — upsert by name (unique). primaryTrainerId resolved from
  // the trainer map above.
  const programIdByKey = new Map<string, string>();
  for (const program of PROGRAMS) {
    const primaryTrainerId = program.primaryTrainerKey
      ? (userIdByKey.get(program.primaryTrainerKey) ?? null)
      : null;

    const record = await prisma.program.upsert({
      where: { name: program.name },
      update: {
        shortName: program.shortName,
        subtitle: program.subtitle,
        description: program.description,
        durationLabel: program.durationLabel,
        scheduleLabel: program.scheduleLabel,
        levelLabel: program.levelLabel,
        priceAmount: program.priceAmount,
        badgeLabel: program.badgeLabel,
        iconName: program.iconName,
        accentColor: program.accentColor,
        imageUrl: program.imageUrl,
        marketingEnrolledLabel: program.marketingEnrolledLabel,
        primaryTrainerId,
        instructorCredentialLine: program.instructorCredentialLine,
      },
      create: {
        name: program.name,
        shortName: program.shortName,
        subtitle: program.subtitle,
        description: program.description,
        durationLabel: program.durationLabel,
        scheduleLabel: program.scheduleLabel,
        levelLabel: program.levelLabel,
        priceAmount: program.priceAmount,
        badgeLabel: program.badgeLabel,
        iconName: program.iconName,
        accentColor: program.accentColor,
        imageUrl: program.imageUrl,
        marketingEnrolledLabel: program.marketingEnrolledLabel,
        primaryTrainerId,
        instructorCredentialLine: program.instructorCredentialLine,
      },
    });
    programIdByKey.set(program.key, record.id);

    // ProgramCurriculumTopic has no natural unique key (see file header) —
    // delete this program's topics and recreate them, which converges to
    // the same rows every run.
    await prisma.programCurriculumTopic.deleteMany({
      where: { programId: record.id },
    });
    if (program.curriculum.length > 0) {
      await prisma.programCurriculumTopic.createMany({
        data: program.curriculum.map((title, index) => ({
          programId: record.id,
          title,
          sortOrder: index,
        })),
      });
    }
  }

  // 3. Trainer profiles — upsert by userId (unique).
  for (const trainer of TRAINERS) {
    const userId = userIdByKey.get(trainer.key);
    if (!userId) continue;
    const primaryProgramId = programIdByKey.get(trainer.primaryProgramKey) ?? null;

    await prisma.trainerProfile.upsert({
      where: { userId },
      update: {
        title: trainer.title,
        bio: trainer.bio,
        credentials: [...trainer.credentials],
        facebookUrl: trainer.facebookUrl,
        primaryProgramId,
        status: "ACTIVE",
      },
      create: {
        userId,
        title: trainer.title,
        bio: trainer.bio,
        credentials: [...trainer.credentials],
        facebookUrl: trainer.facebookUrl,
        primaryProgramId,
        status: "ACTIVE",
      },
    });
  }

  // 4. Testimonials — no natural unique key; delete-then-recreate the whole
  // marketing table.
  const canonicalHenryId = userIdByKey.get("henry");
  const legacyHenry = await prisma.user.findUnique({ where: { email: LEGACY_HENRY_EMAIL } });
  if (canonicalHenryId && legacyHenry && legacyHenry.id !== canonicalHenryId) {
    await prisma.program.updateMany({
      where: { primaryTrainerId: legacyHenry.id },
      data: { primaryTrainerId: canonicalHenryId },
    });
    await prisma.batch.updateMany({
      where: { trainerId: legacyHenry.id },
      data: { trainerId: canonicalHenryId },
    });
    await prisma.trainingSession.updateMany({
      where: { trainerId: legacyHenry.id },
      data: { trainerId: canonicalHenryId },
    });
    await prisma.assignment.updateMany({
      where: { trainerId: legacyHenry.id },
      data: { trainerId: canonicalHenryId },
    });
    await prisma.module.updateMany({
      where: { trainerId: legacyHenry.id },
      data: { trainerId: canonicalHenryId },
    });
    await prisma.evaluation.updateMany({
      where: { trainerId: legacyHenry.id },
      data: { trainerId: canonicalHenryId },
    });
    await prisma.user.delete({ where: { id: legacyHenry.id } });
  }

  await prisma.testimonial.deleteMany({});
  await prisma.testimonial.createMany({
    data: TESTIMONIALS.map((testimonial, index) => ({
      quoteText: testimonial.quoteText,
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole,
      avatarInitials: testimonial.avatarInitials,
      badgeColor: testimonial.badgeColor,
      programId: programIdByKey.get(testimonial.programKey) ?? null,
      isFeatured: testimonial.isFeatured,
      sortOrder: index,
    })),
  });

  // 5. Gallery photos — same pattern.
  await prisma.galleryPhoto.deleteMany({});
  await prisma.galleryPhoto.createMany({ data: GALLERY_PHOTOS });

  // 6. FAQs — same pattern.
  await prisma.faq.deleteMany({});
  await prisma.faq.createMany({ data: FAQS });

  // 7. Payment methods — upsert by method (unique).
  for (const method of PAYMENT_METHODS) {
    await prisma.paymentMethodConfig.upsert({
      where: { method: method.method },
      update: {
        displayName: method.displayName,
        accountNumber: method.accountNumber,
        accountName: method.accountName,
        bankName: method.bankName,
        note: method.note,
        isEnabled: method.isEnabled,
      },
      create: {
        method: method.method,
        displayName: method.displayName,
        accountNumber: method.accountNumber,
        accountName: method.accountName,
        bankName: method.bankName,
        note: method.note,
        isEnabled: method.isEnabled,
      },
    });
  }

  // 8. Demo login accounts + supporting trainees — upsert by email (unique).
  // Reuses `userIdByKey` from step 1 so every later step (forum authors,
  // ratings, batch/enrollment data) can resolve these users the same
  // way it resolves the 4 wave-1 trainers.
  for (const demoUser of DEMO_LOGIN_USERS) {
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        role: demoUser.role,
        status: demoUser.status,
        passwordHash: hashSeedPassword(DEMO_DEVELOPMENT_PASSWORD),
      },
      create: {
        email: demoUser.email,
        passwordHash: hashSeedPassword(DEMO_DEVELOPMENT_PASSWORD),
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        role: demoUser.role,
        status: demoUser.status,
      },
    });
    userIdByKey.set(demoUser.key, user.id);
  }

  for (const trainee of SUPPORTING_TRAINEES) {
    const user = await prisma.user.upsert({
      where: { email: trainee.email },
      update: {
        firstName: trainee.firstName,
        lastName: trainee.lastName,
        role: "TRAINEE",
        status: trainee.status,
      },
      create: {
        email: trainee.email,
        passwordHash: hashSeedPassword(randomBytes(24).toString("hex")),
        firstName: trainee.firstName,
        lastName: trainee.lastName,
        role: "TRAINEE",
        status: trainee.status,
      },
    });
    userIdByKey.set(trainee.key, user.id);
  }

  // 9. Communities — upsert by slug (unique).
  const communityIdBySlug = new Map<string, string>();
  for (const community of COMMUNITIES) {
    const record = await prisma.community.upsert({
      where: { slug: community.slug },
      update: {
        name: community.name,
        region: community.region,
        description: community.description,
        primaryTopic: community.primaryTopic,
        visibility: "PUBLIC",
        rules: [], // no per-community rules sourced anywhere in the corpus
      },
      create: {
        slug: community.slug,
        name: community.name,
        region: community.region,
        description: community.description,
        primaryTopic: community.primaryTopic,
        visibility: "PUBLIC",
        rules: [],
      },
    });
    communityIdBySlug.set(community.slug, record.id);
  }

  // 10. Community memberships — upsert by the (communityId, userId) compound
  // unique, so re-running never duplicates a membership row.
  for (const community of COMMUNITIES) {
    const communityId = communityIdBySlug.get(community.slug);
    if (!communityId) continue;
    for (const memberKey of community.approvedMemberKeys) {
      const userId = userIdByKey.get(memberKey);
      if (!userId) continue;
      await prisma.communityMembership.upsert({
        where: { communityId_userId: { communityId, userId } },
        update: { status: "APPROVED", role: "MEMBER", joinedAt: new Date() },
        create: {
          communityId,
          userId,
          status: "APPROVED",
          role: "MEMBER",
          joinedAt: new Date(),
        },
      });
    }
  }

  // 11. Forum posts — ForumPost has no natural unique key, so this is the
  // same delete-then-recreate pattern as Testimonial/GalleryPhoto/Faq above,
  // scoped to nothing else touching this table. Deleting cascades away this
  // run's Reply/PostReaction/PostBookmark/PostReport rows automatically
  // (all four have `onDelete: Cascade` on their postId FK), so children are
  // recreated fresh in the steps below without a separate deleteMany each.
  await prisma.forumPost.deleteMany({});
  await prisma.forumPost.createMany({
    data: FORUM_POSTS.map((post) => {
      const authorId = userIdByKey.get(post.authorKey);
      if (!authorId) {
        throw new Error(`seed: forum post ${post.id} has no resolvable author (${post.authorKey})`);
      }
      const approvedByUserId = post.approvedByKey ? (userIdByKey.get(post.approvedByKey) ?? null) : null;
      return {
        id: post.id,
        authorId,
        communityId: null,
        category: post.category,
        title: post.title,
        body: post.body,
        hashtags: [...post.hashtags],
        status: "PUBLISHED" as const,
        isPinned: post.isPinned,
        isTrending: post.isTrending,
        viewCount: post.viewCount,
        upvoteCount: post.upvoteCount,
        helpfulCount: post.helpfulCount,
        insightfulCount: post.insightfulCount,
        replyCount: post.replyCount,
        bookmarkCount: 0, // sourced: forum sidebar shows "My Bookmarks — No bookmarks yet"
        reportCount: 0, // no reports observed anywhere in the corpus
        approvedAt: approvedByUserId ? post.createdAt : null,
        approvedByUserId, // never equals authorId — respects ForumPost_no_self_approval
        createdAt: post.createdAt,
      };
    }),
  });

  // 12. Replies — createMany against the literal post ids assigned above.
  await prisma.reply.createMany({
    data: FORUM_REPLIES.map((reply) => {
      const authorId = userIdByKey.get(reply.authorKey);
      if (!authorId) {
        throw new Error(`seed: reply on ${reply.postId} has no resolvable author (${reply.authorKey})`);
      }
      return {
        postId: reply.postId,
        authorId,
        body: reply.body,
        upvoteCount: 0,
        helpfulCount: 0,
        insightfulCount: reply.insightfulCount,
      };
    }),
  });

  // 13. Post reactions — real toggle rows backing each post's denormalized
  // counters, so forum.service.ts's per-viewer "has reacted" check has
  // something real to query instead of the counts existing in isolation.
  function reactorsFor(excludeKey: string, count: number): string[] {
    return REACTION_POOL.filter((key) => key !== excludeKey).slice(0, count);
  }
  const postReactionRows: { postId: string; userId: string; type: "UPVOTE" | "HELPFUL" | "INSIGHTFUL" }[] = [];
  for (const post of FORUM_POSTS) {
    const reactionsByType: [ "UPVOTE" | "HELPFUL" | "INSIGHTFUL", number ][] = [
      ["UPVOTE", post.upvoteCount],
      ["HELPFUL", post.helpfulCount],
      ["INSIGHTFUL", post.insightfulCount],
    ];
    for (const [type, count] of reactionsByType) {
      if (count === 0) continue;
      for (const reactorKey of reactorsFor(post.authorKey, count)) {
        const userId = userIdByKey.get(reactorKey);
        if (!userId) continue;
        postReactionRows.push({ postId: post.id, userId, type });
      }
    }
  }
  await prisma.postReaction.createMany({ data: postReactionRows, skipDuplicates: true });

  // 14. Author ratings — upsert by the (ratedUserId, raterUserId) compound
  // unique. Never rated <> rater (AuthorRating_no_self_rating is live and
  // tested — see prisma/migrations/20260729173000_author_rating_integrity).
  for (const rating of AUTHOR_RATINGS) {
    const ratedUserId = userIdByKey.get(rating.ratedKey);
    const raterUserId = userIdByKey.get(rating.raterKey);
    if (!ratedUserId || !raterUserId) continue;
    await prisma.authorRating.upsert({
      where: { ratedUserId_raterUserId: { ratedUserId, raterUserId } },
      update: { stars: rating.stars },
      create: { ratedUserId, raterUserId, stars: rating.stars },
    });
  }

  // 15. Trainer batch + calendar + modules + trainee enrollments — the data
  // backing dashboard.service.ts's trainer/trainee Overview reads.
  const cellphoneProgramId = programIdByKey.get("cellphone");
  const cellphoneProgram = PROGRAMS.find((program) => program.key === "cellphone");
  const trainerId = userIdByKey.get("demoTrainer");

  if (cellphoneProgramId && cellphoneProgram && trainerId) {
    const batch = await prisma.batch.upsert({
      where: { programId_code: { programId: cellphoneProgramId, code: "2026-A" } },
      update: { trainerId, scheduleLabel: cellphoneProgram.scheduleLabel, startDate: new Date("2026-03-10T00:00:00.000Z") },
      create: {
        programId: cellphoneProgramId,
        trainerId,
        code: "2026-A",
        scheduleLabel: cellphoneProgram.scheduleLabel,
        startDate: new Date("2026-03-10T00:00:00.000Z"),
      },
    });

    // TrainingSession has no natural unique key — scope the delete-then-recreate to this batch.
    await prisma.assignment.deleteMany({ where: { batchId: batch.id } });
    await prisma.trainingSession.deleteMany({ where: { batchId: batch.id } });
    await prisma.trainingSession.createMany({
      data: TRAINING_SESSIONS.map((session) => ({
        id: session.id,
        batchId: batch.id,
        trainerId,
        title: session.title,
        sessionType: session.sessionType,
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        location: session.location,
      })),
    });

    await prisma.assignment.createMany({
      data: ASSIGNMENTS.map((assignment) => ({
        id: assignment.id,
        batchId: batch.id,
        trainerId,
        title: assignment.title,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate,
        dueTime: assignment.dueTime,
        allowedSubmissionTypes: [...assignment.allowedSubmissionTypes],
        linkedSessionId: assignment.linkedSessionId,
      })),
    });

    // Module has no natural unique key — scope the delete-then-recreate to this program.
    await prisma.module.deleteMany({ where: { programId: cellphoneProgramId } });
    await prisma.module.createMany({
      data: CELLPHONE_MODULES.map((module) => ({
        id: module.id,
        programId: cellphoneProgramId,
        trainerId,
        title: module.title,
        fileType: module.fileType,
        unitNumber: module.unitNumber,
        fileUrl: `/files/modules/${module.id}.${module.fileType.toLowerCase()}`, // NOT SOURCED — placeholder path, no real file was provided
        fileSizeBytes: module.fileSizeBytes,
        createdAt: module.createdAt,
      })),
    });

    // Enrollments — the 5 trainees on Henry's "Assigned Trainees" roster
    // (desktop-02.md #8/#16), each with its own verified EnrollmentPayment.
    const traineeEnrollments: {
      key: string;
      progressPercent: number;
      status: "COMPLETED" | "ACTIVE";
    }[] = [
      { key: "demoTrainee", progressPercent: 68, status: "ACTIVE" as const },
      ...SUPPORTING_TRAINEES.map((trainee) => ({
        key: trainee.key,
        progressPercent: trainee.progressPercent,
        // Liza Cruz is the one trainee already evaluated ("Trained" badge,
        // desktop-02.md #16) with a pending certificate request — her
        // enrollment is COMPLETED, not still ACTIVE.
        status: trainee.key === "liza" ? ("COMPLETED" as const) : ("ACTIVE" as const),
      })),
    ];

    let lizaEnrollmentId: string | null = null;
    for (const enrollment of traineeEnrollments) {
      const traineeId = userIdByKey.get(enrollment.key);
      if (!traineeId) continue;

      const referenceCode = `HT-ENR-SEED-${enrollment.key.toUpperCase()}`;
      const payment = await prisma.enrollmentPayment.upsert({
        where: { referenceCode },
        update: {
          traineeId,
          totalAmount: "5000.00",
          status: "VERIFIED",
          verifiedAt: new Date("2026-03-10T00:00:00.000Z"),
          verifiedByUserId: userIdByKey.get("demoAdmin") ?? null,
        },
        create: {
          traineeId,
          idempotencyKey: `seed-payment-${enrollment.key}`,
          referenceCode,
          paymentMethod: "GCASH",
          totalAmount: "5000.00",
          proofImageUrl: `/files/payment-proofs/${enrollment.key}.jpg`, // NOT SOURCED — placeholder path
          status: "VERIFIED",
          submittedAt: new Date("2026-03-09T00:00:00.000Z"),
          verifiedAt: new Date("2026-03-10T00:00:00.000Z"),
          verifiedByUserId: userIdByKey.get("demoAdmin") ?? null,
        },
      });

      const enrollmentRecord = await prisma.enrollment.upsert({
        where: { paymentId_programId: { paymentId: payment.id, programId: cellphoneProgramId } },
        update: {
          batchId: batch.id,
          amount: "5000.00",
          status: enrollment.status,
          progressPercent: enrollment.progressPercent,
          startDate: batch.startDate,
        },
        create: {
          enrollmentRef: `ENR-SEED-${enrollment.key.toUpperCase()}`,
          traineeId,
          programId: cellphoneProgramId,
          batchId: batch.id,
          paymentId: payment.id,
          amount: "5000.00",
          status: enrollment.status,
          progressPercent: enrollment.progressPercent,
          startDate: batch.startDate,
        },
      });

      if (enrollment.key === "liza") lizaEnrollmentId = enrollmentRecord.id;
    }

    // Evaluation + CertificateRequest for Liza Cruz (desktop-02.md #9/#16 —
    // "Trained" badge, pending CRT-1004).
    await prisma.assignmentSubmission.createMany({
      data: ASSIGNMENT_SUBMISSIONS.flatMap((submission) => {
        const traineeId = userIdByKey.get(submission.traineeKey);
        if (!traineeId) return [];
        return [
          {
            assignmentId: submission.assignmentId,
            traineeId,
            submissionLink: submission.submissionLink,
            submittedAt: submission.submittedAt,
          },
        ];
      }),
    });

    if (lizaEnrollmentId) {
      await prisma.evaluation.deleteMany({ where: { enrollmentId: lizaEnrollmentId } });
      await prisma.evaluation.create({
        data: {
          enrollmentId: lizaEnrollmentId,
          trainerId,
          rating: "CERTIFIED",
          evaluatedAt: new Date("2026-05-09T00:00:00.000Z"),
        },
      });

      await prisma.certificateRequest.upsert({
        where: { certificateCode: "CRT-1004" },
        update: {
          enrollmentId: lizaEnrollmentId,
          status: "PENDING",
          completedAt: new Date("2026-05-09T00:00:00.000Z"),
        },
        create: {
          enrollmentId: lizaEnrollmentId,
          certificateCode: "CRT-1004",
          status: "PENDING",
          completedAt: new Date("2026-05-09T00:00:00.000Z"),
          requestedAt: new Date("2026-05-10T00:00:00.000Z"),
        },
      });
    }
  }

  // 16. Notifications — the admin bell panel (mobile-05.md #30). No natural
  // unique key; scoped delete-then-recreate for this one seeded user.
  const demoAdminId = userIdByKey.get("demoAdmin");
  if (demoAdminId) {
    await prisma.notification.deleteMany({ where: { userId: demoAdminId } });
    await prisma.notification.createMany({
      data: [
        {
          userId: demoAdminId,
          title: "New enrollment to review",
          body: "Juan Dela Cruz enrolled in I.T. Software Development.",
          isRead: false,
        },
        {
          userId: demoAdminId,
          title: "New enrollment to review",
          body: "Juan Dela Cruz enrolled in Cellphone Hardware Servicing.",
          isRead: false,
        },
        {
          userId: demoAdminId,
          title: "New enrollment to review",
          body: "Juan Dela Cruz enrolled in Computer Hardware Servicing.",
          isRead: false,
        },
        {
          userId: demoAdminId,
          title: "3 enrollments awaiting approval",
          body: "Review the pending queue under Enrollments.",
          isRead: false,
        },
      ],
    });
  }

  if (demoAdminId) {
    await prisma.announcement.deleteMany({});
    await prisma.announcement.createMany({
      data: ANNOUNCEMENTS.map((announcement) => ({
        title: announcement.title,
        body: announcement.body,
        type: announcement.type,
        isPinned: announcement.isPinned,
        postedByUserId: demoAdminId,
        createdAt: announcement.createdAt,
      })),
    });
  }

  await prisma.auditLog.deleteMany({});
  await prisma.auditLog.createMany({
    data: AUDIT_LOG_ENTRIES.map((entry) => ({
      category: entry.category,
      action: entry.action,
      description: entry.description,
      referenceId: null,
      actorUserId: userIdByKey.get(entry.actorKey) ?? null,
      createdAt: entry.createdAt,
    })),
  });

  console.log(
    `Seeded ${TRAINERS.length} trainers, ${PROGRAMS.length} programs, ` +
      `${TESTIMONIALS.length} testimonials, ${GALLERY_PHOTOS.length} gallery photos, ` +
      `${FAQS.length} FAQs, ${PAYMENT_METHODS.length} payment methods, ` +
      `${DEMO_LOGIN_USERS.length} demo login users, ${SUPPORTING_TRAINEES.length} supporting trainees, ` +
      `${COMMUNITIES.length} communities, ${FORUM_POSTS.length} forum posts, ` +
      `${FORUM_REPLIES.length} replies, ${AUTHOR_RATINGS.length} author ratings, ` +
      `${ASSIGNMENTS.length} assignments, ${ASSIGNMENT_SUBMISSIONS.length} assignment submissions, ` +
      `${ANNOUNCEMENTS.length} announcements, ${AUDIT_LOG_ENTRIES.length} audit log entries.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
