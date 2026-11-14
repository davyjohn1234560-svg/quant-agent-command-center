// All data in this app is local demo data. No field is ever sourced from a live system.

export type AgentStatus = "online" | "busy" | "idle" | "offline" | "error";

export interface Agent {
  id: string;
  name: string;
  codename: string;
  role: string;
  runtime: string;
  host: string;
  status: AgentStatus;
  currentTask: string | null;
  heartbeatSec: number | null;
  capabilities: string[];
  completed: number;
  successRate: number;
  description: string;
}

export type TaskStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type Priority = "P0" | "P1" | "P2" | "P3";

export interface Handoff {
  at: string;
  from: string;
  to: string;
  note: string;
}

export interface Task {
  id: string;
  title: string;
  ownerId: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  progress: number;
  category: string;
  error?: string | undefined;
  handoffs: Handoff[];
}

export type Market = "A股" | "美股";
export type ReportStatus = "published" | "review" | "draft";

export interface Report {
  id: string;
  title: string;
  market: Market;
  date: string;
  status: ReportStatus;
  authorId: string;
  summary: string;
  tags: string[];
  tickers: string[];
  sections: { heading: string; body: string }[];
}

export interface EquityPoint {
  t: string;
  strategy: number;
  benchmark: number;
}

export interface StrategyMetrics {
  totalReturn: number;
  annualReturn: number;
  benchmarkReturn: number;
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  volatility: number;
  trades: number;
}

export interface Strategy {
  id: string;
  name: string;
  type: string;
  market: Market;
  status: "researching" | "backtested" | "paused";
  period: string;
  frequency: string;
  description: string;
  params: { label: string; value: string }[];
  curve: EquityPoint[];
  metrics: StrategyMetrics;
}

export type ServiceStatus = "running" | "stopped" | "restarting";

export interface HostService {
  name: string;
  kind: "docker" | "systemd";
  status: ServiceStatus;
  detail: string;
}

export interface Host {
  id: string;
  hostname: string;
  address: string;
  os: string;
  role: string;
  status: "healthy" | "warning" | "critical";
  cpu: number;
  memory: number;
  memoryTotalGb: number;
  disk: number;
  diskTotalGb: number;
  load: [number, number, number];
  uptime: string;
  services: HostService[];
  logs: { at: string; level: "INFO" | "WARN" | "ERROR"; message: string }[];
}

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type Environment = "生产" | "预发" | "研究";

export interface Approval {
  id: string;
  action: string;
  target: string;
  requestedBy: string;
  environment: Environment;
  risk: RiskLevel;
  reason: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  /** Always false in this prototype: approved actions are never executed. */
  executed: false;
}

export type AuditResult = "成功" | "失败" | "已拒绝" | "已阻止执行" | "待审批";

export interface AuditEvent {
  id: string;
  seq: number;
  at: string;
  actor: string;
  action: string;
  target: string;
  risk: RiskLevel;
  result: AuditResult;
  prevHash: string;
  hash: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: "未连接" | "待配置";
  connected: false;
  requirements: string[];
  scope: string;
}
