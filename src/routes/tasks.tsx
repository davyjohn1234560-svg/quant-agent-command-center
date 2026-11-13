import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ListChecks, RotateCcw, Search, XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DemoActionButton,
  DemoBadge,
  EmptyState,
  KV,
  ListSkeleton,
  PageHeader,
  SafetyNotice,
  Section,
  StatusBadge,
} from "@/components/app/common";
import { canCancel, canRetry } from "@/lib/demo-state";
import { useDemo } from "@/lib/demo-store";
import { PRIORITY, TASK_STATUS } from "@/lib/labels";
import { AGENTS, agentById } from "@/lib/mock/agents";
import type { Priority, TaskStatus } from "@/lib/mock/types";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "任务中心 · 量化与多智能体指挥中心" },
      { name: "description", content: "任务队列、负责人、优先级、状态与交接历史；重试与取消为演示操作。" },
      { property: "og:title", content: "任务中心 · 量化与多智能体指挥中心" },
      { property: "og:description", content: "查看多智能体任务队列与交接历史（演示数据）。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

type Tab = "all" | TaskStatus;

function TasksPage() {
  const { tasks, retryTask, cancelTask, refreshing } = useDemo();
  const [tab, setTab] = useState<Tab>("all");
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [owner, setOwner] = useState("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  const list = tasks.filter(
    (t) =>
      (tab === "all" || t.status === tab) &&
      (priority === "all" || t.priority === priority) &&
      (owner === "all" || t.ownerId === owner) &&
      (q === "" || `${t.id}${t.title}`.toLowerCase().includes(q.toLowerCase())),
  );
  const n = (s: TaskStatus) => tasks.filter((t) => t.status === s).length;

  return (
    <>
      <PageHeader title="任务中心" description="任务队列与交接链路。重试 / 取消仅修改本页的模拟状态，不会发送到 Agent Runtime。" />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">全部 <span className="num ml-1.5 text-muted-foreground">{tasks.length}</span></TabsTrigger>
          {(Object.keys(TASK_STATUS) as TaskStatus[]).map((s) => (
            <TabsTrigger key={s} value={s}>
              {TASK_STATUS[s].label} <span className="num ml-1.5 text-muted-foreground">{n(s)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Section
        title="任务队列"
        description={`显示 ${list.length} 条`}
        bodyClassName="p-0"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索编号或标题" className="h-8 w-48 pl-8 text-xs" />
            </div>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                {(Object.keys(PRIORITY) as Priority[]).map((p) => <SelectItem key={p} value={p}>{PRIORITY[p].label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部负责人</SelectItem>
                {AGENTS.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {refreshing ? (
          <div className="p-4"><ListSkeleton rows={8} /></div>
        ) : list.length === 0 ? (
          <EmptyState title="没有符合条件的任务" hint="切换状态标签或清除筛选条件。" icon={<ListChecks />} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">编号</TableHead>
                <TableHead>任务</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="hidden w-36 md:table-cell">进度</TableHead>
                <TableHead className="hidden lg:table-cell">创建时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((t) => (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => setSelectedId(t.id)}>
                  <TableCell className="num text-xs text-muted-foreground">{t.id}</TableCell>
                  <TableCell className="max-w-[320px]">
                    <div className="truncate font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.category}</div>
                  </TableCell>
                  <TableCell className="text-sm">{agentById(t.ownerId)?.name}</TableCell>
                  <TableCell><StatusBadge meta={PRIORITY[t.priority]} /></TableCell>
                  <TableCell><StatusBadge meta={TASK_STATUS[t.status]} dot /></TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Progress value={t.progress} className="h-1.5" />
                      <span className="num w-9 text-right text-xs text-muted-foreground">{t.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="num hidden text-xs text-muted-foreground lg:table-cell">{t.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <span className="num text-xs text-muted-foreground">{selected.id}</span>
                  <StatusBadge meta={TASK_STATUS[selected.status]} dot />
                  <StatusBadge meta={PRIORITY[selected.priority]} />
                  <DemoBadge />
                </div>
                <SheetTitle className="text-lg leading-snug">{selected.title}</SheetTitle>
                <SheetDescription>分类：{selected.category} · 负责人：{agentById(selected.ownerId)?.name}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <KV k="创建时间" v={selected.createdAt} mono />
                  <KV k="最近更新" v={selected.updatedAt} mono />
                  <KV k="进度" v={`${selected.progress}%`} mono />
                  {selected.error && <KV k="错误信息" v={<span className="text-destructive">{selected.error}</span>} />}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">交接历史</h3>
                  {selected.handoffs.length === 0 ? (
                    <p className="text-xs text-muted-foreground">尚无交接记录，任务仍在等待分配。</p>
                  ) : (
                    <ol className="relative space-y-4 border-l pl-5">
                      {selected.handoffs.map((h, i) => (
                        <li key={i} className="relative">
                          <span className="absolute -left-[25px] top-1 size-2.5 rounded-full border-2 border-primary bg-background" />
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="font-medium">{h.from}</span>
                            <ArrowRight className="size-3.5 text-muted-foreground" />
                            <span className="font-medium">{h.to}</span>
                            <span className="num ml-auto text-xs text-muted-foreground">{h.at}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{h.note}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">操作</h3>
                  <SafetyNotice>演示操作 / 尚未接入：重试与取消只会改变本页的模拟状态并写入本地审计记录，不会影响任何真实任务。</SafetyNotice>
                  <div className="flex flex-wrap gap-2">
                    <DemoActionButton
                      disabled={!canRetry(selected)}
                      onLocal={() => retryTask(selected.id)}
                      notice={`已在本地将 ${selected.id} 重新排队（演示）`}
                    >
                      <RotateCcw /> 重试（演示）
                    </DemoActionButton>
                    <DemoActionButton
                      disabled={!canCancel(selected)}
                      onLocal={() => cancelTask(selected.id)}
                      notice={`已在本地取消 ${selected.id}（演示）`}
                    >
                      <XCircle /> 取消（演示）
                    </DemoActionButton>
                    <DemoActionButton locked>强制终止进程</DemoActionButton>
                  </div>
                  <p className="text-xs text-muted-foreground">仅「失败 / 已取消」可重试，仅「排队中 / 运行中」可取消。</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
