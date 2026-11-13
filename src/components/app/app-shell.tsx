import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  FileText,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Lock,
  Radar,
  Server,
  Settings,
  ShieldCheck,
  Unplug,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useDemo } from "@/lib/demo-store";
import { INTEGRATIONS } from "@/lib/mock/audit";
import { DemoBadge } from "./common";

const GROUPS = [
  {
    label: "运营",
    items: [
      { title: "总览", url: "/", icon: LayoutDashboard },
      { title: "Agent 管理", url: "/agents", icon: Bot },
      { title: "任务中心", url: "/tasks", icon: ListChecks, badge: "tasks" as const },
    ],
  },
  {
    label: "研究",
    items: [
      { title: "研究报告", url: "/reports", icon: FileText },
      { title: "策略研究", url: "/strategies", icon: LineChart },
    ],
  },
  {
    label: "平台",
    items: [
      { title: "基础设施", url: "/infrastructure", icon: Server },
      { title: "安全审计", url: "/audit", icon: ShieldCheck, badge: "approvals" as const },
      { title: "系统设置", url: "/settings", icon: Settings },
    ],
  },
] as const;

function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { tasks, approvals } = useDemo();
  const counts = {
    tasks: tasks.filter((t) => t.status === "failed").length,
    approvals: approvals.filter((a) => a.status === "pending").length,
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary">
            <Radar className="size-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold leading-tight">量化与多智能体指挥中心</div>
            <div className="truncate text-[11px] text-muted-foreground">AI Quant & Agent Command Center</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {GROUPS.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = item.url === "/" ? path === "/" : path.startsWith(item.url);
                  const badge = "badge" in item ? counts[item.badge] : 0;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {badge > 0 && (
                        <SidebarMenuBadge className="num text-warning">{badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
        <div className="space-y-1 px-1 text-[11px] leading-relaxed text-muted-foreground">
          <div className="font-medium text-sidebar-foreground">MVP 原型 · v0.1</div>
          <div>全部数据为本地演示数据，刷新页面即重置。</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function TopBar() {
  const connected = INTEGRATIONS.filter((i) => i.connected).length;
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b bg-background/85 px-3 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto text-xs">
        <DemoBadge label="演示模式" />
        <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-muted-foreground md:inline-flex">
          <Activity className="size-3" /> 数据源：本地模拟数据
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-muted-foreground">
          <Unplug className="size-3" /> 集成 <span className="num">{connected}/{INTEGRATIONS.length}</span> 已连接
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-success/30 bg-success/5 px-2 py-0.5 text-success">
          <Lock className="size-3" /> 安全锁：生产操作已禁用
        </span>
      </div>
      <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
        <span className="grid size-7 place-items-center rounded-full border bg-muted text-[11px] font-medium text-foreground">
          操
        </span>
        <span>操作员（演示账户）</span>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-transparent">
          <TopBar />
          <div className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
