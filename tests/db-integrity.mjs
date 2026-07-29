import pg from "pg";

/**
 * Integration test: proves the CHECK and UNIQUE constraints declared in
 * prisma/migrations are actually enforced by the database, not merely present
 * in a .sql file. Counts reconciling between schema and migration proves
 * nothing — only executing a violation does.
 *
 * Every assertion runs inside a transaction that is rolled back, so the test
 * leaves no residue beyond its two seed users.
 *
 * Requires a live Postgres with migrations already applied:
 *   npx prisma dev --detach --name hardtech     # prints a connection URL
 *   npx prisma migrate deploy
 *   TEST_DATABASE_URL=<that url> npm run test:db
 */

const connectionString =
  process.env.TEST_DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  console.error(
    "TEST_DATABASE_URL (or DIRECT_URL) must point at a database with " +
      "migrations applied.",
  );
  process.exit(2);
}

const client = new pg.Client({ connectionString });

let pass = 0;
let fail = 0;

const ok = (n, d) => {
  pass += 1;
  console.log(`  PASS  ${n}${d ? ` — ${d}` : ""}`);
};
const bad = (n, d) => {
  fail += 1;
  console.log(`  FAIL  ${n}${d ? ` — ${d}` : ""}`);
};

async function expectReject(name, expected, sql) {
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("ROLLBACK");
    bad(name, "ACCEPTED but should have been rejected");
  } catch (e) {
    await client.query("ROLLBACK");
    if (e.constraint === expected) ok(name, `rejected by ${e.constraint}`);
    else
      bad(name, `rejected by ${e.constraint ?? e.code}, expected ${expected}`);
  }
}

async function expectAccept(name, sql) {
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("ROLLBACK");
    ok(name);
  } catch (e) {
    await client.query("ROLLBACK");
    bad(name, `unexpectedly rejected: ${e.constraint ?? e.message}`);
  }
}

await client.connect();

await client.query(`
  INSERT INTO "User" (id,email,"passwordHash","firstName","lastName",role,status,"createdAt","updatedAt")
  VALUES ('u_alice','alice@test.local','x','Alice','Cruz','TRAINEE','ACTIVE',now(),now()),
         ('u_bob','bob@test.local','x','Bob','Reyes','ADMIN','ACTIVE',now(),now())
  ON CONFLICT (id) DO NOTHING`);

await client.query(`
  INSERT INTO "Program" (id,name,"shortName",description,"durationLabel","scheduleLabel","levelLabel","priceAmount","createdAt","updatedAt")
  VALUES ('pr1','Computer Hardware Servicing','CHS','d','6 months','Mon-Fri','Beginner',5000,now(),now())
  ON CONFLICT (id) DO NOTHING`);

await client.query(`
  INSERT INTO "EnrollmentPayment"
    (id,"traineeId","idempotencyKey","referenceCode","paymentMethod","totalAmount","proofImageUrl",status,"submittedAt","createdAt","updatedAt")
  VALUES ('pay1','u_alice','KEY-OK','REF-OK','GCASH',5000,'x','SUBMITTED',now(),now(),now())
  ON CONFLICT (id) DO NOTHING`);

console.log("\nAuthorRating — self-rating + star range");
await expectReject(
  "user cannot rate themselves",
  "AuthorRating_no_self_rating",
  `INSERT INTO "AuthorRating" (id,"ratedUserId","raterUserId",stars,"createdAt","updatedAt")
   VALUES ('r1','u_alice','u_alice',5,now(),now())`,
);
await expectReject(
  "stars = 9 rejected",
  "AuthorRating_stars_range",
  `INSERT INTO "AuthorRating" (id,"ratedUserId","raterUserId",stars,"createdAt","updatedAt")
   VALUES ('r2','u_alice','u_bob',9,now(),now())`,
);
await expectReject(
  "stars = 0 rejected",
  "AuthorRating_stars_range",
  `INSERT INTO "AuthorRating" (id,"ratedUserId","raterUserId",stars,"createdAt","updatedAt")
   VALUES ('r3','u_alice','u_bob',0,now(),now())`,
);
await expectAccept(
  "legitimate 5-star rating of another user accepted",
  `INSERT INTO "AuthorRating" (id,"ratedUserId","raterUserId",stars,"createdAt","updatedAt")
   VALUES ('r4','u_alice','u_bob',5,now(),now())`,
);
await expectReject(
  "same rater cannot rate same author twice (idempotent toggle)",
  "AuthorRating_ratedUserId_raterUserId_key",
  `INSERT INTO "AuthorRating" (id,"ratedUserId","raterUserId",stars,"createdAt","updatedAt")
   VALUES ('r5','u_alice','u_bob',4,now(),now()),('r6','u_alice','u_bob',2,now(),now())`,
);

