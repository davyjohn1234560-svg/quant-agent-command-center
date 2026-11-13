import type { BadgeProps } from "@/components/ui/badge";
import type {
  AgentStatus,
  Priority,
  ReportStatus,
  RiskLevel,
  ServiceStatus,
  Strategy,
  TaskStatus,
  Host,
  AuditResult,
  Approval,
} from "./mock/types";

type V = NonNullable<BadgeProps["variant"]>;
type Meta = { label: string; variant: V };

export const AGENT_STATUS: Record<AgentStatus, Meta> = {
  online: { label: "在线", variant: "success" },
  busy: { label: "执行中", variant: "signal" },
  idle: { label: "空闲", variant: "muted" },
  offline: { label: "离线", variant: "muted" },
  error: { label: "异常", variant: "danger" },
};

export const TASK_STATUS: Record<TaskStatus, Meta> = {
  queued: { label: "排队中", variant: "info" },
  running: { label: "运行中", variant: "signal" },
  succeeded: { label: "已完成", variant: "success" },
  failed: { label: "失败", variant: "danger" },
  cancelled: { label: "已取消", variant: "muted" },
};

export const PRIORITY: Record<Priority, Meta> = {
  P0: { label: "P0 紧急", variant: "danger" },
  P1: { label: "P1 高", variant: "warning" },
  P2: { label: "P2 中", variant: "info" },
  P3: { label: "P3 低", variant: "muted" },
};

export const REPORT_STATUS: Record<ReportStatus, Meta> = {
  published: { label: "已发布", variant: "success" },
  review: { label: "审阅中", variant: "warning" },
  draft: { label: "草稿", variant: "muted" },
};

export const STRATEGY_STATUS: Record<Strategy["status"], Meta> = {
  researching: { label: "研究中", variant: "info" },
  backtested: { label: "回测完成", variant: "success" },
  paused: { label: "已暂停", variant: "muted" },
};

export const RISK: Record<RiskLevel, Meta> = {
  low: { label: "低风险", variant: "muted" },
  medium: { label: "中风险", variant: "info" },
  high: { label: "高风险", variant: "warning" },
  critical: { label: "极高风险", variant: "danger" },
};

export const SERVICE_STATUS: Record<ServiceStatus, Meta> = {
  running: { label: "运行中", variant: "success" },
  stopped: { label: "已停止", variant: "muted" },
  restarting: { label: "重启中", variant: "warning" },
};

export const HOST_STATUS: Record<Host["status"], Meta> = {
  healthy: { label: "健康", variant: "success" },
  warning: { label: "需关注", variant: "warning" },
  critical: { label: "严重", variant: "danger" },
};

export const AUDIT_RESULT: Record<AuditResult, V> = {
  成功: "success",
  失败: "danger",
  已拒绝: "muted",
  已阻止执行: "warning",
  待审批: "info",
};

export const APPROVAL_STATUS: Record<Approval["status"], Meta> = {
  pending: { label: "待审批", variant: "info" },
  approved: { label: "已批准 · 未执行", variant: "warning" },
  rejected: { label: "已拒绝", variant: "muted" },
};

export const pct = (n: number, digits = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
