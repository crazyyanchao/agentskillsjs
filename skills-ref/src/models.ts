/** Data models for Agent Skills. */

/** Properties parsed from a skill's SKILL.md frontmatter. */
export class SkillProperties {
  /** Skill name in kebab-case (required) */
  readonly name: string;
  /** What the skill does and when the model should use it (required) */
  readonly description: string;
  /** License for the skill (optional) */
  readonly license?: string;
  /** Compatibility information for the skill (optional) */
  readonly compatibility?: string;
  /** Tool patterns the skill requires (optional, experimental) */
  readonly allowedTools?: string;
  /** Key-value pairs for client-specific properties */
  readonly metadata: Record<string, string>;

  constructor(
    name: string,
    description: string,
    license?: string,
    compatibility?: string,
    allowedTools?: string,
    metadata: Record<string, string> = {},
  ) {
    this.name = name;
    this.description = description;
    this.license = license;
    this.compatibility = compatibility;
    this.allowedTools = allowedTools;
    this.metadata = metadata;
  }

  /** Convert to dictionary, excluding undefined values. */
  toDict(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      name: this.name,
      description: this.description,
    };
    if (this.license !== undefined) {
      result.license = this.license;
    }
    if (this.compatibility !== undefined) {
      result.compatibility = this.compatibility;
    }
    if (this.allowedTools !== undefined) {
      result["allowed-tools"] = this.allowedTools;
    }
    if (Object.keys(this.metadata).length > 0) {
      result.metadata = this.metadata;
    }
    return result;
  }
}
