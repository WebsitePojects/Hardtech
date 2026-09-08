# Memory Bank

- Generate a client idempotency key once per user intent; retain it only while that intent is in flight or retrying, then generate a new key for a later deliberate toggle.
