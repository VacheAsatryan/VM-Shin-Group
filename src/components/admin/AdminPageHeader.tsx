import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function AdminPageHeader({
  title,
  subtitle,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold-border/30">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-black text-text-primary uppercase tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-text-secondary font-medium">{subtitle}</p>
        )}
      </div>

      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
