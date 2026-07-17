"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  History,
  FileText,
  Loader2,
  AlertCircle,
  ArrowRight,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportItem {
  id: string;
  templateId: string;
  title: string;
  qualityScore: number | null;
  status: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/weekly-report/history")
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || "获取失败");
        }
        return r.json();
      })
      .then((data) => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-600";
    if (score >= 90) return "bg-green-100 text-green-700";
    if (score >= 80) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* 头部 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6" />
          历史记录
        </h1>
        <p className="text-muted-foreground mt-1">
          查看和管理你生成过的周报
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex items-center gap-2 py-10 text-red-600 justify-center">
            <AlertCircle className="h-5 w-5" />
            {error}
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">还没有生成过周报</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard/write")}
            >
              去写周报 <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/write?report=${report.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{report.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {templateNameMap[report.templateId] || report.templateId}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {report.qualityScore !== null && (
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getScoreColor(
                          report.qualityScore
                        )}`}
                      >
                        <BarChart3 className="h-3 w-3" />
                        {report.qualityScore}分
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
