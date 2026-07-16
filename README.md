# AI 周报助手 — 规范写作，零低级错误

基于垂直规范库的 AI 职场写作 SaaS，从周报切入，解决"写周报低级错误多、不规范"的痛点。

## 核心差异化

- **垂直规范库（护城河）**：10个行业角色模板，每个模板包含格式规范、常见错误清单、质检规则、优秀示例
- **双层质检管线**：规则引擎（毫秒级，零成本）+ AI 深度检查，确保零低级错误
- **Freemium 模式**：每月3次免费生成，降低获客门槛
- **风格学习**：AI 学习用户历史写作风格，越用越懂你

## 技术栈

- **框架**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS v4 + shadcn/ui
- **AI**: Vercel AI SDK + OpenAI (gpt-4o-mini)
- **数据库**: Neon PostgreSQL + Drizzle ORM
- **认证**: Better Auth
- **部署**: Vercel

## 快速开始

1. 安装依赖：`npm install`
2. 配置环境变量：复制 `.env.example` 为 `.env.local` 并填写
3. 推送数据库：`npx drizzle-kit push`
4. 启动开发：`npm run dev`

## 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `DATABASE_URL` | 是 | Neon PostgreSQL 连接串 |
| `OPENAI_API_KEY` | 是 | OpenAI API 密钥 |
| `BETTER_AUTH_SECRET` | 是 | 认证密钥（任意随机字符串） |
| `NEXT_PUBLIC_APP_URL` | 否 | 应用URL，默认 localhost:3000 |
| `GOOGLE_CLIENT_ID` | 否 | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | 否 | Google OAuth |

## 项目结构

```
├── app/
│   ├── dashboard/
│   │   ├── write/          # 周报写作页（核心）
│   │   ├── history/        # 历史记录
│   │   └── page.tsx        # 首页仪表盘
│   └── api/
│       ├── weekly-report/
│       │   ├── generate/   # AI 生成 + 质检
│       │   └── history/    # 历史记录查询
│       └── usage/          # 用量查询
├── lib/
│   ├── templates.ts        # 10个垂直周报模板（核心护城河）
│   ├── prompts.ts          # AI 提示词工程
│   ├── quality-checker.ts  # 双层质检管线
│   └── usage.ts            # Freemium 用量控制
└── db/
    └── schema.ts           # 数据库表定义
```