import assert from "node:assert/strict";
import { test } from "node:test";

const { getInitials } = await import("../../src/components/dashboard/get-initials.ts");

test("getInitials strips honorifics and uses the outer letters", () => {
  assert.equal(getInitials("Mr. Henry Gomata Lopez"), "HL");
  assert.equal(getInitials("Admin Console"), "AC");
  assert.equal(getInitials("Carlos Reyes"), "CR");
  assert.equal(getInitials("Maria Santos"), "MS");
  assert.equal(getInitials("Prince"), "PR");
  assert.equal(getInitials(""), "");
});
