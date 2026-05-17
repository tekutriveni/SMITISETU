import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, Search, Users, Flame, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useListAncestors } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

function CountdownBadge({ days }: { days: number | null | undefined }) {
  if (days == null) return null;
  if (days === 0) return <Badge className="countdown-urgent border-0 text-xs">Today</Badge>;
  if (days <= 7) return <Badge className="countdown-soon border-0 text-xs">In {days}d</Badge>;
  if (days <= 30) return <Badge className="countdown-normal border-0 text-xs">In {days}d</Badge>;
  return null;
}

function AncestorCard({ ancestor }: { ancestor: any }) {
  const initials = ancestor.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Link href={`/ancestors/${ancestor.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-card border border-card-border rounded-2xl p-5 spiritual-glow cursor-pointer transition-all"
        data-testid={`card-ancestor-${ancestor.id}`}
      >
        <div className="flex items-start gap-4">
          {ancestor.photoUrl ? (
            <img
              src={ancestor.photoUrl}
              alt={ancestor.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
            />
          ) : (
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex-shrink-0">
              <span className="font-serif font-bold text-primary text-lg">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif font-semibold text-foreground truncate">{ancestor.fullName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{ancestor.relationship}</p>
              </div>
              <CountdownBadge days={ancestor.daysUntilNext} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ancestor.familySide && (
                <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">{ancestor.familySide}</span>
              )}
              {ancestor.tithi && (
                <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full text-primary">{ancestor.tithi}</span>
              )}
              {ancestor.nakshatram && (
                <span className="text-xs px-2 py-0.5 bg-accent/10 rounded-full text-accent-foreground">{ancestor.nakshatram}</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="w-3 h-3 text-primary" />
              <span>Vardhanti: {ancestor.dateOfDeath}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function AncestorsList() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [familySide, setFamilySide] = useState<string>("all");

  const { data: ancestors, isLoading } = useListAncestors({
    familySide: familySide !== "all" ? familySide as "Maternal" | "Paternal" : undefined,
    search: search || undefined,
  });

  const filtered = ancestors ?? [];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Ancestors</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filtered.length} {filtered.length === 1 ? "ancestor" : "ancestors"} remembered
            </p>
          </div>
          <Link href="/ancestors/new">
            <Button className="flex items-center gap-2" data-testid="button-add-ancestor">
              <Plus className="w-4 h-4" />
              Add Ancestor
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("searchAncestors")}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={familySide} onValueChange={setFamilySide}>
            <SelectTrigger className="w-40" data-testid="select-family-side">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Family side" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Family</SelectItem>
              <SelectItem value="Maternal">Maternal</SelectItem>
              <SelectItem value="Paternal">Paternal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-10 h-10 text-muted-foreground/40" />
              </div>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No ancestors added yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Start by adding your first ancestor to keep their memory alive.</p>
            <Link href="/ancestors/new">
              <Button>Add Your First Ancestor</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((a) => <AncestorCard key={a.id} ancestor={a} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
