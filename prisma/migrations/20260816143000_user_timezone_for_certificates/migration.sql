-- Store a validated IANA timezone preference per user.
--
-- Existing DateTime columns already store canonical instants; this column is
-- intentionally display-only. Existing users fall back to HardTech's operating
-- timezone so old certificate rows continue to render exactly as before.
ALTER TABLE "User"
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Manila';

