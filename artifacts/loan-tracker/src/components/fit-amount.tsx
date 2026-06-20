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
      if (available > 0 && needed > available) {
        const next = Math.max(
          minFontSize,
          Math.floor(maxFontSize * (available / needed)),
        );
        setFontSize(next);
      } else {
        setFontSize(maxFontSize);
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
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
