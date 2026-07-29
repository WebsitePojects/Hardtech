-- Integrity CHECK constraints not expressible in prisma/schema.prisma's DSL.
-- See docs/adr/0001-data-model.md, "Constraints not expressible in Prisma
-- schema" for the full rationale, the screen each guard protects, and the
-- self-reference cases that were considered and deliberately NOT added.
--
-- NOTE: this is the first file in prisma/migrations/. There is no baseline
-- migration yet (CREATE TABLE for the 29 models has never been generated
-- against a real database, per instruction not to run `prisma migrate dev`
-- here). Before this can be `prisma migrate deploy`-ed for real, someone
-- with a live database needs to run `prisma migrate dev --create-only` to
-- generate the baseline schema migration first; this file assumes that
-- baseline already exists ahead of it.

-- ---------------------------------------------------------------------------
-- Self-reference / conflict-of-interest guards
-- ---------------------------------------------------------------------------

-- Rating Leaderboard (desktop-01 #11-13, desktop-02 #28-31) ranks users by
-- average star rating. Without this, any user can rate themselves 5 stars
-- and inflate their own leaderboard position — a visible, gameable feature.
ALTER TABLE "AuthorRating"
  ADD CONSTRAINT "AuthorRating_no_self_rating"
  CHECK ("ratedUserId" <> "raterUserId");

-- A reply cannot be its own parent (Reply.parentReplyId is a self-relation
-- used for the rare nested-reply case, mobile-01 #29-30).
ALTER TABLE "Reply"
  ADD CONSTRAINT "Reply_no_self_parent"
  CHECK ("parentReplyId" IS NULL OR "parentReplyId" <> "id");

-- "Trainee posts require approval" (desktop-01 #11, forum guideline 5) is
-- the whole point of ForumPost.status/approvedByUserId. Without this, a
-- trainee's own post could be recorded as self-approved, silently bypassing
-- moderation.
ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_no_self_approval"
  CHECK ("approvedByUserId" IS NULL OR "authorId" <> "approvedByUserId");

-- Admin "Verify & Approve" on a payment (desktop-02 #3) is a financial
-- control. Without this, a trainee whose account is later promoted (User
-- Management "Update role") could end up recorded as having verified their
-- own historical enrollment payment.
ALTER TABLE "EnrollmentPayment"
  ADD CONSTRAINT "EnrollmentPayment_no_self_verification"
  CHECK ("verifiedByUserId" IS NULL OR "traineeId" <> "verifiedByUserId");

-- ---------------------------------------------------------------------------
-- Numeric range guards
-- ---------------------------------------------------------------------------

-- The forum UI is a 5-star control (desktop-01/02 star ratings).
ALTER TABLE "AuthorRating"
  ADD CONSTRAINT "AuthorRating_stars_range"
  CHECK ("stars" BETWEEN 1 AND 5);

-- Progress bars are rendered as a percentage everywhere they appear
-- (desktop-02 #16, #25 "Program Progress 68%").
ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_progress_percent_range"
  CHECK ("progressPercent" BETWEEN 0 AND 100);

-- Money can never be negative. Zero is left legal (e.g. a hypothetical
-- promotional/free program), only negative values are rejected.
ALTER TABLE "Program"
  ADD CONSTRAINT "Program_price_amount_non_negative"
  CHECK ("priceAmount" >= 0);

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_amount_non_negative"
  CHECK ("amount" >= 0);

ALTER TABLE "EnrollmentPayment"
  ADD CONSTRAINT "EnrollmentPayment_total_amount_non_negative"
  CHECK ("totalAmount" >= 0);

-- Forum post counters (desktop-01/02 post footer: views/upvotes/helpful/
-- insightful/replies/bookmarks/reports) are accumulating counts and can
-- never be negative, however the maintaining service increments/decrements
-- them.
ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_view_count_non_negative"
  CHECK ("viewCount" >= 0);

ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_upvote_count_non_negative"
  CHECK ("upvoteCount" >= 0);

ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_helpful_count_non_negative"
  CHECK ("helpfulCount" >= 0);

ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_insightful_count_non_negative"
  CHECK ("insightfulCount" >= 0);

ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_reply_count_non_negative"
  CHECK ("replyCount" >= 0);

ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_bookmark_count_non_negative"
  CHECK ("bookmarkCount" >= 0);

ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_report_count_non_negative"
  CHECK ("reportCount" >= 0);

-- Reply reaction counters — same reasoning as ForumPost's counters above.
ALTER TABLE "Reply"
  ADD CONSTRAINT "Reply_upvote_count_non_negative"
  CHECK ("upvoteCount" >= 0);

ALTER TABLE "Reply"
  ADD CONSTRAINT "Reply_helpful_count_non_negative"
  CHECK ("helpfulCount" >= 0);

ALTER TABLE "Reply"
  ADD CONSTRAINT "Reply_insightful_count_non_negative"
  CHECK ("insightfulCount" >= 0);

-- Uploaded file size (desktop-02 #21 Modules: "2.4 MB", "84 MB", ...).
ALTER TABLE "Module"
  ADD CONSTRAINT "Module_file_size_bytes_non_negative"
  CHECK ("fileSizeBytes" >= 0);

-- Display-order fields used to render checklists/grids in a fixed order
-- (COURSE MODULES checklist, /gallery grid, testimonial grid, FAQ
-- accordion). Negative sort order is meaningless.
ALTER TABLE "ProgramCurriculumTopic"
  ADD CONSTRAINT "ProgramCurriculumTopic_sort_order_non_negative"
  CHECK ("sortOrder" >= 0);

ALTER TABLE "GalleryPhoto"
  ADD CONSTRAINT "GalleryPhoto_sort_order_non_negative"
  CHECK ("sortOrder" >= 0);

ALTER TABLE "Testimonial"
  ADD CONSTRAINT "Testimonial_sort_order_non_negative"
  CHECK ("sortOrder" >= 0);

ALTER TABLE "Faq"
  ADD CONSTRAINT "Faq_sort_order_non_negative"
  CHECK ("sortOrder" >= 0);
