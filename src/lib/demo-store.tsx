import { createContext, useCallback, useContext, useMemo, useReducer, useState, type ReactNode } from "react";

import { demoReducer, initialDemoState, nowStamp, type DemoState } from "./demo-state";

interface DemoStore extends DemoState {
  retryTask: (id: string) => void;
  cancelTask: (id: string) => void;
  decideApproval: (id: string, decision: "approved" | "rejected") => void;
  reset: () => void;
  refreshing: boolean;
  refresh: () => void;
}

const Ctx = createContext<DemoStore | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialDemoState);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 700);
  }, []);

  const value = useMemo<DemoStore>(
    () => ({
      ...state,
      refreshing,
      refresh,
      retryTask: (id) => dispatch({ type: "task/retry", id, at: nowStamp() }),
      cancelTask: (id) => dispatch({ type: "task/cancel", id, at: nowStamp() }),
      decideApproval: (id, decision) =>
        dispatch({ type: "approval/decide", id, decision, at: nowStamp() }),
      reset: () => dispatch({ type: "reset" }),
    }),
    [state, refreshing, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemo must be used inside DemoProvider");
  return v;
}
