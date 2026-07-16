/**
 * AI提示词工程 — 核心差异化
 * 每个提示词都经过精心设计，确保AI严格按照规范库输出
 * 这是“零低级错误”的核心保障
 */

import { WeeklyTemplate } from "./templates";

export interface GenerateWeeklyInput {
  template: WeeklyTemplate;
  userInfo: {
    name?: string;
    role?: string;
    department?: string;
    company?: string;
  };
  rawContent: string; // 用户输入的原始要点
  previousReports?: string[]; // 历史周报，用于风格学习
  tone?: "formal" | "casual" | "data-driven";
}

export function buildSystemPrompt(template: WeeklyTemplate, tone: string): string {
  const sectionsPrompt = template.sections
    .map(
      (s, i) =>
        `${i + 1}. **${s.title}**${s.required ? "（必填）" : "（选填）"}\n   - ${s.description}\n   - AI指令：${s.aiInstruction}`
    )
    .join("\n");

  const qualityRules = template.qualityRules
    .map((r) => `- [${r.severity.toUpperCase()}] ${r.rule}`)
    .join("\n");

  const commonErrors = template.sections
    .flatMap((s) => s.commonErrors)
    .filter(Boolean)
    .map((e) => `- ❌ ${e}`)
    .join("\n");

  return `你是一位资深职场写作专家，专精于"${template.name}"的撰写。

## 你的核心任务
根据用户提供的要点，生成一份专业、高质量、零低级错误的周报。

## 写作规范（必须严格遵守）
${template.styleGuide}

## 输出格式
${sectionsPrompt}

## 质检红线（生成时必须避开）
${commonErrors}

## 自动质检规则（生成后自检）
${qualityRules}

## 语气设定
${tone === "formal" ? "正式商务：使用专业术语，结构严谨" : tone === "data-driven" ? "数据驱动：每个结论必须有数字支撑" : "简洁务实：直接、清晰、不啰嗦"}

## 重要约束
- 总字数严格控制在要求范围内
- 禁止输出任何解释性文字，只输出周报正文
- 禁止在周报中出现"以下是我的周报"等元话语
- 如果用户提供的数据有矛盾或缺失，标注[需确认]而非编造`;
}

export function buildUserPrompt(input: GenerateWeeklyInput): string {
  const { userInfo, rawContent, previousReports, template } = input;

  const userContext = userInfo.name
    ? `撰写人：${userInfo.name}${userInfo.role ? `（${userInfo.role}）` : ""}${userInfo.department ? ` | ${userInfo.department}` : ""}${userInfo.company ? ` @ ${userInfo.company}` : ""}`
    : "";

  const styleContext = previousReports?.length
    ? `\n\n## 参考该用户的写作风格（基于历史周报）\n${previousReports
        .slice(-2)
        .map((r, i) => `历史周报${i + 1}：\n${r.substring(0, 800)}...`)
        .join("\n\n")}\n\n请模仿上述风格进行撰写。`
    : "";

  return `${userContext}

## 用户提供的本周要点
${rawContent}

## 要求
请根据上述要点，按照"${template.name}"的规范，生成一份完整的周报。
${styleContext}

请直接输出周报内容，不要有任何额外说明。`;
}

/**
 * 质检提示词 — 让AI自己检查自己的输出
 */
export function buildQualityCheckPrompt(
  generatedContent: string,
  template: WeeklyTemplate,
  originalInput: string
): string {
  const rules = template.qualityRules
    .map((r) => `- ${r.severity.toUpperCase()}: ${r.rule}`)
    .join("\n");

  const errors = template.sections
    .flatMap((s) => s.commonErrors)
    .filter(Boolean)
    .map((e) => `- ${e}`)
    .join("\n");

  return `你是一位严格的职场文档质检员。请对以下AI生成的周报进行质检。

## 原始用户输入
${originalInput}

## 生成的周报
${generatedContent}

## 质检规则
${rules}

## 常见低级错误清单（必须检查）
${errors}

## 额外质检项
- [ERROR] 是否编造了用户未提供的数据？
- [ERROR] 是否产生了AI幻觉（编造不存在的事实）？
- [ERROR] 进度百分比是否有计算依据？
- [WARNING] 是否存在空泛表述（如"较好"、"不错"）？
- [WARNING] 格式是否符合模板要求？

## 输出格式（JSON）
{
  "passed": boolean,
  "score": number, // 0-100
  "issues": [
    {
      "severity": "error" | "warning",
      "rule": "违反的规则名称",
      "location": "出现位置（引用原文）",
      "suggestion": "修改建议"
    }
  ],
  "correctedVersion": "修正后的完整周报（如果有error则提供，否则为null）"
}`;
}

/**
 * 风格学习提示词 — 从用户历史周报中提取写作风格
 */
export function buildStyleExtractionPrompt(reports: string[]): string {
  return `请分析以下${reports.length}份周报，提取撰写人的写作风格特征。

## 周报样本
${reports.map((r, i) => `样本${i + 1}:\n${r}`).join("\n\n---\n\n")}

## 请提取以下维度
1. 语言风格（正式/口语化/简洁/详细）
2. 常用句式结构
3. 数据呈现方式
4. 段落长度偏好
5. 特殊表达习惯
6. 开头/结尾方式

## 输出格式（JSON）
{
  "tone": "描述",
  "sentencePatterns": ["常用句式1", "常用句式2"],
  "dataStyle": "描述",
  "paragraphPreference": "描述",
  "specialHabits": ["习惯1", "习惯2"],
  "openingStyle": "描述",
  "closingStyle": "描述",
  "stylePrompt": "一段可以直接用于提示词的写作风格描述"
}`;
}
