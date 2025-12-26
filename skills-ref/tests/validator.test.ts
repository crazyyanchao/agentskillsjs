/** Tests for validator module. */

import { describe, expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";

import { validate } from "../src/skills-ref/validator.js";

const TEMP_DIR = path.join(tmpdir(), "skills-ref-tests-validator");

async function createTempDir(): Promise<string> {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  return TEMP_DIR;
}

async function createTempSkill(name: string, content: string): Promise<string> {
  const skillDir = path.join(TEMP_DIR, name);
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(path.join(skillDir, "SKILL.md"), content);
  return skillDir;
}

describe("validate", () => {
  beforeAll(async () => {
    await createTempDir();
  });

  afterAll(async () => {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
  });

  it("valid skill", async () => {
    const skillDir = await createTempSkill(
      "my-skill",
      `---
name: my-skill
description: A test skill
---
# My Skill
`,
    );
    const errors = await validate(skillDir);
    expect(errors).toEqual([]);
  });

  it("nonexistent path", async () => {
    const errors = await validate(path.join(TEMP_DIR, "nonexistent"));
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("does not exist");
  });

  it("not a directory", async () => {
    const filePath = path.join(TEMP_DIR, "file.txt");
    await fs.writeFile(filePath, "test");
    const errors = await validate(filePath);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("Not a directory");
  });

  it("missing skill md", async () => {
    const skillDir = path.join(TEMP_DIR, "my-skill-missing-md");
    await fs.mkdir(skillDir, { recursive: true });
    const errors = await validate(skillDir);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("Missing required file: SKILL.md");
  });

  it("invalid name uppercase", async () => {
    const skillDir = await createTempSkill(
      "MySkill",
      `---
name: MySkill
description: A test skill
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors.some((e) => e.includes("lowercase"))).toBe(true);
  });

  it("name too long", async () => {
    const longName = "a".repeat(70); // Exceeds 64 char limit
    const skillDir = await createTempSkill(
      longName,
      `---
name: ${longName}
description: A test skill
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(
      errors.some(
        (e) => e.includes("exceeds") && e.includes("character limit"),
      ),
    ).toBe(true);
  });

  it("name leading hyphen", async () => {
    const skillDir = await createTempSkill(
      "-my-skill",
      `---
name: -my-skill
description: A test skill
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(
      errors.some((e) => e.includes("cannot start or end with a hyphen")),
    ).toBe(true);
  });

  it("name consecutive hyphens", async () => {
    const skillDir = await createTempSkill(
      "my--skill",
      `---
name: my--skill
description: A test skill
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors.some((e) => e.includes("consecutive hyphens"))).toBe(true);
  });

  it("name invalid characters", async () => {
    const skillDir = await createTempSkill(
      "my_skill",
      `---
name: my_skill
description: A test skill
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors.some((e) => e.includes("invalid characters"))).toBe(true);
  });

  it("name directory mismatch", async () => {
    const skillDir = await createTempSkill(
      "wrong-name",
      `---
name: correct-name
description: A test skill
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors.some((e) => e.includes("must match skill name"))).toBe(true);
  });

  it("unexpected fields", async () => {
    const skillDir = await createTempSkill(
      "my-skill-unexpected",
      `---
name: my-skill
description: A test skill
unknown_field: should not be here
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors.some((e) => e.includes("Unexpected fields"))).toBe(true);
  });

  it("valid with all fields", async () => {
    const skillDir = await createTempSkill(
      "my-skill",
      `---
name: my-skill
description: A test skill
license: MIT
metadata:
  author: Test
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors).toEqual([]);
  });

  it("allowed tools accepted", async () => {
    const skillDir = await createTempSkill(
      "my-skill",
      `---
name: my-skill
description: A test skill
allowed-tools: Bash(jq:*) Bash(git:*)
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors).toEqual([]);
  });

  it("i18n chinese name", async () => {
    const skillDir = await createTempSkill(
      "技能",
      `---
name: 技能
description: A skill with Chinese name
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors).toEqual([]);
  });

  it("i18n russian name with hyphens", async () => {
    const skillDir = await createTempSkill(
      "мой-навык",
      `---
name: мой-навык
description: A skill with Russian name
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors).toEqual([]);
  });

  it("i18n russian lowercase valid", async () => {
    const skillDir = await createTempSkill(
      "навык",
      `---
name: навык
description: A skill with Russian lowercase name
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors).toEqual([]);
  });

  it("i18n russian uppercase rejected", async () => {
    const skillDir = await createTempSkill(
      "НАВЫК",
      `---
name: НАВЫК
description: A skill with Russian uppercase name
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors.some((e) => e.includes("lowercase"))).toBe(true);
  });

  it("description too long", async () => {
    const skillDir = await createTempSkill(
      "my-skill-long-desc",
      `---
name: my-skill
description: ${"x".repeat(1100)}
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(
      errors.some((e) => e.includes("exceeds") && e.includes("1024")),
    ).toBe(true);
  });

  it("valid compatibility", async () => {
    const skillDir = await createTempSkill(
      "my-skill",
      `---
name: my-skill
description: A test skill
compatibility: Requires Python 3.11+
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors).toEqual([]);
  });

  it("compatibility too long", async () => {
    const skillDir = await createTempSkill(
      "my-skill-long-compat",
      `---
name: my-skill
description: A test skill
compatibility: ${"x".repeat(550)}
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors.some((e) => e.includes("exceeds") && e.includes("500"))).toBe(
      true,
    );
  });

  it("nfkc normalization", async () => {
    // Skill names are NFKC normalized before validation.
    // The name 'café' can be represented two ways:
    // - Precomposed: 'café' (4 chars, 'é' is U+00E9)
    // - Decomposed: 'café' (5 chars, 'e' + combining acute U+0301)
    // NFKC normalizes both to the precomposed form.

    // Use decomposed form: 'cafe' + combining acute accent (U+0301)
    const decomposedName = "cafe\u0301"; // 'café' with combining accent
    const composedName = "café"; // precomposed form

    // Directory uses composed form, SKILL.md uses decomposed - should match after normalization
    const skillDir = await createTempSkill(
      composedName,
      `---
name: ${decomposedName}
description: A test skill
---
Body
`,
    );
    const errors = await validate(skillDir);
    expect(errors).toEqual([]);
  });
});
