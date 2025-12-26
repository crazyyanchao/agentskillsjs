# Agent Skills

> [!NOTE]
> Looking for the Python version? See the [Python repo](https://github.com/agentskills/agentskills).

[Agent Skills](https://agentskills.io) are a simple, open format for giving agents new capabilities and expertise.

Skills are folders of instructions, scripts, and resources that agents can discover and use to perform better at specific tasks. Write once, use everywhere.

## Getting Started

- [Documentation](https://agentskills.io) - Guides and tutorials
- [Specification](https://agentskills.io/specification) - Format details
- [Example Skills](https://github.com/anthropics/skills) - See what's possible

This repo contains the specification, documentation, and reference SDK. Also see a list of example skills [here](https://github.com/anthropics/skills).

## CLI DEMO

- [Skills-ref Documentation](./skills-ref/README.md)

```bash
PS C:\Users\admin> npm install -g skills-ref

added 4 packages in 2s
PS C:\Users\admin> skills-ref --help
Usage: cli [options] [command]

Reference library for Agent Skills

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  validate <skill_path>
  read-properties <skill_path>
  to-prompt <skill_paths...>
  help [command]                display help for command
PS C:\Users\admin> skills-ref validate F:\ai-project\skills\skills\algorithmic-art
Valid skill: F:\ai-project\skills\skills\algorithmic-art
PS C:\Users\admin>
PS C:\Users\admin> skills-ref read-properties F:\ai-project\skills\skills\algorithmic-art
{
  "name": "algorithmic-art",
  "description": "Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.",
  "license": "Complete terms in LICENSE.txt"
}
PS C:\Users\admin> skills-ref to-prompt F:\ai-project\skills\skills\algorithmic-art
<available_skills>
<skill>
<name>
algorithmic-art
</name>
<description>
Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists&#39; work to avoid copyright violations.
</description>
<location>
F:\ai-project\skills\skills\algorithmic-art\SKILL.md
</location>
</skill>
</available_skills>
PS C:\Users\admin>
```

## About

Agent Skills is an open format maintained by [Anthropic](https://anthropic.com) and open to contributions from the community.