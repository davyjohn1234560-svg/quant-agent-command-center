import type { EquityPoint, Market, Strategy, StrategyMetrics } from "./types";

// Deterministic PRNG so SSR and client render identical simulated curves.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEEKS = 104;
const START = Date.UTC(2024, 10, 15);

export function simulateCurve(seed: number, drift: number, vol: number): EquityPoint[] {
  const rand = mulberry32(seed);
  const benchRand = mulberry32(seed * 7 + 3);
  let s = 1;
  let b = 1;
  const points: EquityPoint[] = [];
  for (let i = 0; i <= WEEKS; i++) {
    const d = new Date(START + i * 7 * 86400000);
    points.push({
      t: d.toISOString().slice(0, 10),
      strategy: Number(s.toFixed(4)),
      benchmark: Number(b.toFixed(4)),
    });
    s *= 1 + drift + (rand() - 0.5) * 2 * vol;
    b *= 1 + 0.0012 + (benchRand() - 0.5) * 2 * 0.022;
  }
  return points;
}

export function computeMetrics(curve: EquityPoint[], seed: number): StrategyMetrics {
  const rets: number[] = [];
  for (let i = 1; i < curve.length; i++) {
    const cur = curve[i];
    const prev = curve[i - 1];
    if (cur && prev) rets.push(cur.strategy / prev.strategy - 1);
  }
  const mean = rets.reduce((a, r) => a + r, 0) / rets.length;
  const sd = Math.sqrt(rets.reduce((a, r) => a + (r - mean) ** 2, 0) / rets.length);
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (!first || !last || rets.length === 0) throw new Error("computeMetrics: curve needs at least 2 points");
  let peak = first.strategy;
  let mdd = 0;
  for (const p of curve) {
    peak = Math.max(peak, p.strategy);
    mdd = Math.min(mdd, p.strategy / peak - 1);
  }
  const years = (curve.length - 1) / 52;
  const rand = mulberry32(seed + 99);
  return {
    totalReturn: (last.strategy - 1) * 100,
    annualReturn: (Math.pow(last.strategy, 1 / years) - 1) * 100,
    benchmarkReturn: (last.benchmark - 1) * 100,
    sharpe: sd === 0 ? 0 : ((mean - 0.0004) / sd) * Math.sqrt(52),
    maxDrawdown: mdd * 100,
    winRate: (rets.filter((r) => r > 0).length / rets.length) * 100,
    volatility: sd * Math.sqrt(52) * 100,
    trades: Math.round(180 + rand() * 900),
  };
}

function make(
  base: Omit<Strategy, "curve" | "metrics">,
  seed: number,
  drift: number,
  vol: number,
): Strategy {
  const curve = simulateCurve(seed, drift, vol);
  return { ...base, curve, metrics: computeMetrics(curve, seed) };
}

const m = (x: Market) => x;

export const STRATEGIES: Strategy[] = [
  make(
    {
      id: "S-01",
      name: "多因子选股 v3",
      type: "多因子",
      market: m("A股"),
      status: "backtested",
      period: "2024-11 至 2026-11（模拟）",
      frequency: "周频调仓",
      description: "价值、质量、动量三类因子等权合成，行业中性约束。仅为回测框架演示。",
      params: [
        { label: "持仓数量", value: "50" },
        { label: "调仓频率", value: "每周" },
        { label: "手续费假设", value: "万 2.5（模拟）" },
        { label: "滑点假设", value: "0.1%（模拟）" },
      ],
    },
    11,
    0.0034,
    0.028,
  ),
  make(
    {
      id: "S-02",
      name: "双均线趋势跟踪",
      type: "趋势",
      market: m("A股"),
      status: "backtested",
      period: "2024-11 至 2026-11（模拟）",
      frequency: "日频信号",
      description: "20/60 日均线交叉产生信号，指数 ETF 层面执行（模拟）。",
      params: [
        { label: "快线", value: "20 日" },
        { label: "慢线", value: "60 日" },
        { label: "止损", value: "8%" },
      ],
    },
    23,
    0.0021,
    0.031,
  ),
  make(
    {
      id: "S-03",
      name: "配对均值回归",
      type: "统计套利",
      market: m("美股"),
      status: "researching",
      period: "2024-11 至 2026-11（模拟）",
      frequency: "日频",
      description: "协整检验筛选同行业股票对，价差偏离 2σ 入场（模拟）。",
      params: [
        { label: "入场阈值", value: "2.0σ" },
        { label: "出场阈值", value: "0.5σ" },
        { label: "回看窗口", value: "120 日" },
      ],
    },
    37,
    0.0016,
    0.014,
  ),
  make(
    {
      id: "S-04",
      name: "行业轮动（景气度）",
      type: "轮动",
      market: m("A股"),
      status: "paused",
      period: "2024-11 至 2026-11（模拟）",
      frequency: "月频调仓",
      description: "基于景气度打分选取前 5 个行业等权配置。样本外检验任务失败，暂停中。",
      params: [
        { label: "行业数", value: "5" },
        { label: "调仓频率", value: "每月" },
      ],
    },
    41,
    0.0009,
    0.034,
  ),
  make(
    {
      id: "S-05",
      name: "波动率择时",
      type: "择时",
      market: m("美股"),
      status: "backtested",
      period: "2024-11 至 2026-11（模拟）",
      frequency: "日频",
      description: "根据隐含波动率分位调整指数敞口（模拟），高波动时降低仓位。",
      params: [
        { label: "高波动阈值", value: "80 分位" },
        { label: "最低仓位", value: "30%" },
      ],
    },
    59,
    0.0026,
    0.018,
  ),
];
