import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  className?: string;
}

export function EmptyState({ icon, message, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground', className)}>
      {icon && <div className="text-4xl opacity-50">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  );
}
