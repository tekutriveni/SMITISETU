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
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 px-4 py-8">
      <div className="text-6xl mb-4 animate-pulse">🪔</div>
      <h1 className="text-2xl font-semibold text-amber-900 mb-1">స్మృతి సేతు</h1>
      <p className="text-sm text-amber-700 mb-6">Choose your preferred language / భాషను ఎంచుకోండి</p>

      {/* Pitru Devo Bhava Quote */}
      <div className="w-full max-w-sm mb-6 rounded-2xl border border-amber-200 bg-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-amber-300/60" />
          <span className="text-amber-500 text-sm">✦</span>
          <div className="h-px flex-1 bg-amber-300/60" />
        </div>

        <div className="mb-3 text-center">
          <p className="text-amber-800 font-bold text-base">పితృ దేవో భవ</p>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            "పూర్వీకులు దేవుళ్ళతో సమానం. కృతజ్ఞతతో మరియు స్మరణతో వారిని గౌరవించండి."
          </p>
        </div>

        <div className="h-px bg-amber-100 mx-2 my-2" />

        <div className="mb-3 text-center">
          <p className="text-amber-800 font-bold text-base italic">Pitru Devo Bhava</p>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            "May the ancestors be like God to you. Honor them with gratitude and remembrance."
          </p>
        </div>

        <div className="h-px bg-amber-100 mx-2 my-2" />

        <div className="text-center">
          <p className="text-amber-800 font-bold text-base">पितृ देवो भव</p>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            "पूर्वज देवताओं के समान हैं। कृतज्ञता और स्मरण से उनका सम्मान करें।"
          </p>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <div className="h-px flex-1 bg-amber-300/60" />
          <span className="text-amber-500 text-sm">✦</span>
          <div className="h-px flex-1 bg-amber-300/60" />
        </div>
      </div>

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
