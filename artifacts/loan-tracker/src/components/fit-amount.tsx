import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatRupees, rupeesToWords } from "@/lib/loan-utils";

interface FitAmountProps {
  value: number;
  /** Styling for the amount text (color / weight). Font size is controlled internally. */
  className?: string;
  /** Largest font size in px the amount is allowed to use. */
  maxFontSize?: number;
  /** Smallest font size in px the amount will shrink to before clipping. */
  minFontSize?: number;
  /** Show the amount spelled out in Indian-system words below the figure. */
  showWords?: boolean;
  wordsClassName?: string;
}

/**
 * Renders a rupee amount whose font size automatically shrinks to fit its
 * container width, so long amounts never overflow the card. Optionally shows
 * the amount in words beneath the figure.
 */
export function FitAmount({
  value,
  className,
  maxFontSize = 24,
  minFontSize = 13,
  showWords = true,
  wordsClassName,
}: FitAmountProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);
  const text = formatRupees(value);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const fit = () => {
      // Measure the text's natural width at the maximum size, then scale down.
      textEl.style.fontSize = `${maxFontSize}px`;
      const available = container.clientWidth;
      const needed = textEl.scrollWidth;
      let next = maxFontSize;
      if (available > 0 && needed > available) {
        next = Math.max(
          minFontSize,
          Math.floor(maxFontSize * (available / needed)),
        );
      }
      // Only update when the value actually changes; this avoids the feedback
      // cycle that produces "ResizeObserver loop completed with undelivered
      // notifications" when a layout write re-triggers the observer.
      setFontSize((prev) => (prev === next ? prev : next));
    };

    fit();
    // Defer the observer callback to the next frame so layout reads/writes do
    // not run synchronously inside the ResizeObserver notification, which is
    // what triggers the (benign) ResizeObserver loop error.
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    ro.observe(container);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [text, maxFontSize, minFontSize]);

  return (
    <div ref={containerRef} className="w-full min-w-0">
      <span
        ref={textRef}
        className={cn("block whitespace-nowrap leading-none", className)}
        style={{ fontSize }}
      >
        {text}
      </span>
      {showWords && value > 0 && (
        <span
          className={cn(
            "mt-1 block text-[11px] font-medium leading-snug text-slate-400",
            wordsClassName,
          )}
        >
          {rupeesToWords(value)}
        </span>
      )}
    </div>
  );
}
