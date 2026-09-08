import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const clients = [
  "src/features/messaging/upload-client.ts",
  "src/features/dashboard-trainee/submit-assignment.ts",
];

test("browser upload clients preserve the signed Cloudinary policy fields", async () => {
  for (const client of clients) {
    const source = await readFile(client, "utf8");

    assert.match(source, /allowedFormats:\s*readonly string\[\];/, `${client} types the allowed formats ticket field`);
    assert.match(source, /uploadPreset:\s*string;/, `${client} types the upload preset ticket field`);
    assert.match(
      source,
      /body\.append\("allowed_formats", ticket\.allowedFormats\.join\(","\)\);/,
      `${client} sends the exact comma-joined value signed by the server`,
    );
    assert.match(
      source,
      /body\.append\("upload_preset", ticket\.uploadPreset\);/,
      `${client} sends the exact preset signed by the server`,
    );
  }
});
