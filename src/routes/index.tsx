import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Bot, CircleCheck, Clock, ListChecks, Server, ShieldAlert } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DemoBadge, KpiCard, ListSkeleton, Meter, PageHeader, SafetyNotice, Section, StatusBadge } from "@/components/app/common";
import { useDemo } from "@/lib/demo-store";
import { AGENT_STATUS, AUDIT_RESULT, HOST_STATUS, REPORT_STATUS, RISK } from "@/lib/labels";
import { AGENTS, agentById } from "@/lib/mock/agents";
import { HOSTS } from "@/lib/mock/infra";
import { REPORTS } from "@/lib/mock/reports";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "总览 · 量化与多智能体指挥中心" },
      { name: "description", content: "Agent 状态、任务队列、研究报告、基础设施与审计事件的统一总览（演示数据）。" },
      { property: "og:title", content: "总览 · 量化与多智能体指挥中心" },
      { property: "og:description", content: "多智能体运营、量化研究与基础设施的统一演示控制台。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

const THROUGHPUT = [
  { h: "04", done: 6, failed: 0 },
  { h: "05", done: 4, failed: 1 },
  { h: "06", done: 7, failed: 0 },
  { h: "07", done: 9, failed: 0 },
  { h: "08", done: 14, failed: 1 },
  { h: "09", done: 11, failed: 2 },
  { h: "10", done: 16, failed: 0 },
  { h: "11", done: 13, failed: 1 },
  { h: "12", done: 10, failed: 0 },
  { h: "13", done: 15, failed: 1 },
  { h: "14", done: 18, failed: 0 },
  { h: "15", done: 7, failed: 0 },
];

const chartConfig = {
  done: { label: "完成", color: "var(--chart-1)" },
  failed: { label: "失败", color: "var(--chart-5)" },
} satisfies ChartConfig;

function Overview() {
  const { tasks, approvals, audit, refreshing } = useDemo();
  const active = AGENTS.filter((a) => a.status !== "offline").length;
  const count = (s: string) => tasks.filter((t) => t.status === s).length;
  const pending = approvals.filter((a) => a.status === "pending").length;
  const hostWarn = HOSTS.filter((h) => h.status !== "healthy").length;

  return (
    <>
      <PageHeader title="总览" description="多智能体运营、量化研究与基础设施的统一视图。所有数值为演示数据，不代表真实运行状态。" />

      <SafetyNotice>
        当前为 MVP 原型：未连接任何 Agent Runtime、GitHub、Linux 主机、行情或数据库。所有指标、心跳与回测结果均为本地模拟数据；任何可能影响生产的操作均已禁用。
      </SafetyNotice>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Agent 在线（演示）" value={`${active}/${AGENTS.length}`} icon={<Bot />} tone="success" hint="含执行中与空闲" />
        <KpiCard label="运行中任务" value={count("running")} icon={<ListChecks />} tone="signal" />
        <KpiCard label="排队中" value={count("queued")} icon={<Clock />} />
        <KpiCard label="失败任务" value={count("failed")} icon={<AlertTriangle />} tone={count("failed") ? "danger" : "default"} hint="可在任务中心演示重试" />
        <KpiCard label="待审批操作" value={pending} icon={<ShieldAlert />} tone={pending ? "warning" : "default"} hint="批准后也不会执行" />
        <KpiCard label="主机需关注" value={`${hostWarn}/${HOSTS.length}`} icon={<Server />} tone={hostWarn ? "warning" : "success"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Section
          title="Agent 状态"
          description="心跳为演示值"
          className="xl:col-span-1"
          bodyClassName="p-0"
          actions={<Button asChild variant="ghost" size="sm"><Link to="/agents">全部 <ArrowRight /></Link></Button>}
        >
          {refreshing ? (
            <div className="p-4"><ListSkeleton rows={6} /></div>
          ) : (
            <ul className="divide-y">
              {AGENTS.slice(0, 7).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.name} <span className="text-xs text-muted-foreground">{a.codename}</span></div>
                    <div className="truncate text-xs text-muted-foreground">{a.currentTask ? `当前：${a.currentTask}` : "无当前任务"}</div>
                  </div>
                  <StatusBadge meta={AGENT_STATUS[a.status]} dot />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="近 12 小时任务吞吐"
          description="按小时统计的完成 / 失败数量"
          className="xl:col-span-2"
          actions={<DemoBadge label="模拟统计" />}
        >
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={THROUGHPUT} margin={{ left: -20, right: 4, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="h" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}:00`} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="done" stackId="a" fill="var(--color-done)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Section
          title="最新研究报告"
          bodyClassName="p-0"
          actions={<Button asChild variant="ghost" size="sm"><Link to="/reports">报告库 <ArrowRight /></Link></Button>}
        >
          <ul className="divide-y">
            {REPORTS.slice(0, 4).map((r) => (
              <li key={r.id} className="space-y-1 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge variant={r.market === "A股" ? "signal" : "info"}>{r.market}</Badge>
                  <StatusBadge meta={REPORT_STATUS[r.status]} />
                  <span className="num ml-auto text-xs text-muted-foreground">{r.date}</span>
                </div>
                <p className="line-clamp-1 text-sm font-medium">{r.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{agentById(r.authorId)?.name} · {r.summary}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="基础设施摘要"
          description="读数为演示数据"
          actions={<Button asChild variant="ghost" size="sm"><Link to="/infrastructure">主机 <ArrowRight /></Link></Button>}
        >
          <div className="space-y-4">
            {HOSTS.map((h) => (
              <div key={h.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="num font-medium">{h.hostname}</span>
                  <StatusBadge meta={HOST_STATUS[h.status]} dot />
                </div>
                <div className="grid grid-cols-3 gap-3 text-[11px] text-muted-foreground">
                  {([["CPU", h.cpu], ["内存", h.memory], ["磁盘", h.disk]] as const).map(([k, v]) => (
                    <div key={k} className="space-y-1">
                      <div className="flex justify-between"><span>{k}</span><span className="num">{v}%</span></div>
                      <Meter value={v} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="最近审计事件"
          bodyClassName="p-0"
          className="lg:col-span-2 xl:col-span-1"
          actions={<Button asChild variant="ghost" size="sm"><Link to="/audit">审计 <ArrowRight /></Link></Button>}
        >
          <ul className="divide-y">
            {[...audit].reverse().slice(0, 6).map((e) => (
              <li key={e.hash} className="flex items-start gap-3 px-4 py-2.5">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{e.action}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="num">{e.at.slice(11)}</span> · {e.actor} · {e.target}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={AUDIT_RESULT[e.result]}>{e.result}</Badge>
                  <span className="text-[10px] text-muted-foreground">{RISK[e.risk].label}</span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

    </>
  );
}
