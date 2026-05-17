import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { code: "te", native: "తెలుగు", english: "Telugu", flag: "🇮🇳" },
  { code: "en", native: "English", english: "English", flag: "🇬🇧" },
  { code: "hi", native: "हिंदी", english: "Hindi", flag: "🇮🇳" },
] as const;

export default function LanguageSelection() {
  const { setLanguage } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) setLanguage(selected as "te" | "en" | "hi");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 px-4">
      <div className="text-6xl mb-4 animate-pulse">🪔</div>
      <h1 className="text-2xl font-semibold text-amber-900 mb-1">స్మృతి సేతు</h1>
      <p className="text-sm text-amber-700 mb-8">Choose your preferred language / భాషను ఎంచుకోండి</p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelected(lang.code)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${selected === lang.code
                ? "border-amber-500 bg-amber-100 shadow-md scale-105"
                : "border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50"
              }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-sm font-semibold text-amber-900">{lang.native}</span>
            <span className="text-xs text-amber-600">{lang.english}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        className={`w-full max-w-sm py-3 rounded-xl font-semibold text-white transition-all
          ${selected
            ? "bg-amber-600 hover:bg-amber-700 active:scale-95"
            : "bg-amber-300 cursor-not-allowed"
          }`}
      >
        {selected === "te" ? "కొనసాగించు →" : selected === "hi" ? "जारी रखें →" : "Continue →"}
      </button>
    </div>
  );
}
