"use client";

import { useState, useEffect } from "react";
import { templateList, TemplateId } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PenLine,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Zap,
  Users,
  Target,
  BarChart3,
  Code2,
  Palette,
  Briefcase,
  GraduationCap,
} from "lucide-react";

const toneOptions = [
  { value: "formal", label: "正式商务", desc: "专业术语，结构严谨" },
  { value: "casual", label: "简洁务实", desc: "直接清晰，不啰嗦" },
  { value: "data-driven", label: "数据驱动", desc: "每个结论有数字支撑" },
];

const templateIcons: Record<string, React.ReactNode> = {
  "okr-weekly": <Target className="h-5 w-5" />,
  "agile-sprint": <Zap className="h-5 w-5" />,
  "project-progress": <BarChart3 className="h-5 w-5" />,
  "personal-weekly": <FileText className="h-5 w-5" />,
  "team-lead-weekly": <Users className="h-5 w-5" />,
  "intern-weekly": <GraduationCap className="h-5 w-5" />,
  "pm-weekly": <Target className="h-5 w-5" />,
  "dev-weekly": <Code2 className="h-5 w-5" />,
  "design-weekly": <Palette className="h-5 w-5" />,
  "sales-weekly": <Briefcase className="h-5 w-5" />,
};

interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  isLimitReached: boolean;
  isAnonymous: boolean;
}

interface QualityResult {
  passed: boolean;
  score: number;
  issues: Array<{
    severity: "error" | "warning";
    rule: string;
    location: string;
    suggestion: string;
  }>;
}

export default function WritePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("personal-weekly");
  const [rawContent, setRawContent] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
    department: "",
    company: "",
  });
  const [tone, setTone] = useState<"formal" | "casual" | "data-driven">("formal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    content: string;
    reportId: string;
    quality: QualityResult;
    usage: { used: number; limit: number; remaining: number };
  } | null>(null);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<UsageStatus | null>(null);

  // 获取用量状态
  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data) => setUsage(data))
      .catch(console.error);
  }, [result]);

  const handleGenerate = async () => {
    if (!rawContent.trim()) {
      setError("请填写本周工作要点");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/weekly-report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          rawContent,
          userInfo,
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成失败");
        return;
      }

      setResult(data);
    } catch (e) {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplateData = templateList.find((t) => t.id === selectedTemplate);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-50 border-green-200";
    if (score >= 80) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PenLine className="h-6 w-6" />
            AI 周报助手
          </h1>
          <p className="text-muted-foreground mt-1">
            选择模板，输入要点，一键生成专业周报
          </p>
        </div>
        {usage && !usage.isAnonymous && (
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-2">
            <span className="text-sm text-muted-foreground">
              本月额度
            </span>
            <Progress
              value={usage.percentage}
              className="w-24 h-2"
            />
            <span className="text-sm font-medium">
              {usage.used}/{usage.limit}
            </span>
            {usage.isLimitReached && (
              <Badge variant="destructive">已用完</Badge>
            )}
          </div>
        )}
      </div>

      {/* 模板选择 */}
      <div>
        <Label className="text-base font-semibold mb-3 block">选择模板</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {templateList.map((t) => (
            <Card
              key={t.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate === t.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedTemplate(t.id as TemplateId)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-primary">
                    {templateIcons[t.id] || <FileText className="h-5 w-5" />}
                  </div>
                  <span className="font-medium text-sm">{t.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {t.description}
                </p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {t.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 主编辑区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：输入区 */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">填写信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 用户信息 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">姓名</Label>
                  <Input
                    placeholder="你的名字"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">职位</Label>
                  <Input
                    placeholder="如：产品经理"
                    value={userInfo.role}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, role: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">部门</Label>
                  <Input
                    placeholder="如：技术部"
                    value={userInfo.department}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, department: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">公司</Label>
                  <Input
                    placeholder="公司名称"
                    value={userInfo.company}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, company: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* 语气选择 */}
              <div>
                <Label className="text-xs mb-1 block">写作语气</Label>
                <Select
                  value={tone}
                  onValueChange={(v) => setTone(v as typeof tone)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label} — {o.desc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 本周要点 */}
              <div>
                <Label className="text-xs mb-1 block">
                  本周工作要点
                  {selectedTemplateData && (
                    <span className="text-muted-foreground font-normal ml-1">
                      ({selectedTemplateData.name})
                    </span>
                  )}
                </Label>
                <Textarea
                  placeholder={
                    selectedTemplateData?.sections
                      .map(
                        (s) =>
                          `【${s.title}】\n${s.placeholder}`
                      )
                      .join("\n\n") ||
                    "请填写本周工作内容..."
                  }
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  className="min-h-[280px] resize-y"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  提示：尽量提供具体数据和事实，AI会自动整理成规范格式
                </p>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* 生成按钮 */}
              <Button
                onClick={handleGenerate}
                disabled={loading || usage?.isLimitReached}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI 生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成周报
                    {usage && !usage.isAnonymous && (
                      <span className="ml-1 text-xs opacity-70">
                        (剩余 {usage.remaining} 次)
                      </span>
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 模板结构提示 */}
          {selectedTemplateData && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">模板结构</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedTemplateData.sections.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-medium min-w-[1.5rem]">
                        {i + 1}.
                      </span>
                      <div>
                        <span className="font-medium">{s.title}</span>
                        {s.required && (
                          <Badge variant="destructive" className="ml-2 text-[10px]">
                            必填
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：结果区 */}
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              {/* 质检评分卡 */}
              <Card className={`border-2 ${getScoreBg(result.quality.score)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.quality.passed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                      )}
                      <div>
                        <p className="font-semibold">
                          质检{result.quality.passed ? "通过" : "未通过"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          共发现 {result.quality.issues.length} 个问题
                        </p>
                      </div>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(result.quality.score)}`}>
                      {result.quality.score}
                    </div>
                  </div>

                  {result.quality.issues.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {result.quality.issues.slice(0, 3).map((issue, i) => (
                        <div
                          key={i}
                          className={`text-xs p-2 rounded ${
                            issue.severity === "error"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          <span className="font-medium">
                            [{issue.severity === "error" ? "错误" : "提醒"}]
                          </span>{" "}
                          {issue.rule}: {issue.suggestion}
                        </div>
                      ))}
                      {result.quality.issues.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          还有 {result.quality.issues.length - 3} 个问题...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 周报内容 */}
              <Card className="flex-1">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">生成结果</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(result.content);
                      }}
                    >
                      复制
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="preview">
                    <TabsList className="mb-3">
                      <TabsTrigger value="preview">预览</TabsTrigger>
                      <TabsTrigger value="raw">原文</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview">
                      <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">
                        {result.content}
                      </div>
                    </TabsContent>
                    <TabsContent value="raw">
                      <Textarea
                        value={result.content}
                        readOnly
                        className="min-h-[400px] font-mono text-sm"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>填写左侧信息后点击生成</p>
                <p className="text-sm mt-1">AI 将基于规范模板自动生成专业周报</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
