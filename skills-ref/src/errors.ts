/** Skill-related exceptions. */

/** Base exception for all skill-related errors. */
export class SkillError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkillError";
  }
}

/** Raised when SKILL.md parsing fails. */
export class ParseError extends SkillError {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

/** Raised when skill properties are invalid. */
export class ValidationError extends SkillError {
  /** List of validation error messages (may contain just one) */
  readonly errors: string[];

  constructor(message: string, errors?: string[]) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors ?? [message];
  }
}
