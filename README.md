# Quant & Agent Command Center

Build a polished Chinese-language web application named “AI Quant & Agent Command Center” (量化与多智能体指挥中心). This is an initial MVP dashboard/prototype for an existing technical environment; do NOT assume or claim any real integrations are connected.

Product goals:
- Give one operator a unified visual console for multi-agent operations, quantitative research, and Linux infrastructure.
- Keep the existing Agent Runtime, workflows, quant code, GitHub repositories, and Linux hosts unchanged. This app is a presentation/control layer only.
- Use realistic but clearly labeled demo/mock data throughout. Never present mock values as live telemetry or real trading results.

Create a responsive desktop-first dark professional interface with a clear Chinese information hierarchy, sidebar navigation, top status bar, compact KPI cards, tables, charts, filters, and detail drawers/modals. Use Tailwind and shadcn/ui patterns.

Main navigation/pages:
1. 总览: agent online/demo status, queued/running/failed tasks, latest research reports, infrastructure summary, recent audit events.
2. Agent 管理: agent roster, role, runtime, status, current task, heartbeat (demo), capabilities; agent detail view.
3. 任务中心: task queue with owner, priority, status, created time; task detail, handoff history, retry and cancel controls shown as demo-only actions.
4. 研究报告: A股/美股 report library, date, market, status, summary, searchable report detail view.
5. 策略研究: strategy catalog, backtest metric cards and equity curve using demo data; prominently label all performance metrics as simulated, not investment advice or live results.
6. 基础设施: Linux host cards for CPU, memory, disk, Docker/services, uptime, logs; clearly mark all readings as demo data.
7. 安全审计: approval queue, action risk levels, immutable-style event timeline, actor, action, result; destructive or production actions must not execute.
8. 系统设置: integration status placeholders for GitHub, Linux/SSH, Agent Runtime, market data, and database. Show “未连接 / 待配置” until a real integration is deliberately configured.

Safety and interaction requirements:
- No real trading, order placement, shell execution, SSH access, deployment, repository writes, or external API calls.
- No secrets, tokens, credentials, or private keys in frontend code or demo data.
- Any action that could affect production must be disabled or clearly marked “演示操作 / 尚未接入”.
- Include visible labels distinguishing “演示数据” from connected/live data.
- Make pages navigable and interactions useful with local mock state only.
- Use Chinese labels and concise Chinese helper text. Ensure good empty states, loading states, and responsive layout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/acc52a18-f361-4085-a369-85f878a3c0de).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
