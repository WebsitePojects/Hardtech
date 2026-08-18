import { notFound } from "next/navigation";

/**
 * The Playwright screenshot harness that used to live here is gone: the real
 * messaging service (src/server/services/messaging.service.ts) shipped, so
 * the condition in the harness's own removal comment is met. This stub stays
 * only so a stale bookmark or crawled link to /messages/dev-preview resolves
 * to a hard 404 instead of a server error — it imports no fixture data and
 * renders nothing. See tests/mutations/messaging-route-safety.test.mjs,
 * which asserts this route is hard-blocked and ships no fixture identifiers.
 */
export default function DevPreviewPage(): never {
  notFound();
}
