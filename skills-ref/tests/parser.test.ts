/** Tests for parser module. */

import { describe, expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";

import {
  findSkillMd,
  parseFrontmatter,
  readProperties,
} from "../src/skills-ref/parser.js";

const TEMP_DIR = path.join(tmpdir(), "skills-ref-tests-parser");

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

describe("parseFrontmatter", () => {
  it("valid frontmatter", async () => {
    const content = `---
name: my-skill
description: A test skill
---
# My Skill

Instructions here.
`;
    const [metadata, body] = parseFrontmatter(content);
    expect(metadata.name).toBe("my-skill");
    expect(metadata.description).toBe("A test skill");
    expect(body).toContain("# My Skill");
  });

  it("missing frontmatter", () => {
    const content = "# No frontmatter here";
    expect(() => parseFrontmatter(content)).toThrow(
      "must start with YAML frontmatter",
    );
  });

  it("unclosed frontmatter", () => {
    const content = `---
name: my-skill
description: A test skill
`;
    expect(() => parseFrontmatter(content)).toThrow("not properly closed");
  });

  it("invalid yaml", () => {
    const content = `---
name: [invalid
description: broken
---
Body here
`;
    expect(() => parseFrontmatter(content)).toThrow("Invalid YAML");
  });

  it("non dict frontmatter", () => {
    const content = `---
- just
- a
- list
---
Body
`;
    expect(() => parseFrontmatter(content)).toThrow("must be a YAML mapping");
  });
});

describe("readProperties", () => {
  beforeAll(async () => {
    await createTempDir();
  });

  afterAll(async () => {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
  });

  it("read valid skill", async () => {
    const skillDir = await createTempSkill(
      "my-skill",
      `---
name: my-skill
description: A test skill
license: MIT
---
# My Skill
`,
    );
    const props = await readProperties(skillDir);
    expect(props.name).toBe("my-skill");
    expect(props.description).toBe("A test skill");
    expect(props.license).toBe("MIT");
  });

  it("read with metadata", async () => {
    const skillDir = await createTempSkill(
      "my-skill-2",
      `---
name: my-skill
description: A test skill
metadata:
  author: Test Author
  version: "1.0"
---
Body
`,
    );
    const props = await readProperties(skillDir);
    expect(props.metadata).toEqual({ author: "Test Author", version: "1.0" });
  });

  it("missing skill md", async () => {
    const emptyDir = path.join(TEMP_DIR, "empty-skill");
    await fs.mkdir(emptyDir, { recursive: true });
    await expect(readProperties(emptyDir)).rejects.toThrow(
      "SKILL.md not found",
    );
  });

  it("missing name", async () => {
    const skillDir = await createTempSkill(
      "my-skill-3",
      `---
description: A test skill
---
Body
`,
    );
    await expect(readProperties(skillDir)).rejects.toThrow(
      "Missing required field in frontmatter: name",
    );
  });

  it("missing description", async () => {
    const skillDir = await createTempSkill(
      "my-skill-4",
      `---
name: my-skill
---
Body
`,
    );
    await expect(readProperties(skillDir)).rejects.toThrow(
      "Missing required field in frontmatter: description",
    );
  });
});

describe("findSkillMd", () => {
  beforeAll(async () => {
    await createTempDir();
  });

  afterAll(async () => {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
  });

  it("prefers uppercase", async () => {
    const skillDir = path.join(TEMP_DIR, "my-skill-prefers");
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, "SKILL.md"), "uppercase");
    await fs.writeFile(path.join(skillDir, "skill.md"), "lowercase");
    const result = await findSkillMd(skillDir);
    expect(result).not.toBeNull();
    expect(result && path.basename(result)).toBe("SKILL.md");
  });

  it("accepts lowercase", async () => {
    const skillDir = path.join(TEMP_DIR, "my-skill-lower");
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, "skill.md"), "lowercase");
    const result = await findSkillMd(skillDir);
    expect(result).not.toBeNull();
    expect(result && path.basename(result).toLowerCase()).toBe("skill.md");
  });

  it("returns none when missing", async () => {
    const skillDir = path.join(TEMP_DIR, "my-skill-missing");
    await fs.mkdir(skillDir, { recursive: true });
    const result = await findSkillMd(skillDir);
    expect(result).toBeNull();
  });

  it("read properties with lowercase skill md", async () => {
    const skillDir = path.join(TEMP_DIR, "my-skill-lower-read");
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(
      path.join(skillDir, "skill.md"),
      `---
name: my-skill
description: A test skill
---
# My Skill
`,
    );
    const props = await readProperties(skillDir);
    expect(props.name).toBe("my-skill");
    expect(props.description).toBe("A test skill");
  });

  it("read with allowed tools", async () => {
    const skillDir = await createTempSkill(
      "my-skill-tools",
      `---
name: my-skill
description: A test skill
allowed-tools: Bash(jq:*) Bash(git:*)
---
Body
`,
    );
    const props = await readProperties(skillDir);
    expect(props.allowedTools).toBe("Bash(jq:*) Bash(git:*)");
    // Verify to_dict outputs as "allowed-tools" (hyphenated)
    const d = props.toDict();
    expect(d["allowed-tools"]).toBe("Bash(jq:*) Bash(git:*)");
  });
});
