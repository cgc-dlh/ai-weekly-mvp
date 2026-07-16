"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default function PricingTable() {
  return (
    <section className="flex flex-col items-center justify-center px-4 mb-24 w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mb-4">
          <Sparkles className="h-4 w-4" />
          AI 周报助手
        </div>
        <h1 className="text-4xl font-medium tracking-tight mb-4">
          简单透明的定价
        </h1>
        <p className="text-xl text-muted-foreground">
          免费体验，按需升级。无隐藏费用。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* 免费版 */}
        <Card className="relative h-fit border-2">
          <CardHeader>
            <CardTitle className="text-2xl">免费版</CardTitle>
            <CardDescription>每月3次生成额度</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">¥0</span>
              <span className="text-muted-foreground">/月</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>10种专业周报模板</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>AI 智能生成</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>双层质检（规则+AI）</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>历史记录保存</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>每月3次生成额度</span>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Link href="/dashboard/write">
              <Button className="w-full" variant="outline">
                免费开始
              </Button>
            </Link>
          </div>
        </Card>

        {/* 专业版 */}
        <Card className="relative h-fit border-2 border-primary">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">
              <Zap className="h-3 w-3 mr-1" />
              推荐
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">专业版</CardTitle>
            <CardDescription>无限生成 + 风格学习</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">¥29</span>
              <span className="text-muted-foreground">/月</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>免费版全部功能</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span><strong>无限</strong>生成次数</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span><strong>AI 风格学习</strong>（越用越懂你）</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>导出 Word / PDF / 飞书</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>优先客服支持</span>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Link href="/dashboard/write">
              <Button className="w-full">
                立即升级
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-12 text-center max-w-md">
        <p className="text-sm text-muted-foreground">
          专业版即将上线，目前所有用户均可免费体验完整功能。
          <br />
          价格以最终上线版本为准。
        </p>
      </div>
    </section>
  );
}
