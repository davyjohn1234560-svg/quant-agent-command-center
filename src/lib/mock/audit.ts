import type { Approval, AuditEvent, Integration } from "./types";

/** Simulated hash (FNV-1a based) for the demo hash chain. Not a cryptographic guarantee. */
export function demoHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i), 0x01000193) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

export const GENESIS_HASH = "0000000000000000";

type EventInput = Omit<AuditEvent, "seq" | "prevHash" | "hash">;

export function appendAuditEvent(log: AuditEvent[], input: EventInput): AuditEvent[] {
  const prev = log[log.length - 1];
  const seq = prev ? prev.seq + 1 : 1;
  const prevHash = prev ? prev.hash : GENESIS_HASH;
  const hash = demoHash(
    [seq, prevHash, input.at, input.actor, input.action, input.target, input.result].join("|"),
  );
  return [...log, { ...input, seq, prevHash, hash }];
}

const SEED_EVENTS: EventInput[] = [
  { id: "E-001", at: "2026-11-13 08:00:02", actor: "运维巡检", action: "只读巡检全部主机", target: "4 台主机", risk: "low", result: "成功" },
  { id: "E-002", at: "2026-11-13 09:48:10", actor: "报告撰写", action: "任务失败上报", target: "T-2044", risk: "low", result: "失败" },
  { id: "E-003", at: "2026-11-13 10:05:44", actor: "操作员（演示）", action: "创建研究任务", target: "T-2047", risk: "low", result: "成功" },
  { id: "E-004", at: "2026-11-13 11:20:31", actor: "量化研究员", action: "请求写入 GitHub 仓库 quant-core", target: "branch: feature/slippage", risk: "high", result: "已阻止执行" },
  { id: "E-005", at: "2026-11-13 12:02:17", actor: "代码审阅", action: "请求合并 PR #128 到 main", target: "quant-core", risk: "medium", result: "待审批" },
  { id: "E-006", at: "2026-11-13 13:15:09", actor: "运维巡检", action: "请求 SSH 重启 docker 服务", target: "quant-node-01", risk: "high", result: "待审批" },
  { id: "E-007", at: "2026-11-13 13:58:40", actor: "量化研究员", action: "请求启用实盘下单接口", target: "broker-gateway", risk: "critical", result: "待审批" },
  { id: "E-008", at: "2026-11-13 14:20:03", actor: "操作员（演示）", action: "拒绝删除研究库快照", target: "postgres-research", risk: "high", result: "已拒绝" },
  { id: "E-009", at: "2026-11-13 14:52:11", actor: "操作员（演示）", action: "提交生产升级申请", target: "agent-runtime v2.4.0", risk: "critical", result: "待审批" },
  { id: "E-010", at: "2026-11-13 15:01:00", actor: "数据管道", action: "研究库批次校验", target: "cn_daily_2026-11-13", risk: "low", result: "成功" },
];

export const AUDIT_EVENTS: AuditEvent[] = SEED_EVENTS.reduce<AuditEvent[]>(
  (log, e) => appendAuditEvent(log, e),
  [],
);

export const APPROVALS: Approval[] = [
  {
    id: "A-301",
    action: "部署 agent-runtime v2.4.0 到生产",
    target: "agent-node-01 / agent-node-02",
    requestedBy: "操作员（演示）",
    environment: "生产",
    risk: "critical",
    reason: "修复队列延迟问题，需滚动升级全部 worker。",
    createdAt: "2026-11-13 14:52",
    status: "pending",
    executed: false,
  },
  {
    id: "A-300",
    action: "启用实盘下单接口",
    target: "broker-gateway",
    requestedBy: "量化研究员",
    environment: "生产",
    risk: "critical",
    reason: "多因子 v3 回测完成，申请小资金试运行。本原型不支持任何真实交易。",
    createdAt: "2026-11-13 13:58",
    status: "pending",
    executed: false,
  },
  {
    id: "A-299",
    action: "SSH 重启 docker 服务",
    target: "quant-node-01",
    requestedBy: "运维巡检",
    environment: "研究",
    risk: "high",
    reason: "backtest-engine 内存占用持续升高。",
    createdAt: "2026-11-13 13:15",
    status: "pending",
    executed: false,
  },
  {
    id: "A-298",
    action: "合并 PR #128 到 main",
    target: "GitHub · quant-core",
    requestedBy: "代码审阅",
    environment: "预发",
    risk: "medium",
    reason: "滑点模型参数化，已通过单元测试（演示）。",
    createdAt: "2026-11-13 12:02",
    status: "pending",
    executed: false,
  },
  {
    id: "A-297",
    action: "删除研究库历史快照",
    target: "postgres-research",
    requestedBy: "数据管道",
    environment: "研究",
    risk: "high",
    reason: "释放磁盘空间。",
    createdAt: "2026-11-13 14:10",
    status: "rejected",
    executed: false,
  },
];

export const INTEGRATIONS: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "读取仓库、PR 与 CI 状态。",
    status: "未连接",
    connected: false,
    requirements: ["只读访问权限的 GitHub App", "仓库白名单", "服务端密钥存储（不放在前端）"],
    scope: "计划仅只读：仓库元数据、PR 列表、CI 结果",
  },
  {
    id: "ssh",
    name: "Linux / SSH",
    description: "主机指标与服务状态采集。",
    status: "待配置",
    connected: false,
    requirements: ["只读监控代理或指标端点", "堡垒机 / 跳板策略", "命令白名单与人工审批"],
    scope: "计划仅只读：CPU、内存、磁盘、容器状态、日志片段",
  },
  {
    id: "runtime",
    name: "Agent Runtime",
    description: "Agent 状态、心跳、任务队列与交接记录。",
    status: "待配置",
    connected: false,
    requirements: ["Runtime 只读状态 API", "事件订阅端点", "服务端鉴权"],
    scope: "计划只读接入；控制类操作需单独评审",
  },
  {
    id: "market",
    name: "行情数据",
    description: "A股 / 美股行情与基础数据。",
    status: "未连接",
    connected: false,
    requirements: ["数据供应商授权", "服务端代理", "数据使用合规确认"],
    scope: "计划仅用于研究展示，不用于下单",
  },
  {
    id: "database",
    name: "数据库",
    description: "报告、策略与审计记录持久化。",
    status: "未连接",
    connected: false,
    requirements: ["数据库实例", "访问策略与备份", "审计表追加写入约束"],
    scope: "当前所有数据仅保存在浏览器内存，刷新即重置",
  },
];
