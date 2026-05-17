import { motion } from "framer-motion";
import { Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGetSpiritualQuote } from "@workspace/api-client-react";

const QUOTES_BY_LANG = {
  en: [
    { quote: "The soul is never born nor dies at any time. It is unborn, eternal, ever-existing, and primeval.", source: "Bhagavad Gita 2.20" },
    { quote: "Death is as sure for that which is born, as birth is for that which is dead. Therefore, grieve not for what is inevitable.", source: "Bhagavad Gita 2.27" },
    { quote: "Just as a person puts on new garments, giving up old ones, similarly, the soul accepts new material bodies.", source: "Bhagavad Gita 2.22" },
    { quote: "He who has no attachments can really love others, for his love is pure and divine.", source: "Bhagavad Gita" },
    { quote: "The memory of those we loved is the light that guides our path through life.", source: "Upanishads" },
    { quote: "Perform your duty without attachment to the fruits. Offer all actions to the Divine.", source: "Bhagavad Gita 3.19" },
  ],
  te: [
    { quote: "ఆత్మ ఎన్నటికీ పుట్టదు, చనిపోదు. ఇది నిత్యము, శాశ్వతము, పురాతనము.", source: "భగవద్గీత 2.20" },
    { quote: "పుట్టినదానికి మరణం నిశ్చయం, చనిపోయినదానికి పునర్జన్మ నిశ్చయం. అనివార్యమైన దానికి శోకించకు.", source: "భగవద్గీత 2.27" },
    { quote: "మనం ప్రేమించినవారి జ్ఞాపకం మన జీవన పథంలో వెలుతున్న జ్యోతి.", source: "ఉపనిషత్తులు" },
    { quote: "ఫలంపై ఆసక్తి లేకుండా నిన్ను నిర్వహించుము. అన్ని కార్యాలను దైవానికి అర్పించుము.", source: "భగవద్గీత 3.19" },
    { quote: "ఆసక్తి లేనివాడు మాత్రమే నిజంగా ఇతరులను ప్రేమించగలడు.", source: "భగవద్గీత" },
    { quote: "అన్ని ఇందు ఆత్మమును చూడుము - అన్ని జీవులలో, అన్ని వస్తువులలో.", source: "ఉపనిషత్తులు" },
  ],
  hi: [
    { quote: "आत्मा कभी जन्म नहीं लेती, कभी मरती नहीं. यह नित्य, शाश्वत और पुरातन है.", source: "भगवद्गीता 2.20" },
    { quote: "जो जन्मा है उसकी मृत्यु निश्चित है. अतः अनिवार्य के लिए शोक न करो.", source: "भगवद्गीता 2.27" },
    { quote: "हमारे प्रियजनों की स्मृति वो क्षण है जो हमारे जीवन में रोशनी देती है.", source: "उपनिषद" },
    { quote: "फल की आसक्ति छोड़कर कर्म करो. सभी कार्य ईश्वर को अर्पित करो.", source: "भगवद्गीता 3.19" },
    { quote: "जिसमें आसक्ति नहीं वही सच्चा प्रेम कर सकता है.", source: "भगवद्गीता" },
    { quote: "सभी में आत्मा को देखो - सभी जीवों में, सभी वस्तुओं में.", source: "उपनिषद" },
  ],
};

export default function SpiritualQuotes() {
  const { t, language } = useLanguage();
  const { data: quote, refetch, isFetching } = useGetSpiritualQuote();

  const quotes = QUOTES_BY_LANG[language as keyof typeof QUOTES_BY_LANG] || QUOTES_BY_LANG.en;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">{t("feat6Title")}</h1>
          <p className="text-muted-foreground mt-1">{t("feat6Desc")}</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-semibold text-foreground">{t("dailyQuote")}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching} className="text-primary">
              <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
              {t("newQuote")}
            </Button>
          </div>
          {quote ? (
            <motion.div key={quote.quote} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-serif text-xl italic text-foreground leading-relaxed mb-4">"{quote.quote}"</p>
              {quote.source && <p className="text-sm text-muted-foreground text-right">— {quote.source}</p>}
            </motion.div>
          ) : (
            <div className="text-center py-4">
              <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">{t("loading")}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-5">{t("wisdomCollection")}</h2>
          <div className="space-y-4">
            {quotes.map((q, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-card border border-card-border rounded-2xl p-5 spiritual-glow">
                <Star className="w-4 h-4 text-accent mb-3" />
                <p className="font-serif text-foreground/90 italic leading-relaxed text-sm mb-2">"{q.quote}"</p>
                <p className="text-xs text-muted-foreground text-right">— {q.source}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
