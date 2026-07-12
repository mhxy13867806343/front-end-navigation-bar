# MCP Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two searchable HooksVue navigation categories containing a broad, curated set of MCP Agent Skills and MCP Server resources.

**Architecture:** Keep the existing data-driven Vue architecture and append two category objects to `menuItemsList`. Add a small Node validation script that imports the same production data and enforces category presence, minimum resource counts, unique IDs, required display fields, and HTTPS links.

**Tech Stack:** Vue 3, Vite 4, ECMAScript modules, Node.js.

## Global Constraints

- Add category ID `22`, name `MCP Skills`, icon `🧠`.
- Add category ID `23`, name `MCP Servers`, icon `🔌`.
- Tool IDs use the `mcp-skill-*` and `mcp-server-*` prefixes.
- Every item contains `id`, `name`, `desc`, `icon`, `link`, `platform`, and `price`.
- Every link uses HTTPS; no API keys, remote scripts, packages, or runtime dependencies are added.
- Existing layout, interaction code, styles, categories, and uncommitted user changes remain untouched.

---

### Task 1: Add an MCP navigation data validator

**Files:**
- Create: `scripts/validate-mcp-navigation.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: named export `menuItemsList` from `src/utlis/menuItems.js`.
- Produces: npm script `validate:mcp`; exits `0` only when both categories and all data constraints pass.

- [ ] **Step 1: Write the failing validator**

```js
import { menuItemsList } from '../src/utlis/menuItems.js'

const expectations = [
  { id: 22, name: 'MCP Skills', prefix: 'mcp-skill-', minimum: 18 },
  { id: 23, name: 'MCP Servers', prefix: 'mcp-server-', minimum: 45 }
]
const requiredFields = ['id', 'name', 'desc', 'icon', 'link', 'platform', 'price']

const allToolIds = menuItemsList.flatMap(category => category.tools || []).map(tool => tool.id)
if (new Set(allToolIds).size !== allToolIds.length) throw new Error('Tool IDs must be unique')

for (const expected of expectations) {
  const category = menuItemsList.find(item => item.id === expected.id)
  if (!category || category.name !== expected.name) throw new Error(`Missing category: ${expected.name}`)
  if (category.tools.length < expected.minimum) throw new Error(`${expected.name} needs at least ${expected.minimum} items`)

  for (const tool of category.tools) {
    if (!tool.id.startsWith(expected.prefix)) throw new Error(`Invalid ID prefix: ${tool.id}`)
    for (const field of requiredFields) {
      if (typeof tool[field] !== 'string' || !tool[field].trim()) throw new Error(`${tool.id} is missing ${field}`)
    }
    if (!tool.link.startsWith('https://')) throw new Error(`${tool.id} must use HTTPS`)
  }
}

