import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Flame, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Language = "Telugu" | "Hindi" | "English";
type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
}

const SUGGESTIONS: Record<Language, string[]> = {
  Telugu: [
    "వర్ధంతి అంటే ఏమిటి?",
    "తిథి ఎలా చూసుకోవాలి?",
    "అమావాస్య ప్రసాదం ఏమిటి?",
    "నక్షత్రం అర్థం ఏమిటి?",
  ],
  Hindi: [
    "वर्धंती क्या होती है?",
    "तिथि कैसे देखें?",
    "अमावस्या पर क्या बनाएं?",
    "नक्षत्र का मतलब?",
  ],
  English: [
    "What is Vardhanti?",
    "How to find Tithi?",
    "Amavasya prasadam ideas?",
    "What is Nakshatram?",
  ],
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function ensureConversation(language: Language): Promise<number> {
  const token = getAuthToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api/gemini/conversations`, {
    method: "POST",
    headers,
    body: JSON.stringify({ title: `SmritiSetu Chat (${language})` }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  const data = await res.json();
  return data.id;
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("Telugu");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [convId, setConvId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      setShowSuggestions(false);
      setInput("");

      const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);

      // Typing indicator
      const typingId = `typing-${Date.now()}`;
      setMessages((prev) => [...prev, { id: typingId, role: "assistant", content: "", streaming: true }]);
      setStreaming(true);

      try {
        let cid = convId;
        if (!cid) {
          cid = await ensureConversation(language);
          setConvId(cid);
        }

        const token = getAuthToken();
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${BASE}/api/gemini/conversations/${cid}/messages`, {
          method: "POST",
          headers,
          body: JSON.stringify({ content: text, language }),
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        setMessages((prev) =>
          prev.map((m) => (m.id === typingId ? { ...m, content: "", streaming: true } : m))
        );

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const raw = decoder.decode(value, { stream: true });
          for (const line of raw.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (!json) continue;
            try {
              const evt = JSON.parse(json);
              if (evt.error) throw new Error(evt.error);
              if (evt.done) break;
              if (evt.content) {
                accumulated += evt.content;
                setMessages((prev) =>
                  prev.map((m) => (m.id === typingId ? { ...m, content: accumulated } : m))
                );
              }
            } catch {
              // skip bad JSON lines
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === typingId ? { ...m, streaming: false } : m))
        );
      } catch {
        const errorMsg =
          language === "Telugu"
            ? "క్షమించండి, ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
            : language === "Hindi"
            ? "क्षमा करें, कुछ गलत हुआ। कृपया पुनः प्रयास करें।"
            : "Something went wrong, please try again.";
        setMessages((prev) =>
          prev.map((m) => (m.id === typingId ? { ...m, content: errorMsg, streaming: false } : m))
        );
      } finally {
        setStreaming(false);
      }
    },
    [convId, language, streaming]
  );

  function handleLanguageChange(lang: Language) {
    setLanguage(lang);
    setMessages([]);
    setConvId(null);
    setShowSuggestions(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center focus:outline-none"
        style={{ background: "#C45E1A" }}
        animate={{ scale: open ? 0.9 : 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Assistant"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "#C45E1A", opacity: 0.45 }}
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        />
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}>
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="flame" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Flame className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] max-h-[70vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#FAF6F0", border: "1px solid #E8D9C5" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: "#C45E1A" }}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-white" />
                <span className="font-serif font-bold text-white text-base tracking-wide">
                  SmritiSetu AI
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language toggle */}
            <div className="flex gap-1 px-3 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid #E8D9C5" }}>
              {(["Telugu", "Hindi", "English"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all",
                    language === lang
                      ? "text-white"
                      : "text-[#7A5C3A] hover:bg-[#F0E6D6]"
                  )}
                  style={language === lang ? { background: "#C45E1A" } : {}}
                >
                  {lang === "Telugu" ? "తెలుగు" : lang === "Hindi" ? "हिंदी" : "English"}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "#F5EDE0" }}>
                    <Flame className="w-6 h-6" style={{ color: "#C45E1A" }} />
                  </div>
                  <p className="font-serif font-semibold text-sm" style={{ color: "#3D2B1A" }}>
                    {language === "Telugu"
                      ? "నమస్కారం! మీకు ఏమి సహాయం చేయాలి?"
                      : language === "Hindi"
                      ? "नमस्ते! मैं आपकी कैसे मदद करूं?"
                      : "Namaste! How can I assist you today?"}
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[82%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "text-white rounded-br-sm"
                        : "rounded-bl-sm"
                    )}
                    style={
                      msg.role === "user"
                        ? { background: "#C45E1A" }
                        : { background: "#F0E6D6", color: "#3D2B1A", border: "1px solid #E8D9C5" }
                    }
                  >
                    {msg.streaming && !msg.content ? (
                      <span className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ background: "#C45E1A" }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                    {msg.streaming && msg.content && (
                      <span
                        className="inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded-full animate-pulse"
                        style={{ background: "#C45E1A" }}
                      />
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips */}
            {showSuggestions && messages.length === 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {SUGGESTIONS[language].map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    disabled={streaming}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all hover:text-white disabled:opacity-50"
                    style={{ borderColor: "#C45E1A", color: "#C45E1A" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#C45E1A";
                      (e.currentTarget as HTMLButtonElement).style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "#C45E1A";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid #E8D9C5" }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
                placeholder={
                  language === "Telugu"
                    ? "మీ ప్రశ్న టైప్ చేయండి…"
                    : language === "Hindi"
                    ? "अपना प्रश्न लिखें…"
                    : "Type your question…"
                }
                className="flex-1 text-sm px-3 py-2 rounded-xl border outline-none transition-colors disabled:opacity-50"
                style={{
                  background: "#FDF9F4",
                  borderColor: "#E8D9C5",
                  color: "#3D2B1A",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C45E1A")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E8D9C5")}
              />
              <Button
                size="icon"
                disabled={!input.trim() || streaming}
                onClick={() => sendMessage(input)}
                className="w-9 h-9 rounded-xl flex-shrink-0"
                style={{ background: "#C45E1A" }}
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
