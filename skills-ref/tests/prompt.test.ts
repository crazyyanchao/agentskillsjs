/** Tests for prompt module. */

import { describe, expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";

import { toPrompt } from "../src/skills-ref/prompt.js";

const TEMP_DIR = path.join(tmpdir(), "skills-ref-tests-prompt");

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

describe("toPrompt", () => {
  beforeAll(async () => {
    await createTempDir();
  });

  afterAll(async () => {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
  });

  it("empty list", async () => {
    const result = await toPrompt([]);
    expect(result).toBe("<available_skills>\n</available_skills>");
  });

  it("single skill", async () => {
    const skillDir = await createTempSkill(
      "my-skill",
      `---
name: my-skill
description: A test skill
---
Body
`,
    );
    const result = await toPrompt([skillDir]);
    expect(result).toContain("<available_skills>");
    expect(result).toContain("</available_skills>");
    expect(result).toContain("<name>\nmy-skill\n</name>");
    expect(result).toContain("<description>\nA test skill\n</description>");
    expect(result).toContain("<location>");
    expect(result).toContain("SKILL.md");
  });

  it("multiple skills", async () => {
    const skillA = await createTempSkill(
      "skill-a",
      `---
name: skill-a
description: First skill
---
Body
`,
    );

    const skillB = await createTempSkill(
      "skill-b",
      `---
name: skill-b
description: Second skill
---
Body
`,
    );

    const result = await toPrompt([skillA, skillB]);
    expect(result.match(/<skill>/g)?.length).toBe(2);
    expect(result.match(/<\/skill>/g)?.length).toBe(2);
    expect(result).toContain("skill-a");
    expect(result).toContain("skill-b");
  });

  it("special characters escaped", async () => {
    const skillDir = await createTempSkill(
      "special-skill",
      `---
name: special-skill
description: Use <foo> & <bar> tags
---
Body
`,
    );
    const result = await toPrompt([skillDir]);
    expect(result).toContain("&lt;foo&gt;");
    expect(result).toContain("&amp;");
    expect(result).toContain("&lt;bar&gt;");
    expect(result).not.toContain("<foo>");
    expect(result).not.toContain("<bar>");
  });
});
