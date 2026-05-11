import { motion } from "framer-motion";
import { Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { useGetSpiritualQuote } from "@workspace/api-client-react";

const STATIC_QUOTES = [
  {
    quote: "The soul is never born nor dies at any time. It has not come into being, does not come into being, and will not come into being. It is unborn, eternal, ever-existing, and primeval.",
    source: "Bhagavad Gita 2.20",
  },
  {
    quote: "For the soul there is never birth nor death at any time. It has not come into being, does not come into being, and will not come into being.",
    source: "Bhagavad Gita 2.20",
  },
  {
    quote: "Death is as sure for that which is born, as birth is for that which is dead. Therefore, grieve not for what is inevitable.",
    source: "Bhagavad Gita 2.27",
  },
  {
    quote: "Just as a person puts on new garments, giving up old ones, similarly, the soul accepts new material bodies, giving up the old and useless ones.",
    source: "Bhagavad Gita 2.22",
  },
  {
    quote: "He who has no attachments can really love others, for his love is pure and divine.",
    source: "Bhagavad Gita",
  },
  {
    quote: "Let the dead past bury its dead. Act — act in the living present, heart within and God overhead.",
    source: "Telugu Wisdom Tradition",
  },
  {
    quote: "The memory of those we loved is the light that guides our path through life.",
    source: "Upanishads",
  },
  {
    quote: "Perform your duty without attachment to the fruits. Offer all actions to the Divine, and you shall find eternal peace.",
    source: "Bhagavad Gita 3.19",
  },
];

export default function SpiritualQuotes() {
  const { data: quote, refetch, isFetching } = useGetSpiritualQuote();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Spiritual Quotes</h1>
          <p className="text-muted-foreground mt-1">
            Daily wisdom from the Bhagavad Gita, Upanishads, and Telugu traditions.
          </p>
        </div>

        {/* Daily Quote */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-semibold text-foreground">Today's Quote</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-primary"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
              New Quote
            </Button>
          </div>
          {quote ? (
            <motion.div key={quote.quote} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-serif text-xl italic text-foreground leading-relaxed mb-4">
                "{quote.quote}"
              </p>
              {quote.source && (
                <p className="text-sm text-muted-foreground text-right">— {quote.source}</p>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-4">
              <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Loading today's wisdom…</p>
            </div>
          )}
        </div>

        {/* Collection */}
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-5">
            Wisdom Collection
          </h2>
          <div className="space-y-4">
            {STATIC_QUOTES.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-card-border rounded-2xl p-5 spiritual-glow"
              >
                <Star className="w-4 h-4 text-accent mb-3" />
                <p className="font-serif text-foreground/90 italic leading-relaxed text-sm mb-2">
                  "{q.quote}"
                </p>
                <p className="text-xs text-muted-foreground text-right">— {q.source}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
