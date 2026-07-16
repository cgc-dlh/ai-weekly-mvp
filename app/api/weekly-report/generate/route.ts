import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { weeklyReport, userStyleProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { canGenerate, recordUsage } from "@/lib/usage";
import { getTemplate, TemplateId } from "@/lib/templates";
import { buildSystemPrompt, buildUserPrompt, buildQualityCheckPrompt } from "@/lib/prompts";
import { fullQualityCheck, quickCheck } from "@/lib/quality-checker";

export async function POST(req: Request) {
  try {
    // 1. 鉴权
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. 检查 Freemium 额度
    const usageCheck = await canGenerate(userId);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: "本月免费额度已用完",
          used: usageCheck.used,
          limit: usageCheck.limit,
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }

    // 3. 解析请求
    const body = await req.json();
    const {
      templateId,
      rawContent,
      userInfo = {},
      tone = "formal",
    } = body as {
      templateId: TemplateId;
      rawContent: string;
      userInfo?: { name?: string; role?: string; department?: string; company?: string };
      tone?: "formal" | "casual" | "data-driven";
    };

    if (!templateId || !rawContent) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json({ error: "模板不存在" }, { status: 400 });
    }

    // 4. 获取用户风格档案（用于风格学习）
    const styleProfiles = await db
      .select()
      .from(userStyleProfile)
      .where(eq(userStyleProfile.userId, userId));
    const styleProfile = styleProfiles[0];

    // 5. 构建 Prompt
    const systemPrompt = buildSystemPrompt(template, tone);
    const userPrompt = buildUserPrompt({
      template,
      userInfo,
      rawContent,
      previousReports: styleProfile?.styleData
        ? [JSON.parse(styleProfile.styleData).stylePrompt || ""].filter(Boolean)
        : undefined,
      tone,
    });

    // 6. AI 生成
    const { text: generatedContent } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // 7. 质检（双层）
    const qualityResult = await fullQualityCheck(
      generatedContent,
      template,
      rawContent
    );

    // 8. 如果质检未通过且有严重错误，尝试修正
    let finalContent = generatedContent;
    if (!qualityResult.passed && qualityResult.score < 60) {
      // 生成修正版本
      const correctionPrompt = `以下周报存在质量问题，请修正后重新输出：

${generatedContent}

问题列表：
${qualityResult.issues.map((i) => `- [${i.severity}] ${i.rule}: ${i.suggestion}`).join("\n")}

请直接输出修正后的完整周报，不要有任何额外说明。`;

      const { text: corrected } = await generateText({
        model: openai("gpt-4o-mini"),
        system: systemPrompt,
        prompt: correctionPrompt,
        temperature: 0.5,
        maxTokens: 2000,
      });
      finalContent = corrected;
    }

    // 9. 保存到数据库
    const reportId = crypto.randomUUID();
    await db.insert(weeklyReport).values({
      id: reportId,
      userId,
      templateId,
      title: `${template.name} - ${new Date().toLocaleDateString("zh-CN")}`,
      content: finalContent,
      rawInput: rawContent,
      qualityScore: qualityResult.score,
      qualityIssues: JSON.stringify(qualityResult.issues),
      status: "draft",
    });

    // 10. 记录使用量
    await recordUsage(userId);

    return NextResponse.json({
      success: true,
      reportId,
      content: finalContent,
      quality: qualityResult,
      usage: {
        used: usageCheck.used + 1,
        limit: usageCheck.limit,
        remaining: usageCheck.limit - usageCheck.used - 1,
      },
    });
  } catch (error) {
    console.error("Generate weekly report error:", error);
    return NextResponse.json(
      { error: "生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}
