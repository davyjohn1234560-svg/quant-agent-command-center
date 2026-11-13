import { createFileRoute } from "@tanstack/react-router";
import { Database, GitBranch, LineChart, Plug, RotateCcw, Server, Workflow } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DemoActionButton, KV, PageHeader, SafetyNotice, Section } from "@/components/app/common";
import { useDemo } from "@/lib/demo-store";
import { INTEGRATIONS } from "@/lib/mock/audit";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "系统设置 · 量化与多智能体指挥中心" },
      { name: "description", content: "GitHub、Linux/SSH、Agent Runtime、行情数据与数据库的集成状态占位，当前均未连接。" },
      { property: "og:title", content: "系统设置 · 量化与多智能体指挥中心" },
      { property: "og:description", content: "集成状态占位：全部未连接 / 待配置。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const ICONS = { github: GitBranch, ssh: Server, runtime: Workflow, market: LineChart, database: Database } as const;

function SettingsPage() {
  const { reset } = useDemo();

  return (
    <>
      <PageHeader title="系统设置" description="集成状态与安全策略。在有意完成真实配置之前，所有集成均保持「未连接 / 待配置」。" />

      <SafetyNotice>
        本页不收集、不保存任何密钥、令牌、凭证或私钥。真实接入时，凭证应仅存放在服务端密钥管理中，并默认使用只读权限。
      </SafetyNotice>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((i) => {
          const Icon = ICONS[i.id as keyof typeof ICONS] ?? Plug;
          return (
            <article key={i.id} className="panel flex flex-col p-4">
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-md border bg-muted text-muted-foreground"><Icon className="size-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{i.name}</h3>
                    <Badge variant={i.status === "未连接" ? "muted" : "warning"} className="ml-auto">
                      <span className="size-1.5 rounded-full bg-current" />
                      {i.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{i.description}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="text-xs text-muted-foreground">接入前需要</div>
                <ul className="space-y-1 text-sm">
                  {i.requirements.map((r) => (
                    <li key={r} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />{r}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">{i.scope}</p>
              <div className="mt-auto pt-4">
                <DemoActionButton locked className="w-full">配置连接 · 尚未接入</DemoActionButton>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="安全策略" description="当前原型的固定策略，不可在界面中关闭">
          {[
            ["禁止真实交易与下单", "所有下单、调仓、实盘部署按钮均锁定"],
            ["禁止 Shell / SSH 执行", "主机页面只展示演示读数"],
            ["禁止仓库写入与部署", "GitHub 相关操作均为占位"],
            ["高风险操作需人工审批", "批准后也不会执行，仅记录"],
          ].map(([k, d]) => (
            <div key={k} className="flex items-center justify-between gap-4 border-b border-dashed py-3 last:border-0">
              <div>
                <div className="text-sm font-medium">{k}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
              <Switch checked disabled aria-label={k} />
            </div>
          ))}
        </Section>

        <Section title="演示环境">
          <KV k="数据模式" v={<Badge variant="demo">演示数据</Badge>} />
          <KV k="数据存储" v="浏览器内存（刷新即重置）" />
          <KV k="已连接集成" v={`${INTEGRATIONS.filter((i) => i.connected).length} / ${INTEGRATIONS.length}`} mono />
          <KV k="版本" v="MVP 原型 v0.1" />
          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset();
                toast("演示数据已重置", { description: "任务、审批与审计记录已恢复为初始示例。" });
              }}
            >
              <RotateCcw /> 重置演示数据
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
