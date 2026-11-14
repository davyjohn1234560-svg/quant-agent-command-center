import { describe, expect, it } from "vitest";

import { canCancel, canRetry, demoReducer, initialDemoState } from "@/lib/demo-state";
import { TASKS } from "@/lib/mock/tasks";

const AT = "2026-11-13 15:30:00";
const byId = (id: string) => TASKS.find((t) => t.id === id);

describe("US-stock task consolidation", () => {
  it("keeps the A-share weekly plan as its own active task", () => {
    const plan = byId("T-2051")!;
    expect(plan.status).toBe("running");
    expect(plan.mergedInto).toBeUndefined();
    expect(plan.title).toContain("A 股");
    expect(plan.title).not.toContain("美股");
    expect(plan.originalTitle).toBe("拆解：本周 A 股 / 美股研究计划");
    expect(byId("T-2047")?.status).toBe("running");
  });

  it("merges T-2049, T-2054 and the US part of T-2051 into one task", () => {
    const us = byId("T-2056")!;
    expect(us.ownerId).toBe("ag-us");
    expect(us.mergeSources?.map((m) => [m.id, m.coverage])).toEqual([
      ["T-2049", "全部"],
      ["T-2054", "全部"],
      ["T-2051", "部分"],
    ]);
  });

  it("archives merged sources instead of deleting them", () => {
    for (const id of ["T-2049", "T-2054"]) {
      const t = byId(id)!;
      expect(t.status).toBe("merged");
      expect(t.mergedInto).toBe("T-2056");
    }
    expect(byId("T-2049")?.statusBeforeMerge).toBe("running");
    expect(byId("T-2054")?.statusBeforeMerge).toBe("queued");
  });

  it("merged tasks can be neither retried nor cancelled", () => {
    const s0 = initialDemoState();
    for (const id of ["T-2049", "T-2054"]) {
      const t = s0.tasks.find((x) => x.id === id)!;
      expect(canRetry(t)).toBe(false);
      expect(canCancel(t)).toBe(false);
      expect(demoReducer(s0, { type: "task/retry", id, at: AT })).toBe(s0);
      expect(demoReducer(s0, { type: "task/cancel", id, at: AT })).toBe(s0);
    }
  });

  it("keeps the completed T-2038 report as untouched history", () => {
    const t = byId("T-2038")!;
    expect(t.status).toBe("succeeded");
    expect(t.title).toBe("报告：美股消费板块季度回顾");
    expect(t.progress).toBe(100);
    expect(t.mergedInto).toBeUndefined();
  });
});

describe("Git repository review task", () => {
  const git = byId("T-2057")!;

  it("is high priority and has not started", () => {
    expect(git.priority).toBe("P1");
    expect(git.status).toBe("queued");
    expect(git.progress).toBe(0);
    expect(git.handoffs).toHaveLength(0);
  });

  it("targets an unbound, unconfirmed repository", () => {
    expect(git.target?.bound).toBe(false);
    expect(git.target?.label).toContain("待绑定");
  });

  it("is read-only and never touches secrets", () => {
    const rules = git.boundaries!.join("\n");
    for (const phrase of ["不修改代码", "不格式化", "不自动修复", "不删除文件", "不切换分支", "不覆盖用户", "不提交、不推送", "不暴露值"]) {
      expect(rules).toContain(phrase);
    }
  });

  it("lists the expected deliverables, none produced yet", () => {
    expect(git.deliverables?.map((d) => d.name)).toEqual([
      "AUDIT_REPORT.md",
      "SECURITY_REPORT.md",
      "测试与验证记录",
      "风险分级与后续修复计划",
    ]);
    expect(git.deliverables?.every((d) => d.produced === false)).toBe(true);
  });
});
