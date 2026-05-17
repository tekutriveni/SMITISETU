import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Sparkles, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useListAncestors, useGenerateRemembranceMessage } from "@workspace/api-client-react";

const OCCASIONS = [
  { value: "anniversary", label: t("vardhanti") },
  { value: "birthday", label: t("birthdayRemembrance") },
  { value: "general", label: t("generalRemembrance") },
];

export default function AiRemembrance() {
  const { t } = useLanguage();
  const { data: ancestors } = useListAncestors();
  const [selectedAncestor, setSelectedAncestor] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("anniversary");

  const { mutate: generate, data: result, isPending, reset } = useGenerateRemembranceMessage();

  function handleGenerate() {
    if (!selectedAncestor) return;
    reset();
    generate({ data: { ancestorId: Number(selectedAncestor), occasion: selectedOccasion as "anniversary" | "birthday" | "general" } });
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">AI Remembrance</h1>
          <p className="text-muted-foreground mt-1">
            Generate heartfelt spiritual messages and remembrance quotes.
          </p>
        </div>

        {/* Generator */}
        <div className="bg-card border border-card-border rounded-2xl p-6 spiritual-glow">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Generate a Message</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Select Ancestor</label>
              {ancestors && ancestors.length > 0 ? (
                <Select value={selectedAncestor} onValueChange={setSelectedAncestor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("chooseAncestor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ancestors.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.fullName} ({a.relationship})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-4 text-center">
                  No ancestors added yet. Add an ancestor first to generate messages.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Occasion</label>
              <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={!selectedAncestor || isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" /> Generating…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Generate Message
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {result.message && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-primary" />
                  <h3 className="font-serif font-semibold text-foreground">Remembrance Message</h3>
                </div>
                <p className="font-serif text-foreground/90 leading-relaxed italic">"{result.message}"</p>
                {result.language && (
                  <p className="text-xs text-muted-foreground mt-3">Language: {result.language}</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Info box */}
        <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 text-center">
          <Star className="w-6 h-6 text-accent mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Messages are generated using spiritual wisdom from the Bhagavad Gita,
            Upanishads, and Telugu cultural traditions.
          </p>
        </div>
      </div>
    </Layout>
  );
}
