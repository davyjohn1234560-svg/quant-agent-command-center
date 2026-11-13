import type { ReactNode } from "react";
import { FlaskConical, Inbox, Lock, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export function DemoBadge({ label = "演示数据", className }: { label?: string; className?: string }) {
  return (
    <Badge variant="demo" className={className}>
      <FlaskConical className="size-3" />
      {label}
    </Badge>
  );
}

export function StatusBadge({ meta, dot }: { meta: { label: string; variant: BadgeProps["variant"] }; dot?: boolean }) {
  return (
    <Badge variant={meta.variant}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {meta.label}
    </Badge>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const { refresh, refreshing } = useDemo();
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <DemoBadge />
        </div>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
          <RefreshCw className={cn(refreshing && "animate-spin")} />
          刷新演示数据
        </Button>
      </div>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "signal" | "success" | "warning" | "danger";
}) {
  const { refreshing } = useDemo();
  const toneCls = {
    default: "text-foreground",
    signal: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  }[tone];
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="text-muted-foreground/70 [&_svg]:size-4">{icon}</span>
      </div>
      {refreshing ? (
        <Skeleton className="mt-3 h-7 w-20" />
      ) : (
        <div className={cn("num mt-2 text-2xl font-semibold", toneCls)}>{value}</div>
      )}
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("panel flex flex-col", className)}>
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </header>
      <div className={cn("flex-1 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="grid size-10 place-items-center rounded-full border bg-muted text-muted-foreground [&_svg]:size-5">
        {icon ?? <Inbox />}
      </div>
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

/**
 * Button for an action that would touch a real system. It only shows a notice
 * (or runs a local-state callback) — it never calls any external system.
 */
export function DemoActionButton({
  children,
  onLocal,
  locked,
  notice,
  ...props
}: ButtonProps & { onLocal?: () => void; locked?: boolean; notice?: string }) {
  const tip = locked ? "生产操作已锁定 · 尚未接入" : "演示操作 · 仅修改本地模拟状态";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            size="sm"
            variant="outline"
            {...props}
            disabled={locked || props.disabled}
            onClick={() => {
              onLocal?.();
              toast(notice ?? "演示操作已记录", { description: "未调用任何真实系统，数据仅保存在本页内存中。" });
            }}
          >
            {locked ? <Lock /> : null}
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}

export function SafetyNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-md border border-demo/30 bg-demo/5 px-3 py-2.5 text-xs text-demo", className)}>
      <ShieldAlert className="mt-px size-4 shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function Meter({ value, warnAt = 75, dangerAt = 90 }: { value: number; warnAt?: number; dangerAt?: number }) {
  const tone = value >= dangerAt ? "bg-destructive" : value >= warnAt ? "bg-warning" : "bg-primary";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${value}%` }} />
    </div>
  );
}

export function KV({ k, v, mono }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("text-right", mono && "num")}>{v}</span>
    </div>
  );
}
