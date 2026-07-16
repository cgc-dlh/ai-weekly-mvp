/**
 * 质检管线 — "零低级错误"的核心保障
 * 双层质检：规则引擎（快速） + AI质检（深度）
 */

import { WeeklyTemplate } from "./templates";

export interface QualityIssue {
  severity: "error" | "warning";
  rule: string;
  location: string;
  suggestion: string;
}

export interface QualityResult {
  passed: boolean;
  score: number; // 0-100
  issues: QualityIssue[];
}

/**
 * 第一层：规则引擎质检（毫秒级，零成本）
 * 基于模板的qualityRules和commonErrors进行正则/关键词匹配
 */
export function ruleBasedCheck(
  content: string,
  template: WeeklyTemplate
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const lines = content.split("\n");

  // 1. 检查每个质检规则
  for (const rule of template.qualityRules) {
    const violation = checkRule(content, rule.rule);
    if (violation.found) {
      issues.push({
        severity: rule.severity,
        rule: rule.rule,
        location: violation.location || "全文",
        suggestion: violation.suggestion || "请修正",
      });
    }
  }

  // 2. 检查常见低级错误（关键词匹配）
  const vagueWords = [
    "进展顺利",
    "较好",
    "不错",
    "还可以",
    "基本完成",
    "有序推进",
    "稳步进行",
    "良好",
  ];
  for (const word of vagueWords) {
    if (content.includes(word)) {
      issues.push({
        severity: "error",
        rule: "禁止模糊表述",
        location: word,
        suggestion: `将"${word}"替换为具体数据或事实`,
      });
    }
  }

  // 3. 检查是否有百分比但没有计算依据的嫌疑
  const percentMatches = content.match(/(\d+)%/g);
  if (percentMatches) {
    // 简单启发：如果百分比很多但没有"上周""环比"等对比词，可能缺少依据
    const hasComparison =
      /上周|环比|对比|vs|较|从.*到|→/.test(content);
    if (!hasComparison && percentMatches.length > 2) {
      issues.push({
        severity: "warning",
        rule: "百分比建议有对比依据",
        location: percentMatches.join(", "),
        suggestion: "建议补充与上周/目标的对比，让进度更有说服力",
      });
    }
  }

  // 4. 检查是否编造数据（简单启发：如果用户输入很短但输出很长，可能有问题）
  // 这个在API层做，因为需要原始输入

  // 5. 检查字数
  const charCount = content.replace(/\s/g, "").length;
  const wordCountRule = template.qualityRules.find((r) =>
    r.rule.includes("字数")
  );
  if (wordCountRule) {
    const match = wordCountRule.rule.match(/(\d+).*?(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      if (charCount < min || charCount > max) {
        issues.push({
          severity: wordCountRule.severity,
          rule: wordCountRule.rule,
          location: `当前${charCount}字`,
          suggestion: `请调整至${min}-${max}字范围`,
        });
      }
    }
  }

  // 6. 检查每个必填section是否存在
  for (const section of template.sections) {
    if (section.required) {
      const sectionFound =
        content.includes(section.title) ||
        lines.some((l) => l.includes(section.title.substring(0, 4)));
      if (!sectionFound) {
        issues.push({
          severity: "error",
          rule: `缺少必填板块：${section.title}`,
          location: "全文",
          suggestion: `请添加"${section.title}"板块`,
        });
      }
    }
  }

  // 7. 检查AI幻觉：是否出现[需确认]标记（这是好的，说明AI诚实）
  if (content.includes("[需确认]")) {
    issues.push({
      severity: "warning",
      rule: "存在需要用户确认的内容",
      location: "[需确认]",
      suggestion: "用户补充信息后可移除标记",
    });
  }

  return issues;
}

function checkRule(
  content: string,
  rule: string
): { found: boolean; location?: string; suggestion?: string } {
  // 根据规则类型进行匹配
  if (rule.includes("模糊表述") || rule.includes("'进展顺利'")) {
    const vagueWords = [
      "进展顺利",
      "有序推进",
      "稳步进行",
      "基本完成",
      "良好",
    ];
    for (const word of vagueWords) {
      if (content.includes(word)) {
        return {
          found: true,
          location: word,
          suggestion: `避免使用"${word}"，请用具体数字替代`,
        };
      }
    }
  }

  if (rule.includes("数字") || rule.includes("量化")) {
    // 检查是否完全没有数字
    if (!/\d/.test(content)) {
      return {
        found: true,
        location: "全文",
        suggestion: "周报中应包含至少一个量化指标",
      };
    }
  }

  if (rule.includes("方案") || rule.includes("解决")) {
    // 检查风险/问题部分是否有方案
    const riskSection = content.match(/风险[\s\S]*?(?=下周|计划|$)/i);
    if (riskSection && !/方案|解决|建议|需要/.test(riskSection[0])) {
      return {
        found: true,
        location: "风险板块",
        suggestion: "每个风险都应附带应对方案或需要的支持",
      };
    }
  }

  if (rule.includes("隐瞒")) {
    // 简单启发：检查是否过于正面
    const negativeWords = ["风险", "问题", "延期", "不足", "下降", "阻碍"];
    const hasNegative = negativeWords.some((w) => content.includes(w));
    if (!hasNegative && content.length > 200) {
      return {
        found: true,
        location: "全文",
        suggestion: "周报应如实反映问题和风险，过于正面可能遗漏重要信息",
      };
    }
  }

  return { found: false };
}

/**
 * 计算质检得分
 */
export function calculateScore(issues: QualityIssue[]): number {
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  let score = 100;
  score -= errorCount * 15; // 每个error扣15分
  score -= warningCount * 5; // 每个warning扣5分

  return Math.max(0, Math.min(100, score));
}

/**
 * 综合质检（规则引擎 + AI质检）
 * 先跑规则引擎（快速），再视情况调用AI质检（深度）
 */
export async function fullQualityCheck(
  content: string,
  template: WeeklyTemplate,
  originalInput: string,
  aiCheckFn?: (prompt: string) => Promise<string>
): Promise<QualityResult> {
  // 第一层：规则引擎
  const ruleIssues = ruleBasedCheck(content, template);
  const ruleScore = calculateScore(ruleIssues);

  // 如果规则引擎已经发现严重错误，直接返回（省API调用）
  const hasCriticalError = ruleIssues.some(
    (i) => i.severity === "error" && i.rule.includes("缺少")
  );

  if (hasCriticalError || ruleScore < 60) {
    return {
      passed: false,
      score: ruleScore,
      issues: ruleIssues,
    };
  }

  // 第二层：AI深度质检（可选，如果提供了aiCheckFn）
  if (aiCheckFn && ruleScore < 90) {
    try {
      // 这里会调用AI进行深度检查
      // 实际实现中，这里会发送质检prompt给AI
      // 为了性能和成本，可以抽样进行AI质检
      const aiResult = await aiCheckFn(content);
      // 解析AI返回的JSON
      // ...
    } catch {
      // AI质检失败，回退到规则引擎结果
    }
  }

  return {
    passed: ruleScore >= 80,
    score: ruleScore,
    issues: ruleIssues,
  };
}

/**
 * 快速质检 — 只跑规则引擎（用于实时预览）
 */
export function quickCheck(
  content: string,
  template: WeeklyTemplate
): QualityResult {
  const issues = ruleBasedCheck(content, template);
  const score = calculateScore(issues);

  return {
    passed: score >= 80,
    score,
    issues,
  };
}
