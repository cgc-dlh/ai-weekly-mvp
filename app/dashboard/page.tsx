import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { weeklyReport, usageLog } from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  PenLine,
  FileText,
  Sparkles,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  const userId = result.session.userId;

  // 统计数据
  const yearMonth = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}`;

  const [usageResult, totalReportsResult, recentReportsResult] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(usageLog)
        .where(
          and(
            eq(usageLog.userId, userId),
            eq(usageLog.yearMonth, yearMonth),
            eq(usageLog.action, "generate_weekly")
          )
        ),
      db
        .select({ count: count() })
        .from(weeklyReport)
        .where(eq(weeklyReport.userId, userId)),
      db
        .select({
          id: weeklyReport.id,
          templateId: weeklyReport.templateId,
          title: weeklyReport.title,
          qualityScore: weeklyReport.qualityScore,
          createdAt: weeklyReport.createdAt,
        })
        .from(weeklyReport)
        .where(eq(weeklyReport.userId, userId))
        .orderBy(desc(weeklyReport.createdAt))
        .limit(5),
    ]);

  const used = usageResult[0]?.count ?? 0;
  const limit = 3;
  const remaining = Math.max(0, limit - used);
  const totalReports = totalReportsResult[0]?.count ?? 0;

  const templateNameMap: Record<string, string> = {
    "okr-weekly": "OKR周报",
    "agile-sprint": "敏捷迭代周报",
    "project-progress": "项目进度周报",
    "personal-weekly": "个人工作周报",
    "team-lead-weekly": "团队负责人周报",
    "intern-weekly": "实习生周报",
    "pm-weekly": "产品经理周报",
    "dev-weekly": "开发工程师周报",
    "design-weekly": "设计师周报",
    "sales-weekly": "销售周报",
  };

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full max-w-6xl mx-auto">
      <div className="w-full space-y-6">
        {/* 欢迎区 */}
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            欢迎回来，{result.user.name || "用户"}
          </h1>
          <p className="text-muted-foreground">
            本周已生成 {used} 份周报，剩余 {remaining} 次免费额度
          </p>
        </div>

        {/* 快捷操作卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    <PenLine className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base mb-1">写周报</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    选择模板，一键生成专业周报
                  </p>
                </div>
              </div>
              <Link href="/dashboard/write">
                <Button className="mt-4 w-full" size="sm">
                  立即开始 <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="bg-muted w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base mb-1">本月用量</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    免费额度 {used}/{limit}
                  </p>
                </div>
              </div>
              <Progress value={(used / limit) * 100} className="mt-4 h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {remaining > 0
                  ? `还可免费生成 ${remaining} 次`
                  : "本月额度已用完，下月自动恢复"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="bg-muted w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base mb-1">质检保障</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    AI 双重质检，零低级错误
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  规则引擎
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI 深度检查
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 最近生成 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">最近生成</h2>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm">
                查看全部 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentReportsResult.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>还没有生成过周报</p>
                <Link href="/dashboard/write">
                  <Button className="mt-3" size="sm">
                    去写第一份周报
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentReportsResult.map((report) => (
                <Card key={report.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{report.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px]">
                              {templateNameMap[report.templateId] ||
                                report.templateId}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(report.createdAt).toLocaleDateString(
                                "zh-CN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {report.qualityScore !== null && (
                        <Badge
                          className={`${
                            report.qualityScore >= 90
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : report.qualityScore >= 80
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {report.qualityScore}分
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 模板速览 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">可用模板</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(templateNameMap).map(([id, name]) => (
              <Link key={id} href={`/dashboard/write?template=${id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-3 text-center">
                    <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-medium">{name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
