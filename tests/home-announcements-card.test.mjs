import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AnnouncementsCard } from "../src/features/home/announcements-card.tsx";

const announcements = [
  {
    id: "batch-open",
    title: "June batch now open",
    body: "Enrollment is open for the next hands-on training batch.",
    type: "Enrollment",
    mediaUrl: null,
    createdAt: "2026-06-01T00:00:00.000Z",
  },
];

test("mobile announcement card is a floating overlay, not an in-flow row", () => {
  const markup = renderToStaticMarkup(
    createElement(AnnouncementsCard, { announcements, variant: "mobile" }),
  );

  assert.match(markup, /absolute/);
  assert.match(markup, /top-\[5\.25rem\]/);
  assert.match(markup, /2xl:hidden/);
  assert.match(markup, /min-h-20/);
  assert.doesNotMatch(markup, /justify-self|grid-cols/);
});

test("floating announcement card remains desktop-only right rail", () => {
  const markup = renderToStaticMarkup(
    createElement(AnnouncementsCard, { announcements, variant: "floating" }),
  );

  assert.match(markup, /fixed/);
  assert.match(markup, /2xl:block/);
  assert.match(markup, /Read full update/);
});
