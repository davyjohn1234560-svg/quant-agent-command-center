import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Box, Clock, Cog, HardDrive, MemoryStick, Cpu, ScrollText, Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoActionButton, DemoBadge, KV, KpiCard, Meter, PageHeader, SafetyNotice, StatusBadge } from "@/components/app/common";
import { useDemo } from "@/lib/demo-store";
import { HOST_STATUS, SERVICE_STATUS } from "@/lib/labels";
import { HOSTS } from "@/lib/mock/infra";
import type { Host } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/infrastructure")({
  head: () => ({
    meta: [
      { title: "基础设施 · 量化与多智能体指挥中心" },
      { name: "description", content: "Linux 主机 CPU、内存、磁盘、Docker / 服务、运行时长与日志（全部为演示读数）。" },
      { property: "og:title", content: "基础设施 · 量化与多智能体指挥中心" },
      { property: "og:description", content: "Linux 主机与服务状态总览（演示读数）。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InfraPage,
});

const LOG_TONE = { INFO: "text-muted-foreground", WARN: "text-warning", ERROR: "text-destructive" } as const;

function InfraPage() {
  const { refreshing } = useDemo();
  const [host, setHost] = useState<Host | null>(null);
  const services = HOSTS.flatMap((h) => h.services);
  const avg = (k: "cpu" | "memory" | "disk") => Math.round(HOSTS.reduce((a, h) => a + h[k], 0) / HOSTS.length);

  return (
    <>
      <PageHeader title="基础设施" description="Linux 主机与容器服务状态。所有读数为演示数据，未通过 SSH 或监控代理采集。" />

      <SafetyNotice>演示数据：以下 CPU、内存、磁盘、负载、服务与日志均为静态示例；主机地址使用文档保留网段，不对应任何真实服务器。</SafetyNotice>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="主机" value={HOSTS.length} hint={`${HOSTS.filter((h) => h.status !== "healthy").length} 台需关注`} />
        <KpiCard label="平均 CPU（演示）" value={`${avg("cpu")}%`} tone="signal" />
        <KpiCard label="平均内存（演示）" value={`${avg("memory")}%`} />
        <KpiCard label="服务运行中" value={`${services.filter((s) => s.status === "running").length}/${services.length}`} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {HOSTS.map((h) =>
          refreshing ? (
            <Skeleton key={h.id} className="h-72" />
          ) : (
            <article key={h.id} className="panel flex flex-col">
              <header className="flex items-start justify-between gap-3 border-b p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full pulse-dot", h.status === "healthy" ? "bg-success" : "bg-warning")} />
                    <h3 className="num font-semibold">{h.hostname}</h3>
                    <StatusBadge meta={HOST_STATUS[h.status]} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="num">{h.address}</span> · {h.os} · {h.role}
                  </p>
                </div>
                <DemoBadge />
              </header>

              <div className="grid grid-cols-3 gap-4 p-4">
                {([
                  ["CPU", h.cpu, <Cpu key="c" />, ""],
                  ["内存", h.memory, <MemoryStick key="m" />, `${Math.round((h.memory / 100) * h.memoryTotalGb)}/${h.memoryTotalGb} GB`],
                  ["磁盘", h.disk, <HardDrive key="d" />, `${Math.round((h.disk / 100) * h.diskTotalGb)}/${h.diskTotalGb} GB`],
                ] as const).map(([k, v, icon, sub]) => (
                  <div key={k} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5">{icon}{k}</div>
                    <div className={cn("num text-xl font-semibold", v >= 85 ? "text-destructive" : v >= 75 ? "text-warning" : "")}>{v}%</div>
                    <Meter value={v} warnAt={75} dangerAt={85} />
                    <div className="num text-[11px] text-muted-foreground">{sub || `负载 ${h.load.join(" / ")}`}</div>
                  </div>
                ))}
              </div>

              <div className="border-t px-4 py-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Box className="size-3.5" /> Docker / 服务</div>
                <ul className="space-y-1.5">
                  {h.services.map((s) => (
                    <li key={s.name} className="flex items-center gap-2 text-sm">
                      <Badge variant="muted" className="num px-1.5 py-0 text-[10px]">{s.kind}</Badge>
                      <span className="num">{s.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{s.detail}</span>
                      <span className="ml-auto"><StatusBadge meta={SERVICE_STATUS[s.status]} dot /></span>
                    </li>
                  ))}
                </ul>
              </div>

              <footer className="mt-auto flex items-center justify-between gap-2 border-t px-4 py-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" /> 运行 {h.uptime}</span>
                <Button size="sm" variant="ghost" onClick={() => setHost(h)}><ScrollText /> 日志与详情</Button>
              </footer>
            </article>
          ),
        )}
      </div>

      <Sheet open={!!host} onOpenChange={(o) => !o && setHost(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {host && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2"><StatusBadge meta={HOST_STATUS[host.status]} dot /><DemoBadge /></div>
                <SheetTitle className="num">{host.hostname}</SheetTitle>
                <SheetDescription>{host.role} · {host.os}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <KV k="地址（示例网段）" v={host.address} mono />
                  <KV k="运行时长" v={host.uptime} />
                  <KV k="负载 1/5/15" v={host.load.join(" / ")} mono />
                  <KV k="内存总量" v={`${host.memoryTotalGb} GB`} mono />
                  <KV k="磁盘总量" v={`${host.diskTotalGb} GB`} mono />
                </div>
                <div className="space-y-2">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold"><ScrollText className="size-4" /> 最近日志（演示）</h3>
                  <pre className="num overflow-x-auto rounded-md border bg-panel p-3 text-xs leading-relaxed">
                    {host.logs.map((l, i) => (
                      <div key={i}>
                        <span className="text-muted-foreground">{l.at}</span>{" "}
                        <span className={LOG_TONE[l.level]}>{l.level.padEnd(5)}</span> {l.message}
                      </div>
                    ))}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Cog className="size-4" /> 运维操作</h3>
                  <SafetyNotice>SSH、命令执行与服务重启均未接入，按钮已锁定。接入后也应经过安全审计页的人工审批。</SafetyNotice>
                  <div className="flex flex-wrap gap-2">
                    <DemoActionButton locked><Terminal /> 打开 SSH 终端</DemoActionButton>
                    <DemoActionButton locked>重启服务</DemoActionButton>
                    <DemoActionButton locked>清理磁盘</DemoActionButton>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
