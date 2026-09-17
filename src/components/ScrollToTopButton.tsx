import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { Language, ThemeMode } from "../data/translations";

interface ScrollToTopButtonProps {
  lang: Language;
  theme: ThemeMode;
  threshold?: number;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  lang,
  theme,
  threshold = 250,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const isDark = theme === "dark";

  const toggleVisibility = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.scrollY > threshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [threshold]);

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility(); // Sprawdzenie stanu początkowego

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, [toggleVisibility]);

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  const tooltipLabel = lang === "pl" ? "Przewiń do góry" : "Scroll to top";

  return (
    <button
      id="btn-scroll-to-top"
      type="button"
      onClick={scrollToTop}
      aria-label={tooltipLabel}
      title={tooltipLabel}
      className={`fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-30 min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px] p-3 rounded-2xl border shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
        isDark
          ? "bg-neutral-900/90 hover:bg-neutral-800 text-emerald-400 border-neutral-700/80 shadow-black/40 backdrop-blur-md"
          : "bg-white/95 hover:bg-neutral-50 text-emerald-600 border-neutral-200 shadow-neutral-300/60 backdrop-blur-md"
      }`}
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
};
