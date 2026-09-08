import "dotenv/config";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const { EnrollWizard } = await import("../../src/features/enroll/enroll-wizard.tsx");
const { StepSelectPlan } = await import("../../src/features/enroll/steps/step-select-plan.tsx");
const {
  enrollProgramQuerySchema,
  MAX_ENROLLMENT_PROGRAMS,
  planSelectionSchema,
} = await import("../../src/features/enroll/enroll.schema.ts");

const programs = [
  { id: "open-a", slug: "open-a", name: "Open track A", durationLabel: "4 weeks", scheduleLabel: "Weekdays", priceCentavos: 100_000, iconName: "cpu", accentColor: "green", curriculumTopics: ["Diagnostics"] },
  { id: "open-b", slug: "open-b", name: "Open track B", durationLabel: "6 weeks", scheduleLabel: "Weekends", priceCentavos: 150_000, iconName: "smartphone", accentColor: "blue", curriculumTopics: ["Repair"] },
  { id: "open-c", slug: "open-c", name: "Open track C", durationLabel: "2 weeks", scheduleLabel: "Evenings", priceCentavos: 80_000, iconName: "cpu", accentColor: "orange", curriculumTopics: [] },
  { id: "open-d", slug: "open-d", name: "Open track D", durationLabel: "8 weeks", scheduleLabel: "Weekdays", priceCentavos: 200_000, iconName: "cpu", accentColor: "purple", curriculumTopics: [] },
];

test("public program query accepts only a single lowercase slug, never display names or repeated values", () => {
  assert.deepEqual(enrollProgramQuerySchema.parse({ program: "open-a" }), { program: "open-a" });
  assert.equal(enrollProgramQuerySchema.safeParse({ program: "Open track A" }).success, false);
  assert.equal(enrollProgramQuerySchema.safeParse({ program: ["open-a", "open-b"] }).success, false);
  assert.equal(enrollProgramQuerySchema.safeParse({ program: "Open-A" }).success, false);
});

test("wizard selects only its server-supplied initial program and never accepts an unknown id", () => {
  const baseProps = { programs, paymentMethods: [] };
  const selected = renderToStaticMarkup(createElement(EnrollWizard, { ...baseProps, initialProgramId: "open-b" }));
  assert.match(selected, /aria-checked="true"/, "a server-resolved open program preselects in the wizard");
  assert.match(selected, /Open track B/, "the preselected row stays visible to the applicant");

  const rejected = renderToStaticMarkup(createElement(EnrollWizard, { ...baseProps, initialProgramId: "unknown-id" }));
  assert.doesNotMatch(rejected, /aria-checked="true"/, "an id outside the server-provided open catalog cannot preselect");
});

test("plan picker renders every supplied open program and preserves the checkout maximum", () => {
  const markup = renderToStaticMarkup(createElement(StepSelectPlan, {
    programs,
    selectedProgramIds: [],
    onChangeSelection() {},
    onContinue() {},
  }));

  for (const program of programs) assert.match(markup, new RegExp(program.name));
  assert.equal(planSelectionSchema.safeParse({ programIds: programs.slice(0, MAX_ENROLLMENT_PROGRAMS).map((program) => program.id) }).success, true);
  assert.equal(planSelectionSchema.safeParse({ programIds: programs.map((program) => program.id) }).success, false);
});

test("public catalog routes use immutable slug lookups and no name-based plan filtering", async () => {
  const [pickerSource, detailSource, enrollmentSource] = await Promise.all([
    readFile("src/features/enroll/steps/step-select-plan.tsx", "utf8"),
    readFile("src/app/(marketing)/programs/[slug]/page.tsx", "utf8"),
    readFile("src/app/(marketing)/enroll/page.tsx", "utf8"),
  ]);

  assert.match(pickerSource, /programs\.map\(/);
  assert.doesNotMatch(pickerSource, /Computer Hardware Servicing|Cellphone Hardware Servicing/);
  assert.match(detailSource, /getPublishedProgramBySlug/);
  assert.match(detailSource, /notFound\(\)/);
  assert.match(enrollmentSource, /getPublishedProgramBySlug/);
  assert.match(enrollmentSource, /enrollmentOpen/);
});
