import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileSearch, FileText, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemoActionButton, DemoBadge, EmptyState, PageHeader, SafetyNotice, StatusBadge } from "@/components/app/common";
import { useDemo } from "@/lib/demo-store";
import { REPORT_STATUS } from "@/lib/labels";
import { agentById } from "@/lib/mock/agents";
import { REPORTS } from "@/lib/mock/reports";
import type { Market, Report, ReportStatus } from "@/lib/mock/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "研究报告 · 量化与多智能体指挥中心" },
      { name: "description", content: "A股 / 美股研究报告库：日期、市场、状态与摘要，可搜索查看详情（演示内容）。" },
      { property: "og:title", content: "研究报告 · 量化与多智能体指挥中心" },
      { property: "og:description", content: "A股与美股研究报告库（演示内容，不构成投资建议）。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { refreshing } = useDemo();
  const [market, setMarket] = useState<"all" | Market>("all");
  const [status, setStatus] = useState<"all" | ReportStatus>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Report | null>(null);

  const needle = q.trim().toLowerCase();
  const list = REPORTS.filter((r) => {
    if (market !== "all" && r.market !== market) return false;
    if (status !== "all" && r.status !== status) return false;
    if (!needle) return true;
    const hay = [r.title, r.summary, r.id, ...r.tags, ...r.sections.map((s) => s.heading + s.body)].join(" ").toLowerCase();
    return hay.includes(needle);
  });

  return (
    <>
      <PageHeader title="研究报告" description="由研究类 Agent 生成的报告草稿与成稿。所有内容为演示文本，不构成任何投资建议。" />

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={market} onValueChange={(v) => setMarket(v as typeof market)}>
          <TabsList>
            <TabsTrigger value="all">全部市场</TabsTrigger>
            <TabsTrigger value="A股">A股</TabsTrigger>
            <TabsTrigger value="美股">美股</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {(Object.keys(REPORT_STATUS) as ReportStatus[]).map((s) => <SelectItem key={s} value={s}>{REPORT_STATUS[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索标题、摘要、标签或正文" className="pl-8" />
        </div>
      </div>

      {refreshing ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="panel"><EmptyState title="没有找到相关报告" hint="尝试更换关键词，或切换市场与状态筛选。" icon={<FileSearch />} /></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <button
              key={r.id}
              onClick={() => setOpen(r)}
              className="panel group flex flex-col gap-3 p-4 text-left transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-2">
                <Badge variant={r.market === "A股" ? "signal" : "info"}>{r.market}</Badge>
                <StatusBadge meta={REPORT_STATUS[r.status]} />
                <span className="num ml-auto text-xs text-muted-foreground">{r.date}</span>
              </div>
              <h3 className="font-medium leading-snug group-hover:text-primary">{r.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>
              <div className="mt-auto flex items-center gap-1.5 pt-1">
                <FileText className="size-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{agentById(r.authorId)?.name}</span>
                <div className="ml-auto flex gap-1">
                  {r.tags.slice(0, 2).map((t) => <Badge key={t} variant="muted">{t}</Badge>)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="num text-xs text-muted-foreground">{open.id}</span>
                  <Badge variant={open.market === "A股" ? "signal" : "info"}>{open.market}</Badge>
                  <StatusBadge meta={REPORT_STATUS[open.status]} />
                  <DemoBadge label="演示内容" />
                </div>
                <DialogTitle className="text-lg leading-snug">{open.title}</DialogTitle>
                <DialogDescription>
                  {open.date} · 作者：{agentById(open.authorId)?.name}
                </DialogDescription>
              </DialogHeader>
              <SafetyNotice>本报告为演示文本，所列代码与结论均为示例，不构成投资建议，也不来自真实数据源。</SafetyNotice>
              <div className="rounded-md border bg-panel p-3 text-sm">
                <div className="mb-1 text-xs text-muted-foreground">摘要</div>
                {open.summary}
              </div>
              <div className="space-y-4">
                {open.sections.map((s) => (
                  <div key={s.heading}>
                    <h4 className="mb-1 text-sm font-semibold">{s.heading}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {open.tags.map((t) => <Badge key={t} variant="muted">#{t}</Badge>)}
                {open.tickers.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
              </div>
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <DemoActionButton locked>发布到知识库</DemoActionButton>
                <DemoActionButton locked>推送到 GitHub</DemoActionButton>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