console.log('MCP navigation data is valid')
```

Add this exact script to `package.json`:

```json
"validate:mcp": "node scripts/validate-mcp-navigation.mjs"
```

- [ ] **Step 2: Run the validator to prove the categories are missing**

Run: `npm run validate:mcp`

Expected: non-zero exit with `Missing category: MCP Skills`.

- [ ] **Step 3: Commit the validator**

```bash
git add scripts/validate-mcp-navigation.mjs package.json
git commit -m "test: validate MCP navigation resources"
```

### Task 2: Add curated MCP Skills and MCP Servers

**Files:**
- Modify: `src/utlis/menuItems.js`

**Interfaces:**
- Consumes: the existing `menuItemsList` schema and Task 1 validator.
- Produces: category objects `22` and `23`, rendered automatically by the existing sidebar and cards.

- [ ] **Step 1: Append the MCP Skills category**

Add at least these 18 verified resources, each with the exact `mcp-skill-*` ID convention and all required display fields:

| Name | Link | Purpose |
|---|---|---|
| Anthropic Skills | `https://github.com/anthropics/skills` | Anthropic official Agent Skills examples |
| Microsoft Skills | `https://github.com/microsoft/skills` | Azure SDK and Foundry skills |
| Microsoft Learn Agent Skills | `https://github.com/MicrosoftDocs/Agent-Skills` | Microsoft Learn-backed skills |
| NVIDIA Skills | `https://github.com/NVIDIA/skills` | NVIDIA verified AI/GPU skills |
| Hugging Face Skills | `https://github.com/huggingface/skills` | Hugging Face ecosystem skills |
| Agent Skills Specification | `https://agentskills.io` | Open Agent Skills standard |
| GitHub Awesome Copilot | `https://github.com/github/awesome-copilot` | GitHub community agents and skills |
| Composio Awesome Claude Skills | `https://github.com/ComposioHQ/awesome-claude-skills` | Community skill collection |
| Kodus Awesome Agent Skills | `https://github.com/kodustech/awesome-agent-skills` | Curated engineering skills |
| VoltAgent Awesome Agent Skills | `https://github.com/VoltAgent/awesome-agent-skills` | Large agent skill directory |
| SkillCreator Awesome Agent Skills | `https://github.com/skillcreatorai/Awesome-Agent-Skills` | Cross-agent installable skills |
| Junmin Hong Awesome Agent Skills | `https://github.com/junminhong/awesome-agent-skills` | Bilingual curated skill collection |
| Eigent Agent Skills | `https://github.com/eigent-ai/agent-skills` | Productivity-oriented skills |
| Superpowers | `https://github.com/obra/superpowers` | Development workflow skills |
| AgentSkills MCP | `https://github.com/zouyingcao/agentskills-mcp` | Load Agent Skills through MCP |
| Claude Skills MCP | `https://github.com/K-Dense-AI/claude-skills-mcp` | Search skills through MCP |
| DataLayer Agent Skills | `https://github.com/datalayer/agent-skills` | MCP tool composition skills |
| Awesome Claude Code and Skills | `https://github.com/GetBindu/awesome-claude-code-and-skills` | Production-ready skill collection |

- [ ] **Step 2: Append the MCP Servers category**

Add at least 45 resources with `mcp-server-*` IDs. The collection must include these groups and sources:

- Core/discovery: official MCP Registry, `modelcontextprotocol/servers`, Filesystem, Memory, Everything, Awesome MCP Servers lists.
- Code/dev: GitHub, GitLab, Docker, Kubernetes, Terraform, Sentry, Grafana, Postman.
- Browser/search: Playwright, Browser MCP, Firecrawl, Apify, Tavily, Exa, Brave Search, Perplexity.
- Data: PostgreSQL, SQLite, MongoDB, Redis, Neon, Supabase, MotherDuck, ClickHouse, DBHub.
- Cloud/business: AWS Labs, Azure MCP, Cloudflare, Google GenAI Toolbox, Notion, Slack, Stripe, PayPal, Linear, Atlassian, Zapier, Pipedream/Composio.
- Creative/tools: Figma, Blender, Unity, Godot, Sequential Thinking and Desktop Commander.

For each entry, use its official GitHub repository or official service MCP page, write a one-sentence Chinese description, and set `platform` to `MCP` or `Cloud`; set `price` to `免费` for open-source local servers and `免费/付费` where a hosted account/API may be required.

- [ ] **Step 3: Run data validation**

Run: `npm run validate:mcp`

Expected: exit `0` and output `MCP navigation data is valid`.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: exit `0` and Vite reports a completed production build.

- [ ] **Step 5: Check only intended implementation files changed**

Run: `git status --short` and `git diff --check -- src/utlis/menuItems.js scripts/validate-mcp-navigation.mjs package.json`.

Expected: no whitespace errors; unrelated pre-existing user changes remain unstaged and unmodified.

- [ ] **Step 6: Commit implementation files only**

```bash
git add src/utlis/menuItems.js scripts/validate-mcp-navigation.mjs package.json
git commit -m "feat: add MCP skills and server navigation"
```
