/**
 * Freemium 使用量跟踪
 * 免费用户每月3次生成额度
 * 独立于 Polar.sh 订阅系统
 */

import { db } from "@/db/drizzle";
import { usageLog } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

const FREE_MONTHLY_LIMIT = 3;

function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * 获取用户本月使用量
 */
export async function getMonthlyUsage(userId: string): Promise<number> {
  const yearMonth = getCurrentYearMonth();
  const result = await db
    .select({ count: count() })
    .from(usageLog)
    .where(
      and(
        eq(usageLog.userId, userId),
        eq(usageLog.yearMonth, yearMonth),
        eq(usageLog.action, "generate_weekly")
      )
    );
  return result[0]?.count ?? 0;
}

/**
 * 检查用户是否可以生成周报
 */
export async function canGenerate(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const used = await getMonthlyUsage(userId);
  const limit = FREE_MONTHLY_LIMIT;
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

/**
 * 记录一次生成使用
 */
export async function recordUsage(userId: string, action: string = "generate_weekly"): Promise<void> {
  const yearMonth = getCurrentYearMonth();
  await db.insert(usageLog).values({
    id: crypto.randomUUID(),
    userId,
    action,
    yearMonth,
  });
}

/**
 * 获取用户用量状态（用于前端展示）
 */
export async function getUsageStatus(userId: string) {
  const used = await getMonthlyUsage(userId);
  const limit = FREE_MONTHLY_LIMIT;
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    percentage: Math.round((used / limit) * 100),
    isLimitReached: used >= limit,
  };
}
