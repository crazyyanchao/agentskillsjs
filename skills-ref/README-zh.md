# skills-ref

[![English](https://img.shields.io/badge/English-Click-yellow)](README.md)
[![中文文档](https://img.shields.io/badge/中文文档-点击查看-orange)](README-zh.md)

Agent Skills 参考库。

> **注意：** 此库仅用于演示目的，不适用于生产环境。

## 安装

```bash
pnpm install
```

安装后，`skills-ref` CLI 将可用。

## 使用方法

### CLI

```bash
# 验证技能
skills-ref validate path/to/skill

# 读取技能属性（输出 JSON）
skills-ref read-properties path/to/skill

# 为 Agent 提示生成 <available_skills> XML
skills-ref to-prompt path/to/skill-a path/to/skill-b
```

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

### TypeScript API

```typescript
import { validate, readProperties, toPrompt } from "skills-ref";

// 验证技能目录
const problems = await validate("my-skill");
if (problems.length > 0) {
  console.log("验证错误：", problems);
}

// 读取技能属性
const props = await readProperties("my-skill");
console.log(`技能：${props.name} - ${props.description}`);

// 为可用技能生成提示
const prompt = await toPrompt(["skill-a", "skill-b"]);
console.log(prompt);
```

## 开发

```bash
# 构建项目
pnpm build

# 运行测试
pnpm test

# 格式化代码
pnpm format

# 代码检查
pnpm lint
pnpm lint:fix
```

## Agent 提示集成

使用 `to-prompt` 为 Agent 的系统提示生成推荐的 `<available_skills>` XML 块。此格式是 Anthropic 模型的推荐格式，但 Skill 客户端可以根据所使用的模型选择不同的格式。

```xml
<available_skills>
<skill>
<name>
my-skill
</name>
<description>
此技能的功能及何时使用
</description>
<location>
/path/to/my-skill/SKILL.md
</location>
</skill>
</available_skills>
```

`<location>` 元素告诉 Agent 在哪里可以找到完整的技能说明。

## 许可证

MIT 许可证
