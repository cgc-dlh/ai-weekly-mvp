import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { weeklyReport } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const reports = await db
      .select({
        id: weeklyReport.id,
        templateId: weeklyReport.templateId,
        title: weeklyReport.title,
        qualityScore: weeklyReport.qualityScore,
        status: weeklyReport.status,
        createdAt: weeklyReport.createdAt,
      })
      .from(weeklyReport)
      .where(eq(weeklyReport.userId, session.user.id))
      .orderBy(desc(weeklyReport.createdAt))
      .limit(50);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { error: "获取历史记录失败" },
      { status: 500 }
    );
  }
}
