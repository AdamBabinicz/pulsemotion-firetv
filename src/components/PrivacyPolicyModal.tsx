import React, { useEffect } from "react";
import { ShieldCheck, X, EyeOff, Mic, Database, FileText } from "lucide-react";
import { ThemeMode, TranslationSchema } from "../data/translations";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationSchema;
  theme: ThemeMode;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  t,
  theme,
}) => {
  const isDark = theme === "dark";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="privacy-policy-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl p-6 md:p-8 max-h-[85vh] flex flex-col overflow-hidden transition-colors ${
          isDark
            ? "bg-neutral-950 border-neutral-800 text-neutral-100"
            : "bg-white border-neutral-200 text-neutral-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nagłówek */}
        <div
          className={`flex items-start justify-between pb-4 border-b shrink-0 ${
            isDark ? "border-neutral-800" : "border-neutral-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isDark
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-emerald-50 border-emerald-200 text-emerald-600"
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2
                className={`text-lg md:text-xl font-bold tracking-wide ${
                  isDark ? "text-white" : "text-neutral-950"
                }`}
              >
                {t.privacyPolicyModal.title}
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                {t.privacyPolicyModal.lastUpdated}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              isDark
                ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
                : "text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100"
            }`}
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zawartość */}
        <div
          className={`py-6 space-y-4 overflow-y-auto pr-2 text-xs md:text-sm leading-relaxed ${
            isDark ? "text-neutral-300" : "text-neutral-700"
          }`}
        >
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              isDark
                ? "bg-neutral-900/60 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <EyeOff className="w-4 h-4 shrink-0" />
              <span>{t.privacyPolicyModal.section1Title}</span>
            </div>
            <p>{t.privacyPolicyModal.section1Text}</p>
          </div>

          <div
            className={`p-4 rounded-xl border space-y-2 ${
              isDark
                ? "bg-neutral-900/60 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <Mic className="w-4 h-4 shrink-0" />
              <span>{t.privacyPolicyModal.section2Title}</span>
            </div>
            <p>{t.privacyPolicyModal.section2Text}</p>
          </div>

          <div
            className={`p-4 rounded-xl border space-y-2 ${
              isDark
                ? "bg-neutral-900/60 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <Database className="w-4 h-4 shrink-0" />
              <span>{t.privacyPolicyModal.section3Title}</span>
            </div>
            <p>{t.privacyPolicyModal.section3Text}</p>
          </div>

          <div
            className={`p-4 rounded-xl border space-y-2 ${
              isDark
                ? "bg-neutral-900/60 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t.privacyPolicyModal.section4Title}</span>
            </div>
            <p>{t.privacyPolicyModal.section4Text}</p>
          </div>
        </div>

        {/* Przycisk */}
        <div
          className={`pt-4 border-t flex justify-end shrink-0 ${
            isDark ? "border-neutral-800" : "border-neutral-200"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs md:text-sm font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors shadow-lg shadow-emerald-500/20"
          >
            {t.privacyPolicyModal.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
