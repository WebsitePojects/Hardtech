# Production release checklist

Use this checklist for each production release. It records deployment actions
that source code cannot safely perform without provider access.

## Domain and search

- [ ] In Vercel Production, set `NEXT_PUBLIC_SITE_URL=https://www.hardtech.pro`.
      Redeploy after changing it. The value controls canonical URLs, Open Graph
      URLs, `robots.txt`, `sitemap.xml`, and certificate QR links.
- [ ] Make `www.hardtech.pro` the Vercel production domain and redirect
      `hardtech.pro` to it. Verify `https://www.hardtech.pro/sitemap.xml`,
      `https://www.hardtech.pro/robots.txt`, and a marketing page all use the
      `www` canonical origin.
- [ ] Do not publish structured contact, accreditation, rating, price, or
      opening-hours data until HardTech has verified those facts. The current
      JSON-LD intentionally contains only the organisation name, site URL,
      logo, and training description.

## Environment and data

- [ ] Set `DATABASE_URL` and `DIRECT_URL` to the production Supabase values;
      neither may point to `localhost`.
- [ ] Set `AUTH_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
      `CLOUDINARY_API_SECRET` in Vercel Production. Keep Cloudinary secrets out
      of the repository and browser-visible `NEXT_PUBLIC_` variables.
- [ ] If direct uploads are enabled, create signed Cloudinary upload presets
      with the server-enforced size and resource-type limits, then set every
      corresponding Vercel environment variable:
      `CLOUDINARY_DIRECT_UPLOAD_PRESET_MODULE_FILE`,
      `CLOUDINARY_DIRECT_UPLOAD_PRESET_GALLERY_PHOTO`,
      `CLOUDINARY_DIRECT_UPLOAD_PRESET_ANNOUNCEMENT_MEDIA`,
      `CLOUDINARY_DIRECT_UPLOAD_PRESET_ASSIGNMENT_SUBMISSION`,
      `CLOUDINARY_DIRECT_UPLOAD_PRESET_POST_ATTACHMENT`,
      `CLOUDINARY_DIRECT_UPLOAD_PRESET_REPLY_ATTACHMENT`, and
      `CLOUDINARY_DIRECT_UPLOAD_PRESET_MESSAGE_ATTACHMENT`.
- [ ] Confirm `DEMO_AUTH` is unset or set to `false` in Production. It must
      never be `true`.
- [ ] Before deployment, run `npx prisma migrate deploy` using `DIRECT_URL`.
      Confirm the command reports successful migration application, then run
      the intended production smoke tests against migrated data.

## Cron and post-deploy checks

- [ ] `vercel.json` currently schedules the purge, stale-upload reaper, and
      certificate recovery routes once daily (03:00, 04:00, and 04:30 UTC).
      Choose a frequency supported by the active Vercel plan before changing
      these schedules; update the route comments and operational expectations
      in the same release.
- [ ] Verify Vercel supplies `CRON_SECRET` and each cron route rejects a
      request without the expected bearer token.
- [ ] After deploy, inspect response headers on a marketing page for
      `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`,
      `Referrer-Policy`, and `Permissions-Policy`.
- [ ] A Content Security Policy is intentionally deferred: Next font/runtime
      scripts and Cloudinary delivery/upload origins need a production allowlist
      verified with browser and upload smoke tests before CSP can be enforced
      without breaking the application. Deploy CSP first in report-only mode,
      review violations, then enforce the narrow allowlist.
