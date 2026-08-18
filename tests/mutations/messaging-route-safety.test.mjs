import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const newRoutePath = "src/app/(app)/messages/new/page.tsx";
const newFormPath = "src/features/messaging/new-conversation-form.tsx";
const devPreviewPagePath = "src/app/(app)/messages/dev-preview/page.tsx";

test("/messages/new GET page is side-effect-free", async () => {
  const source = await readFile(newRoutePath, "utf8");

  assert.match(source, /requireSession/, "GET render remains authenticated");
  assert.doesNotMatch(
    source,
    /getOrCreateDirectConversation|getOrCreateConversation\(/,
    "GET render must not call the get-or-create mutation path",
  );
  assert.doesNotMatch(
    source,
    /from\s+["']@\/server\/services\/messaging\.service["']/,
    "GET render must not import the messaging write service",
  );
});

test("new conversation mutation stays behind explicit client confirmation", async () => {
  const source = await readFile(newFormPath, "utf8");

  assert.match(source, /onClick=\{\(\) => void handleConfirm\(\)\}/, "mutation is wired to a click");
  assert.match(source, /if \(isPending\) return/, "handler has an early-return pending guard");
  assert.match(source, /disabled=\{!canSubmit\}/, "confirm button is disabled when invalid or pending");
  assert.match(source, /aria-busy=\{isPending\}/, "pending state is exposed accessibly");
});

test("dev preview route is hard-blocked and does not expose fixture data", async () => {
  const source = await readFile(devPreviewPagePath, "utf8");

  assert.match(source, /notFound\(\)/, "dev preview page must be hard-blocked");
  assert.doesNotMatch(source, /dev-fixtures|DEV_CONVERSATIONS|DEV_MESSAGES/, "fixture data must not be imported");
});
