import { ReactNode } from "react";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

export function ScreenHeader({
  title,
  subtitle,
  action,
  onBack,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onBack?: () => void;
}) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.length > 1 ? window.history.back() : navigate("/home");
  };

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 bg-background/85 px-5 py-4 backdrop-blur-md">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors active:bg-muted"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
