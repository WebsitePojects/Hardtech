import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProgramsSection } from "../src/features/home/programs-section.tsx";

function programFixture(overrides = {}) {
  return {
    id: "computer-hardware",
    name: "Computer Hardware Servicing",
    shortName: "Computer Hardware",
    durationLabel: "120 hours",
    marketingEnrolledLabel: "2,400+ enrolled",
    iconName: "cpu",
    accentColor: "green",
    imageUrl: null,
    ...overrides,
  };
}

function renderPrograms(programs) {
  return renderToStaticMarkup(createElement(ProgramsSection, { programs }));
}

test("Core Programs presents a useful empty state", () => {
  const markup = renderPrograms([]);

  assert.match(markup, /Programs are being prepared/);
  assert.doesNotMatch(markup, /View program details/);
});

test("Core Programs preserves one program's details and encoded detail link", () => {
  const markup = renderPrograms([programFixture()]);

  assert.match(markup, /Computer Hardware Servicing/);
  assert.match(markup, /120 hours/);
  assert.match(markup, /2,400\+ enrolled/);
  assert.match(markup, /href="\/programs\/Computer%20Hardware"/);
  assert.match(markup, /aria-label="View details for Computer Hardware Servicing"/);
});

test("Core Programs renders every supplied program as a direct link without carousel controls", () => {
  const markup = renderPrograms([
    programFixture(),
    programFixture({
      id: "cellphone-hardware",
      name: "Cellphone Hardware Servicing",
      shortName: "Cellphone Repair",
      durationLabel: "80 hours",
      marketingEnrolledLabel: "1,200+ enrolled",
      iconName: "smartphone",
      accentColor: "blue",
    }),
  ]);

  assert.match(markup, /href="\/programs\/Computer%20Hardware"/);
  assert.match(markup, /href="\/programs\/Cellphone%20Repair"/);
  assert.equal((markup.match(/View program details/g) ?? []).length, 2);
  assert.doesNotMatch(markup, /Previous program|Next program|Go to .*program/);
  assert.doesNotMatch(markup, /carousel/);
});
