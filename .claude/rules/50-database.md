# Database design — built for millions of rows

Standing rule for every schema change. The seed has 23 users; the design target
is a production system with millions of rows and real concurrent traffic. A
schema that is pleasant at 23 rows and collapses at 2 million is a defect, not a
future optimisation.

Anyone changing `prisma/schema.prisma` or writing a query is acting as the DBA
and owns these.

## Indexing

- **Every column used in a `WHERE`, `ORDER BY`, or `JOIN` in real application
  code gets an index.** Not "probably indexed" — check the actual query.
- **Compound indexes follow the query, and column order matters.** An index on
  `(a, b)` serves `WHERE a` and `WHERE a AND b`, but not `WHERE b` alone. Write
  the index in the order the query filters.
- **Sort keys belong in the index.** A feed ordered by `createdAt DESC` and
  filtered by `communityId` needs `@@index([communityId, createdAt])`, or
  Postgres sorts the whole partition on every page load.
- **Foreign keys are not automatically indexed in Postgres.** Prisma does not
  add them either. Every FK you filter or join on needs an explicit `@@index`.
- Do not index everything. Each index costs write throughput and storage. Index
  what queries actually use, and say which query each one serves.

## Pagination

- **Never `findMany` without a bound.** Every list query takes `take`, and the
  page size is clamped server-side. A client asking for 10,000 rows gets the
  maximum, not 10,000.
- **Prefer keyset (cursor) pagination over `skip` for anything that can grow
  large.** `OFFSET 50000` makes Postgres walk and discard 50,000 rows on every
  request. Cursor on an indexed, ordered, unique-tiebroken key instead.
- A `count()` for "page 1 of N" is a full scan on a large table. Either drop the
  total, approximate it, or accept the cost knowingly and say so.

## Query shape

- **No N+1.** One query per list, not one per row. Use `include`/`select` or a
  single join. If a loop contains an `await` on a repository call, that is an
  N+1 until proven otherwise.
- **`select` only the columns needed.** `findMany` with no `select` on a table
  holding text bodies drags every byte across the wire.
- **Push filtering into the database.** Fetching rows to filter them in
  JavaScript does not scale and usually leaks rows the caller should not see.
- Watch out for unbounded `include` on a one-to-many — that is a hidden full
  scan of the child table per parent.

## Integrity — in the database, not only in code

- Every uniqueness rule the product states is a `@@unique`, not an application
  check. Application checks race; constraints do not.
- Every mutating path that must not double-apply gets a unique constraint or a
  conditional state-transition `UPDATE`. Side effects fire only in the winning
  transaction.
- Use `CHECK` constraints for value ranges (percentages, non-negative money).
  A constraint without a failing-case test is a comment — test the violation and
  assert the constraint name.
- Choose `onDelete` deliberately per relation. `Cascade` on the wrong relation
  silently destroys history; `Restrict` on the wrong one blocks legitimate
  deletes. Say why in a comment.

## Growth-shaped tables need extra care

Tables that grow without bound — messages, notifications, audit logs, forum
posts, reactions, uploads — need a retention or archival answer at design time,
not after they hurt. State the plan even if the plan is "keep forever, here is
why that is affordable".

For counters (reaction counts, view counts): incrementing a column on a hot row
serialises writes on that row. Either aggregate from the source table with a
covering index, or use a denormalised counter updated in a way that does not
contend. Decide, and write down which.

## Migrations

- Migrations must be safe to run against a live database with real traffic.
  Adding a `NOT NULL` column with no default rewrites the table and locks it.
  Add nullable, backfill in batches, then enforce.
- Adding an index on a large table locks writes unless created concurrently.
- Never point migrations at the pooled connection — see `40-prisma-7.md`.
- Migration SQL must be BOM-free (see the lessons log).

## Security at the data layer

- Parameterised queries only. `$queryRaw` uses tagged-template interpolation,
  never string concatenation.
- The server recomputes money and quantities. A price, role, or scope arriving
  from a client is input to validate, never a value to trust.
- Queries that return user data filter by the actor's scope in the `WHERE`
  clause, not by trimming results afterwards.
- Public endpoints select the minimum columns that satisfy the use case. A
  verification endpoint returns the fact, not the record.

## What to state when you change the schema

Every schema change reports:

1. Which queries the new indexes serve.
2. The expected row count of each new table at scale.
3. The pagination strategy for anything list-shaped.
4. Which constraints enforce the product's uniqueness rules.
5. Whether the migration is safe to run online.
