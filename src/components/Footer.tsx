import React from "react";
import { ShieldCheck, Scale, Cookie, Sparkles, Tv, Bot } from "lucide-react";
import { ThemeMode, TranslationSchema } from "../data/translations";

interface FooterProps {
  t: TranslationSchema;
  theme: ThemeMode;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenCookieSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  t,
  theme,
  onOpenPrivacy,
  onOpenTerms,
  onOpenCookieSettings,
}) => {
  const isDark = theme === "dark";

  // Automatyczny zakres lat: w 2026 jest "2026", w 2027 będzie "2026 – 2027"
  const startYear = 2026;
  const currentYear = new Date().getFullYear();
  const yearText =
    currentYear > startYear ? `${startYear} – ${currentYear}` : `${startYear}`;

  return (
    <footer
      id="app-footer"
      className={`w-full mt-12 border-t pt-8 pb-24 sm:pb-12 md:py-8 px-4 md:px-8 transition-colors duration-300 ${
        isDark
          ? "bg-neutral-950/90 border-neutral-800 text-neutral-400"
          : "bg-white border-neutral-200 text-neutral-600 shadow-sm"
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs md:text-sm">
        {/* Lewa strona: Twórca, Prawa autorskie i Współpraca AI */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span
              className={`font-bold tracking-tight ${
                isDark ? "text-white" : "text-neutral-950"
              }`}
            >
              PulseMotion TV
            </span>
            <span className="opacity-40">•</span>
            <span>© {yearText}</span>
            <span
              className={`font-semibold ${
                isDark ? "text-neutral-300" : "text-neutral-800"
              }`}
            >
              Adam Babinicz / Adam Gierczak
            </span>
          </div>

          {/* Notatka o współpracy AI Studio i Genspark */}
          <div
            className={`flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-[11px] ${
              isDark ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            <span>Stworzone przy wsparciu:</span>
            <span
              className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded border ${
                isDark
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              <Bot className="w-3 h-3" />
              Google AI Studio
            </span>
            <span>&amp;</span>
            <span
              className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded border ${
                isDark
                  ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                  : "bg-cyan-50 border-cyan-200 text-cyan-700"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Genspark AI
            </span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                isDark ? "text-amber-300" : "text-amber-700"
              }`}
            >
              <Tv className="w-3 h-3" />
              Amazon Fire TV Hackathon
            </span>
          </div>
        </div>

        {/* Prawa strona: Przyciski Prawne & Ciasteczka */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              isDark
                ? "border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200"
                : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t.footer.privacyLink}</span>
          </button>

          <button
            type="button"
            onClick={onOpenTerms}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              isDark
                ? "border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200"
                : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.footer.termsLink}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCookieSettings}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              isDark
                ? "border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200"
                : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
            }`}
          >
            <Cookie className="w-3.5 h-3.5 text-cyan-500" />
            <span>{t.footer.cookieSettingsLink}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
