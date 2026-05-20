import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, Flame, Calendar, Star, BookOpen, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  useGetAncestor, getGetAncestorQueryKey, getListAncestorsQueryKey,
  useDeleteAncestor, useGenerateRemembranceMessage, useGetRitualSuggestions,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function AncestorDetail() {
  const { t } = useLanguage();
  const [, params] = useRoute("/ancestors/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = Number(params?.id);

  const { data: ancestor, isLoading } = useGetAncestor(id, {
    query: { enabled: !!id, queryKey: getGetAncestorQueryKey(id) },
  });

  const deleteMutation = useDeleteAncestor();
  const messageMutation = useGenerateRemembranceMessage();
  const ritualMutation = useGetRitualSuggestions();
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [ritualSuggestions, setRitualSuggestions] = useState<any | null>(null);

  function handleDelete() {
    if (!confirm("Are you sure you want to remove this ancestor?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAncestorsQueryKey() });
        toast({ title: "Ancestor removed", description: "The ancestor has been removed from your records." });
        setLocation("/ancestors");
      },
    });
  }

  function handleGenerateMessage() {
    messageMutation.mutate({ data: { ancestorId: id, occasion: "anniversary" } }, {
      onSuccess: (res) => setGeneratedMessage(res.message),
    });
  }

  function handleRitualSuggestions() {
    ritualMutation.mutate({ data: { ancestorId: id } }, {
      onSuccess: (res) => setRitualSuggestions(res),
    });
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!ancestor) {
    return <Layout><div className="text-center py-20 text-muted-foreground">Ancestor not found.</div></Layout>;
  }

  const initials = ancestor.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const daysUntil = ancestor.daysUntilNext;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/ancestors")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation(`/ancestors/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-card-border rounded-3xl p-8 spiritual-glow"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {ancestor.photoUrl ? (
              <img src={ancestor.photoUrl} alt={ancestor.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex-shrink-0">
                <span className="font-serif font-bold text-primary text-2xl">{initials}</span>
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              <h1 className="font-serif text-3xl font-bold text-foreground">{ancestor.fullName}</h1>
              <p className="text-muted-foreground mt-1">{ancestor.relationship}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {ancestor.familySide && <Badge variant="secondary">{ancestor.familySide}</Badge>}
                {ancestor.gender && <Badge variant="outline">{ancestor.gender}</Badge>}
                {daysUntil != null && daysUntil >= 0 && daysUntil <= 30 && (
                  <Badge className={daysUntil === 0 ? "countdown-urgent border-0" : daysUntil <= 7 ? "countdown-soon border-0" : "countdown-normal border-0"}>
                    {daysUntil === 0 ? "Vardhanti Today" : `Vardhanti in ${daysUntil} days`}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center p-3 bg-primary/5 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Vardhanti (Death)</p>
              <p className="font-serif font-semibold text-foreground text-sm">{ancestor.dateOfDeath}</p>
            </div>
            {ancestor.dateOfBirth && (
              <div className="text-center p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
                <p className="font-serif font-semibold text-foreground text-sm">{ancestor.dateOfBirth}</p>
              </div>
            )}
            {ancestor.placeOfDeath && (
              <div className="text-center p-3 bg-muted rounded-xl col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Place</p>
                <p className="font-serif font-semibold text-foreground text-sm">{ancestor.placeOfDeath}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Panchangam details */}
        {(ancestor.tithi || ancestor.nakshatram || ancestor.masam) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-card border border-card-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-semibold text-foreground">Panchangam Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {ancestor.tithi && <div className="text-center p-3 bg-primary/5 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Tithi</p>
                <p className="font-serif font-semibold text-sm text-foreground">{ancestor.tithi}</p>
              </div>}
              {ancestor.nakshatram && <div className="text-center p-3 bg-accent/10 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Nakshatram</p>
                <p className="font-serif font-semibold text-sm text-foreground">{ancestor.nakshatram}</p>
              </div>}
              {ancestor.masam && <div className="text-center p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Masam</p>
                <p className="font-serif font-semibold text-sm text-foreground">{ancestor.masam}</p>
              </div>}
              {ancestor.paksham && <div className="text-center p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Paksham</p>
                <p className="font-serif font-semibold text-sm text-foreground">{ancestor.paksham}</p>
              </div>}
              {ancestor.gotram && <div className="text-center p-3 bg-muted rounded-xl col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Gotram</p>
                <p className="font-serif font-semibold text-sm text-foreground">{ancestor.gotram}</p>
              </div>}
            </div>
          </motion.div>
        )}

        {/* Memories */}
        {ancestor.favoriteMemories && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="bg-card border border-card-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-destructive" />
              <h2 className="font-serif font-semibold text-foreground">Favorite Memories</h2>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed italic">{ancestor.favoriteMemories}</p>
          </motion.div>
        )}

        {/* Ritual notes */}
        {(ancestor.ritualNotes || ancestor.traditions || ancestor.prasadamDetails) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-card border border-card-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-semibold text-foreground">Ritual & Traditions</h2>
            </div>
            <div className="space-y-3">
              <DetailRow label="Ritual Notes" value={ancestor.ritualNotes} />
              <DetailRow label="Traditions" value={ancestor.traditions} />
              <DetailRow label="Prasadam / Food Offerings" value={ancestor.prasadamDetails} />
            </div>
          </motion.div>
        )}

        {/* AI Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-accent" />
            <h2 className="font-serif font-semibold text-foreground">AI Remembrance</h2>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button variant="outline" size="sm" onClick={handleGenerateMessage} disabled={messageMutation.isPending}>
              {messageMutation.isPending ? "Generating..." : "Generate Remembrance Message"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRitualSuggestions} disabled={ritualMutation.isPending}>
              {ritualMutation.isPending ? "Loading..." : "Get Ritual Suggestions"}
            </Button>
          </div>

          {generatedMessage && (
            <div className="bg-background/60 border border-border rounded-xl p-4 mb-3">
              <p className="font-serif text-sm italic text-foreground/90 leading-relaxed">{generatedMessage}</p>
            </div>
          )}
          {generatedMessage && (
            <button
              onClick={() => {
                const text = encodeURIComponent(`🪔 *${ancestor.fullName}* స్మరణ\n\n"${generatedMessage}"\n\n— SmritiSetu App ద్వారా`);
                window.open(`https://wa.me/?text=${text}`, "_blank");
              }}
              className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white w-full justify-center transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#25D366" }}
            >
              <Share2 className="w-4 h-4" />
              WhatsApp లో Share చేయండి
            </button>
          )}

          {ritualSuggestions && (
            <div className="space-y-4">
              <div>
                <p className="font-medium text-sm text-foreground mb-2">Ritual Suggestions</p>
                <ul className="space-y-1">
                  {ritualSuggestions.suggestions.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <Flame className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-sm text-foreground mb-2">Food Offerings</p>
                <ul className="space-y-1">
                  {ritualSuggestions.foodOfferings.map((f: string, i: number) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="w-3 h-3 mt-1 flex-shrink-0 text-accent">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
