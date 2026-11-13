import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, Cpu, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DemoActionButton,
  DemoBadge,
  EmptyState,
  KV,
  KpiCard,
  ListSkeleton,
  PageHeader,
  SafetyNotice,
  Section,
  StatusBadge,
} from "@/components/app/common";
import { useDemo } from "@/lib/demo-store";
import { AGENT_STATUS, TASK_STATUS } from "@/lib/labels";
import { AGENTS } from "@/lib/mock/agents";
import type { Agent, AgentStatus } from "@/lib/mock/types";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agent 管理 · 量化与多智能体指挥中心" },
      { name: "description", content: "多智能体名册：角色、运行时、状态、当前任务、心跳与能力（演示数据）。" },
      { property: "og:title", content: "Agent 管理 · 量化与多智能体指挥中心" },
      { property: "og:description", content: "查看各 Agent 的角色、状态与能力（演示数据）。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgentsPage,
});

function heartbeatText(sec: number | null) {
  if (sec === null) return "无心跳";
  if (sec < 60) return `${sec} 秒前`;
  return `${Math.floor(sec / 60)} 分钟前`;
}

function AgentsPage() {
  const { tasks, refreshing } = useDemo();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AgentStatus>("all");
  const [role, setRole] = useState("all");
  const [selected, setSelected] = useState<Agent | null>(null);

  const roles = useMemo(() => Array.from(new Set(AGENTS.map((a) => a.role))), []);
  const list = AGENTS.filter(
    (a) =>
      (status === "all" || a.status === status) &&
      (role === "all" || a.role === role) &&
      (q === "" || `${a.name}${a.codename}${a.capabilities.join("")}`.toLowerCase().includes(q.toLowerCase())),
  );
  const by = (s: AgentStatus) => AGENTS.filter((a) => a.status === s).length;
  const agentTasks = selected ? tasks.filter((t) => t.ownerId === selected.id) : [];

  return (
    <>
      <PageHeader title="Agent 管理" description="Agent 名册与运行状态。心跳、运行时与成功率均为演示数据，未连接真实 Agent Runtime。" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard label="在线" value={by("online")} tone="success" />
        <KpiCard label="执行中" value={by("busy")} tone="signal" />
        <KpiCard label="空闲" value={by("idle")} />
        <KpiCard label="异常" value={by("error")} tone="danger" />
        <KpiCard label="离线" value={by("offline")} />
      </div>

      <Section
        title="Agent 名册"
        description={`共 ${list.length} 个 · 点击行查看详情`}
        bodyClassName="p-0"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索名称或能力" className="h-8 w-48 pl-8 text-xs" />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {(Object.keys(AGENT_STATUS) as AgentStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{AGENT_STATUS[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {refreshing ? (
          <div className="p-4"><ListSkeleton rows={8} /></div>
        ) : list.length === 0 ? (
          <EmptyState title="没有匹配的 Agent" hint="调整搜索词或筛选条件后再试。" icon={<Bot />} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>角色</TableHead>
                <TableHead className="hidden lg:table-cell">运行时</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>当前任务</TableHead>
                <TableHead>心跳（演示）</TableHead>
                <TableHead className="hidden xl:table-cell">能力</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((a) => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                  <TableCell>
                    <div className="font-medium">{a.name}</div>
                    <div className="num text-xs text-muted-foreground">{a.codename}</div>
                  </TableCell>
                  <TableCell>{a.role}</TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">{a.runtime}</TableCell>
                  <TableCell><StatusBadge meta={AGENT_STATUS[a.status]} dot /></TableCell>
                  <TableCell className="num text-xs">{a.currentTask ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className={a.heartbeatSec !== null && a.heartbeatSec > 120 ? "text-destructive" : "text-muted-foreground"}>
                    <span className="text-xs">{heartbeatText(a.heartbeatSec)}</span>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {a.capabilities.slice(0, 3).map((c) => <Badge key={c} variant="muted">{c}</Badge>)}
                      {a.capabilities.length > 3 && <Badge variant="muted">+{a.capabilities.length - 3}</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <StatusBadge meta={AGENT_STATUS[selected.status]} dot />
                  <DemoBadge />
                </div>
                <SheetTitle className="text-lg">{selected.name} <span className="num text-sm text-muted-foreground">{selected.codename}</span></SheetTitle>
                <SheetDescription>{selected.description}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <KV k="角色" v={selected.role} />
                  <KV k="运行时" v={selected.runtime} />
                  <KV k="所在主机" v={selected.host} mono />
                  <KV k="心跳（演示）" v={heartbeatText(selected.heartbeatSec)} />
                  <KV k="累计完成任务" v={selected.completed.toLocaleString()} mono />
                  <KV k="成功率（演示）" v={`${selected.successRate}%`} mono />
                </div>

                <div className="space-y-2">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Cpu className="size-4" /> 能力</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.capabilities.map((c) => <Badge key={c} variant="signal">{c}</Badge>)}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">相关任务</h3>
                  {agentTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">暂无分配给该 Agent 的任务。</p>
                  ) : (
                    <ul className="divide-y rounded-md border">
                      {agentTasks.map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                          <span className="min-w-0 truncate"><span className="num mr-2 text-xs text-muted-foreground">{t.id}</span>{t.title}</span>
                          <StatusBadge meta={TASK_STATUS[t.status]} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">控制</h3>
                  <SafetyNotice>以下控制需要接入 Agent Runtime 后才能使用，当前仅为界面占位。</SafetyNotice>
                  <div className="flex flex-wrap gap-2">
                    <DemoActionButton locked>暂停 Agent</DemoActionButton>
                    <DemoActionButton locked>重启 Agent</DemoActionButton>
                    <DemoActionButton locked>调整配置</DemoActionButton>
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
