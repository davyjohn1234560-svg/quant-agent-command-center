import { APPROVALS, AUDIT_EVENTS, appendAuditEvent } from "./mock/audit";
import { TASKS } from "./mock/tasks";
import type { Approval, AuditEvent, Task } from "./mock/types";

/**
 * Local-only demo state. Every action here only rewrites in-memory mock data;
 * nothing is sent to an Agent Runtime, host, repository, or broker.
 */
export interface DemoState {
  tasks: Task[];
  approvals: Approval[];
  audit: AuditEvent[];
}

export type DemoAction =
  | { type: "task/retry"; id: string; at: string }
  | { type: "task/cancel"; id: string; at: string }
  | { type: "approval/decide"; id: string; decision: "approved" | "rejected"; at: string }
  | { type: "reset" };

export const OPERATOR = "操作员（演示）";

export const initialDemoState = (): DemoState => ({
  tasks: TASKS,
  approvals: APPROVALS,
  audit: AUDIT_EVENTS,
});

export const canRetry = (t: Task) => t.status === "failed" || t.status === "cancelled";
export const canCancel = (t: Task) => t.status === "queued" || t.status === "running";

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "reset":
      return initialDemoState();

    case "task/retry": {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task || !canRetry(task)) return state;
      const time = action.at.slice(11, 16);
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: "queued",
                progress: 0,
                error: undefined,
                updatedAt: action.at,
                handoffs: [
                  ...t.handoffs,
                  { at: time, from: OPERATOR, to: "总控调度", note: "演示重试：仅本地重新排队" },
                ],
              }
            : t,
        ),
        audit: appendAuditEvent(state.audit, {
          id: `E-L${state.audit.length + 1}`,
          at: action.at,
          actor: OPERATOR,
          action: "演示重试任务（本地状态）",
          target: task.id,
          risk: "low",
          result: "成功",
        }),
      };
    }

    case "task/cancel": {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task || !canCancel(task)) return state;
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === task.id ? { ...t, status: "cancelled", updatedAt: action.at } : t,
        ),
        audit: appendAuditEvent(state.audit, {
          id: `E-L${state.audit.length + 1}`,
          at: action.at,
          actor: OPERATOR,
          action: "演示取消任务（本地状态）",
          target: task.id,
          risk: "low",
          result: "成功",
        }),
      };
    }

    case "approval/decide": {
      const ap = state.approvals.find((a) => a.id === action.id);
      if (!ap || ap.status !== "pending") return state;
      const approved = action.decision === "approved";
      return {
        ...state,
        approvals: state.approvals.map((a) =>
          // executed stays false: approval never triggers execution in this prototype.
          a.id === ap.id ? { ...a, status: action.decision, executed: false } : a,
        ),
        audit: appendAuditEvent(state.audit, {
          id: `E-L${state.audit.length + 1}`,
          at: action.at,
          actor: OPERATOR,
          action: approved ? `批准（演示）：${ap.action}` : `拒绝：${ap.action}`,
          target: ap.target,
          risk: ap.risk,
          result: approved ? "已阻止执行" : "已拒绝",
        }),
      };
    }
  }
}

export function nowStamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
