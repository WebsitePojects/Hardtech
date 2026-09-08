# Memory Bank

- Generate a client idempotency key once per user intent; retain it only while that intent is in flight or retrying, then generate a new key for a later deliberate toggle.
- Never scope a terminal-state read through an ACTIVE-only relation; lifecycle reads must explicitly include the terminal state the UI needs.

- When a public catalog has only two active choices, render both as direct, independently actionable features; carousel state obscures comparison and adds no value.

- Keep nonessential announcement content secondary to the hero task: a stable in-flow teaser on small screens prevents motion from interrupting reading or displacing the primary CTA.
