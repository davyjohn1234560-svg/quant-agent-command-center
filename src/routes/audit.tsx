import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Link2, Lock, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DemoBadge, EmptyState, KpiCard, ListSkeleton, PageHeader, SafetyNotice, Section, StatusBadge } from "@/components/app/common";
import { useDemo } from "@/lib/demo-store";
import { APPROVAL_STATUS, AUDIT_RESULT, RISK } from "@/lib/labels";
import { GENESIS_HASH, demoHash } from "@/lib/mock/audit";
import type { Approval, AuditEvent, RiskLevel } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "安全审计 · 量化与多智能体指挥中心" },
      { name: "description", content: "高风险操作审批队列、风险等级与仅追加的审计事件时间线。生产与破坏性操作不会执行。" },
      { property: "og:title", content: "安全审计 · 量化与多智能体指挥中心" },
      { property: "og:description", content: "审批队列与审计时间线（演示数据）。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditPage,
});

function verifyChain(log: AuditEvent[]) {
  let prev = GENESIS_HASH;
  for (const e of log) {
    if (e.prevHash !== prev) return false;
    const h = demoHash([e.seq, e.prevHash, e.at, e.actor, e.action, e.target, e.result].join("|"));
    if (h !== e.hash) return false;
    prev = e.hash;
  }
  return true;
}

function AuditPage() {
  const { approvals, audit, decideApproval, refreshing } = useDemo();
  const [risk, setRisk] = useState<"all" | RiskLevel>("all");
  const [confirm, setConfirm] = useState<{ ap: Approval; decision: "approved" | "rejected" } | null>(null);

  const pending = approvals.filter((a) => a.status === "pending");
  const events = [...audit].reverse().filter((e) => risk === "all" || e.risk === risk);
  const chainOk = verifyChain(audit);

  return (
    <>
      <PageHeader title="安全审计" description="高风险操作需人工审批。在本原型中，批准只会记录决定，绝不会执行任何生产或破坏性操作。" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="待审批" value={pending.length} tone={pending.length ? "warning" : "default"} />
        <KpiCard label="极高风险待审" value={pending.filter((a) => a.risk === "critical").length} tone="danger" />
        <KpiCard label="审计事件" value={audit.length} hint="仅追加，不可编辑" />
        <KpiCard label="哈希链校验（模拟）" value={chainOk ? "通过" : "异常"} tone={chainOk ? "success" : "danger"} icon={<Link2 />} />
      </div>

      <Section title="审批队列" description="操作执行通道未接入 · 批准不会执行" bodyClassName="p-0" actions={<DemoBadge />}>
        {refreshing ? (
          <div className="p-4"><ListSkeleton rows={5} /></div>
        ) : approvals.length === 0 ? (
          <EmptyState title="暂无审批请求" icon={<ShieldCheck />} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>操作</TableHead>
                <TableHead>环境</TableHead>
                <TableHead>风险</TableHead>
                <TableHead className="hidden md:table-cell">申请人</TableHead>
                <TableHead className="hidden lg:table-cell">时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">决定</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="max-w-[340px]">
                    <div className="truncate font-medium">{a.action}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.target} · {a.reason}</div>
                  </TableCell>
                  <TableCell><Badge variant={a.environment === "生产" ? "danger" : "muted"}>{a.environment}</Badge></TableCell>
                  <TableCell><StatusBadge meta={RISK[a.risk]} /></TableCell>
                  <TableCell className="hidden text-sm md:table-cell">{a.requestedBy}</TableCell>
                  <TableCell className="num hidden text-xs text-muted-foreground lg:table-cell">{a.createdAt}</TableCell>
                  <TableCell><StatusBadge meta={APPROVAL_STATUS[a.status]} /></TableCell>
                  <TableCell className="text-right">
                    {a.status === "pending" ? (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setConfirm({ ap: a, decision: "rejected" })}><X /> 拒绝</Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirm({ ap: a, decision: "approved" })}><Check /> 批准</Button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="size-3" /> 未执行</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <Section
        title="审计事件时间线"
        description="仅追加 · 每条记录包含前一条的哈希（模拟哈希链，非密码学保证）"
        actions={
          <Select value={risk} onValueChange={(v) => setRisk(v as typeof risk)}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部风险</SelectItem>
              {(Object.keys(RISK) as RiskLevel[]).map((r) => <SelectItem key={r} value={r}>{RISK[r].label}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      >
        {events.length === 0 ? (
          <EmptyState title="该风险等级下暂无事件" />
        ) : (
          <ol className="relative space-y-3 border-l pl-6">
            {events.map((e) => (
              <li key={e.hash} className="relative">
                <span
                  className={cn(
                    "absolute -left-[29px] top-3 size-2.5 rounded-full border-2 bg-background",
                    e.risk === "critical" ? "border-destructive" : e.risk === "high" ? "border-warning" : "border-primary",
                  )}
                />
                <div className="rounded-md border bg-panel p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num text-xs text-muted-foreground">#{String(e.seq).padStart(4, "0")}</span>
                    <span className="num text-xs text-muted-foreground">{e.at}</span>
                    <StatusBadge meta={RISK[e.risk]} />
                    <Badge variant={AUDIT_RESULT[e.result]} className="ml-auto">{e.result}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm"><span className="font-medium">{e.actor}</span> · {e.action}</p>
                  <p className="text-xs text-muted-foreground">对象：{e.target}</p>
                  <p className="num mt-2 truncate text-[10px] text-muted-foreground/80">
                    prev {e.prevHash} → hash {e.hash}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          {confirm && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{confirm.decision === "approved" ? "确认批准（演示）" : "确认拒绝"}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>
                      {confirm.ap.action} → <span className="num">{confirm.ap.target}</span>
                    </p>
                    <SafetyNotice>
                      {confirm.decision === "approved"
                        ? "批准仅记录决定并写入本地审计时间线。执行通道尚未接入，该操作不会被执行，状态将显示为「已批准 · 未执行」。"
                        : "拒绝将记录在本地审计时间线中。"}
                    </SafetyNotice>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>返回</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    decideApproval(confirm.ap.id, confirm.decision);
                    toast(confirm.decision === "approved" ? "已记录批准（未执行）" : "已记录拒绝", {
                      description: "审计事件已追加到本地时间线。",
                    });
                  }}
                >
                  {confirm.decision === "approved" ? "记录批准" : "记录拒绝"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
