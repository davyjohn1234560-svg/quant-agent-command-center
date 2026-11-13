import { describe, expect, it } from "vitest";

import { demoReducer, initialDemoState } from "@/lib/demo-state";
import { INTEGRATIONS } from "@/lib/mock/audit";

const AT = "2026-11-13 15:30:00";

describe("demo safety rules", () => {
  it("every integration starts as 未连接 or 待配置 and is not connected", () => {
    for (const i of INTEGRATIONS) {
      expect(["未连接", "待配置"]).toContain(i.status);
      expect(i.connected).toBe(false);
    }
  });

  it("approving a critical production action records it but never executes it", () => {
    const s0 = initialDemoState();
    const target = s0.approvals.find((a) => a.environment === "生产" && a.risk === "critical")!;
    const s1 = demoReducer(s0, { type: "approval/decide", id: target.id, decision: "approved", at: AT });
    const after = s1.approvals.find((a) => a.id === target.id)!;
    expect(after.status).toBe("approved");
    expect(after.executed).toBe(false);
    expect(s1.audit.at(-1)?.result).toBe("已阻止执行");
  });

  it("retry only applies to failed or cancelled tasks", () => {
    const s0 = initialDemoState();
    const running = s0.tasks.find((t) => t.status === "running")!;
    const failed = s0.tasks.find((t) => t.status === "failed")!;
    expect(demoReducer(s0, { type: "task/retry", id: running.id, at: AT })).toBe(s0);
    const s1 = demoReducer(s0, { type: "task/retry", id: failed.id, at: AT });
    expect(s1.tasks.find((t) => t.id === failed.id)?.status).toBe("queued");
  });

  it("cancel only applies to queued or running tasks", () => {
    const s0 = initialDemoState();
    const done = s0.tasks.find((t) => t.status === "succeeded")!;
    const queued = s0.tasks.find((t) => t.status === "queued")!;
    expect(demoReducer(s0, { type: "task/cancel", id: done.id, at: AT })).toBe(s0);
    const s1 = demoReducer(s0, { type: "task/cancel", id: queued.id, at: AT });
    expect(s1.tasks.find((t) => t.id === queued.id)?.status).toBe("cancelled");
  });

  it("audit log is append-only and hash-chained", () => {
    const s0 = initialDemoState();
    const failed = s0.tasks.find((t) => t.status === "failed")!;
    const s1 = demoReducer(s0, { type: "task/retry", id: failed.id, at: AT });
    expect(s1.audit).toHaveLength(s0.audit.length + 1);
    expect(s1.audit.slice(0, s0.audit.length)).toEqual(s0.audit);
    expect(s1.audit.at(-1)?.prevHash).toBe(s0.audit.at(-1)?.hash);
  });
});
