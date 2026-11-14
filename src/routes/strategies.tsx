import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertOctagon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoActionButton, DemoBadge, KV, KpiCard, PageHeader, Section, StatusBadge } from "@/components/app/common";
import { useDemo } from "@/lib/demo-store";
import { STRATEGY_STATUS, pct } from "@/lib/labels";
import { STRATEGIES } from "@/lib/mock/strategies";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/strategies")({
  head: () => ({
    meta: [
      { title: "策略研究 · 量化与多智能体指挥中心" },
      { name: "description", content: "策略目录、模拟回测指标与净值曲线。全部为模拟结果，非投资建议、非实盘业绩。" },
      { property: "og:title", content: "策略研究 · 量化与多智能体指挥中心" },
      { property: "og:description", content: "量化策略目录与模拟回测（非投资建议）。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StrategiesPage,
});

const chartConfig = {
  strategy: { label: "策略净值（模拟）", color: "var(--chart-1)" },
  benchmark: { label: "基准（模拟）", color: "var(--chart-2)" },
} satisfies ChartConfig;

function StrategiesPage() {
  const { refreshing } = useDemo();
  const [id, setId] = useState(STRATEGIES[0]?.id ?? "");
  const s = STRATEGIES.find((x) => x.id === id)!;
  const m = s.metrics;

  return (
    <>
      <PageHeader title="策略研究" description="策略目录与回测结果展示。回测由演示数据生成，仅用于验证界面。" />

      <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <AlertOctagon className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-destructive">所有绩效指标均为模拟结果 · 非投资建议 · 非实盘业绩</p>
          <p className="text-muted-foreground">
            以下净值曲线与指标由随机种子生成的演示数据计算，不代表任何真实回测、历史表现或未来收益。本系统不支持下单或实盘交易。
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <Section title="策略目录" description={`${STRATEGIES.length} 个策略`} bodyClassName="p-2">
          <ul className="space-y-1">
            {STRATEGIES.map((x) => (
              <li key={x.id}>
                <button
                  onClick={() => setId(x.id)}
                  className={cn(
                    "w-full rounded-md border border-transparent px-3 py-2.5 text-left transition-colors hover:bg-accent",
                    x.id === id && "border-primary/40 bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{x.name}</span>
                    <StatusBadge meta={STRATEGY_STATUS[x.status]} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={x.market === "A股" ? "signal" : "info"} className="px-1.5 py-0">{x.market}</Badge>
                    <span>{x.type}</span>
                    <span className={cn("num ml-auto", x.metrics.totalReturn >= 0 ? "text-success" : "text-destructive")}>
                      {pct(x.metrics.totalReturn)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <p className="px-3 pb-2 pt-3 text-[11px] text-muted-foreground">右侧收益率为模拟区间累计值。</p>
        </Section>

        <div className="space-y-4">
          <div className="panel p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{s.name}</h2>
              <StatusBadge meta={STRATEGY_STATUS[s.status]} />
              <Badge variant="muted">{s.type}</Badge>
              <Badge variant="muted">{s.frequency}</Badge>
              <DemoBadge label="模拟回测" className="ml-auto" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            <p className="num mt-1 text-xs text-muted-foreground">回测区间：{s.period}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard label="累计收益（模拟）" value={pct(m.totalReturn)} tone={m.totalReturn >= 0 ? "success" : "danger"} hint={`基准 ${pct(m.benchmarkReturn)}`} />
            <KpiCard label="年化收益（模拟）" value={pct(m.annualReturn)} tone={m.annualReturn >= 0 ? "success" : "danger"} />
            <KpiCard label="夏普比率（模拟）" value={m.sharpe.toFixed(2)} tone="signal" />
            <KpiCard label="最大回撤（模拟）" value={pct(m.maxDrawdown)} tone="danger" />
            <KpiCard label="周胜率（模拟）" value={`${m.winRate.toFixed(1)}%`} />
            <KpiCard label="年化波动（模拟）" value={`${m.volatility.toFixed(1)}%`} />
            <KpiCard label="交易次数（模拟）" value={m.trades} />
            <KpiCard label="超额收益（模拟）" value={pct(m.totalReturn - m.benchmarkReturn)} tone={m.totalReturn - m.benchmarkReturn >= 0 ? "success" : "danger"} />
          </div>

          <Section title="净值曲线" description="周频 · 起点归一为 1.00 · 模拟数据" actions={<DemoBadge label="模拟 · 非实盘" />}>
            {refreshing ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <AreaChart data={s.curve} margin={{ left: -8, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="fillStrategy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-strategy)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-strategy)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} minTickGap={48} tickFormatter={(v: string) => v.slice(0, 7)} />
                  <YAxis tickLine={false} axisLine={false} domain={["auto", "auto"]} tickFormatter={(v: number) => v.toFixed(2)} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area dataKey="strategy" type="monotone" stroke="var(--color-strategy)" fill="url(#fillStrategy)" strokeWidth={2} />
                  <Area dataKey="benchmark" type="monotone" stroke="var(--color-benchmark)" fill="none" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                </AreaChart>
              </ChartContainer>
            )}
          </Section>

          <div className="grid gap-4 md:grid-cols-2">
            <Section title="参数假设">
              {s.params.map((p) => <KV key={p.label} k={p.label} v={p.value} mono />)}
            </Section>
            <Section title="操作" description="研究与交易操作均未接入">
              <div className="flex flex-wrap gap-2">
                <DemoActionButton notice="已记录演示请求：重新运行回测（未执行）">重新回测（演示）</DemoActionButton>
                <DemoActionButton locked>部署到实盘</DemoActionButton>
                <DemoActionButton locked>下单 / 调仓</DemoActionButton>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">本原型不提供任何真实交易、下单或资金操作能力。</p>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}