console.log("\nEnrollmentPayment — double-submit + money + self-verification");
await expectReject(
  "duplicate idempotencyKey rejected (double-submit guard)",
  "EnrollmentPayment_idempotencyKey_key",
  `INSERT INTO "EnrollmentPayment"
     (id,"traineeId","idempotencyKey","referenceCode","paymentMethod","totalAmount","proofImageUrl",status,"submittedAt","createdAt","updatedAt")
   VALUES ('p1','u_alice','DUP','R1','GCASH',5000,'x','SUBMITTED',now(),now(),now()),
          ('p2','u_alice','DUP','R2','GCASH',5000,'x','SUBMITTED',now(),now(),now())`,
);
await expectReject(
  "negative payment amount rejected",
  "EnrollmentPayment_total_amount_non_negative",
  `INSERT INTO "EnrollmentPayment"
     (id,"traineeId","idempotencyKey","referenceCode","paymentMethod","totalAmount","proofImageUrl",status,"submittedAt","createdAt","updatedAt")
   VALUES ('p3','u_alice','NEG','R3','GCASH',-1,'x','SUBMITTED',now(),now(),now())`,
);
await expectReject(
  "trainee cannot verify their own payment",
  "EnrollmentPayment_no_self_verification",
  `INSERT INTO "EnrollmentPayment"
     (id,"traineeId","idempotencyKey","referenceCode","paymentMethod","totalAmount","proofImageUrl",status,"submittedAt","verifiedByUserId","createdAt","updatedAt")
   VALUES ('p4','u_alice','SELF','R4','GCASH',5000,'x','VERIFIED',now(),'u_alice',now(),now())`,
);

console.log("\nForumPost — moderation self-approval");
await expectReject(
  "author cannot self-approve their own post (defeats trainee moderation)",
  "ForumPost_no_self_approval",
  `INSERT INTO "ForumPost" (id,"authorId",category,title,body,hashtags,status,"approvedByUserId","createdAt","updatedAt")
   VALUES ('fp1','u_alice','QA_HELP','T','B','{}','PUBLISHED','u_alice',now(),now())`,
);
await expectAccept(
  "admin approving another user's post accepted",
  `INSERT INTO "ForumPost" (id,"authorId",category,title,body,hashtags,status,"approvedByUserId","createdAt","updatedAt")
   VALUES ('fp2','u_alice','QA_HELP','T','B','{}','PUBLISHED','u_bob',now(),now())`,
);
await expectReject(
  "negative view count rejected",
  "ForumPost_view_count_non_negative",
  `INSERT INTO "ForumPost" (id,"authorId",category,title,body,hashtags,status,"viewCount","createdAt","updatedAt")
   VALUES ('fp3','u_alice','QA_HELP','T','B','{}','PUBLISHED',-1,now(),now())`,
);

console.log("\nEnrollment — progress range + payment/program uniqueness");
await expectReject(
  "progressPercent = 101 rejected",
  "Enrollment_progress_percent_range",
  `INSERT INTO "Enrollment" (id,"enrollmentRef","traineeId","programId","paymentId",amount,status,"progressPercent","createdAt","updatedAt")
   VALUES ('e1','ENR-1','u_alice','pr1','pay1',5000,'PENDING_VERIFICATION',101,now(),now())`,
);
await expectReject(
  "same payment cannot fund same program twice",
  "Enrollment_paymentId_programId_key",
  `INSERT INTO "Enrollment" (id,"enrollmentRef","traineeId","programId","paymentId",amount,status,"progressPercent","createdAt","updatedAt")
   VALUES ('e2','ENR-2','u_alice','pr1','pay1',5000,'PENDING_VERIFICATION',0,now(),now()),
          ('e3','ENR-3','u_alice','pr1','pay1',5000,'PENDING_VERIFICATION',0,now(),now())`,
);

console.log(`\n${"=".repeat(60)}`);
console.log(`RESULT: ${pass} passed, ${fail} failed`);
console.log("=".repeat(60));

await client.end();
process.exit(fail === 0 ? 0 : 1);
