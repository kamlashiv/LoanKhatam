import { useState } from "react";
import { ExternalLink, X, AlertTriangle } from "lucide-react";

function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

const DISMISS_KEY = "frame-preview-banner-dismissed";

function wasDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function FramePreviewBanner() {
  const [dismissed, setDismissed] = useState(wasDismissed);

  if (dismissed || !inIframe()) {
    return null;
  }

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore storage failures */
    }
    setDismissed(true);
  };

  const openInNewTab = () => {
    window.open(window.location.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/80 dark:text-amber-100">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p className="min-w-0 flex-1 leading-snug">
        <span className="font-semibold">You're viewing this inside a preview frame.</span>{" "}
        Sign-in and saving (like creating a loan) won't work here. Open the app in
        its own browser tab to use it fully.
      </p>
      <button
        type="button"
        onClick={openInNewTab}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-amber-700"
      >
        <ExternalLink className="h-4 w-4" />
        Open in new tab
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss preview warning"
        className="shrink-0 rounded-md p-1 text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
