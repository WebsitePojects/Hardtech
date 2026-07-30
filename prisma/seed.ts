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
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// ---------------------------------------------------------------------------
// Trainers — the 4 named staff on /about (desktop-01 #9, mobile-01 #16-20).
// Facebook handles from docs/research/01-design-source.md. Emails are not
// shown in any screenshot; they are seed-only login identifiers following an
// obvious institutional pattern, not sourced content.
// ---------------------------------------------------------------------------

const TRAINERS = [
  {
    key: "henry",
    email: "henry.lopez@hardtechitcorp.com",
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
// Gallery photos — /gallery "Training in Action" grid (mobile-06
// #14:33:54-14:34:14). The screenshots confirm 8 real training/graduation
// photographs with NO visible captions anywhere in the corpus (mobile-06:
// "no visible captions... no lightbox affordance"), so `caption` is left
// null for every row rather than inventing text that was never on screen.
// No hosted image files were provided in the corpus (the only real asset on
// record, per docs/research/01-design-source.md, is one unrelated Unsplash
// stock photo), so `imageUrl` uses a placeholder path convention — NOT a
// sourced URL — pending real asset upload.
// ---------------------------------------------------------------------------

const GALLERY_PHOTOS = [
  "/images/gallery/shop-interior-group-01.jpg",
  "/images/gallery/night-group-photo.jpg",
  "/images/gallery/trainee-closeup.jpg",
  "/images/gallery/workshop-microscope-bench.jpg",
  "/images/gallery/graduation-certificates-group.jpg",
  "/images/gallery/motherboard-teardown-closeup.jpg",
  "/images/gallery/microscope-soldering-handson.jpg",
  "/images/gallery/shop-interior-group-02.jpg",
].map((imageUrl, index) => ({ imageUrl, caption: null, sortOrder: index }));

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
// Maya/Bank Transfer/Card never show an account number or bank name on any
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
// Seed run
// ---------------------------------------------------------------------------

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

  console.log(
    `Seeded ${TRAINERS.length} trainers, ${PROGRAMS.length} programs, ` +
      `${TESTIMONIALS.length} testimonials, ${GALLERY_PHOTOS.length} gallery photos, ` +
      `${FAQS.length} FAQs, ${PAYMENT_METHODS.length} payment methods.`,
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
