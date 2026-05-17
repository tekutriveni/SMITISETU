import { motion } from "framer-motion";
import { Users, Plus, ChevronRight, Flame } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useListAncestors } from "@workspace/api-client-react";



export default function FamilyTree() {
  const { t } = useLanguage();
  const { data: ancestors } = useListAncestors();
  const RELATIONSHIP_GROUPS: Record<string, string[]> = {
    Paternal: [t("father"), t("grandfather"), t("greatGrandfather"), t("paternalUncle"), t("paternalAunt")],
    Maternal: [t("mother"), t("grandmother"), t("greatGrandmother"), t("maternalUncle"), t("maternalAunt")],
    Other: [],
  };


  const grouped: Record<string, typeof ancestors> = { Paternal: [], Maternal: [], Other: [] };
  if (ancestors) {
    for (const a of ancestors) {
      const rel = a.relationship ?? "";
      if (RELATIONSHIP_GROUPS.Paternal.some((r) => rel.toLowerCase().includes(r.toLowerCase()))) {
        grouped.Paternal!.push(a);
      } else if (RELATIONSHIP_GROUPS.Maternal.some((r) => rel.toLowerCase().includes(r.toLowerCase()))) {
        grouped.Maternal!.push(a);
      } else {
        grouped.Other!.push(a);
      }
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Family Tree</h1>
            <p className="text-muted-foreground mt-1">
              Your ancestral lineage, organized by family branch.
            </p>
          </div>
          <Link href="/ancestors/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Ancestor
            </Button>
          </Link>
        </div>

        {!ancestors || ancestors.length === 0 ? (
          <div className="bg-card border border-card-border rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Your Family Tree Awaits
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Begin by adding your first ancestor. Honor their memory by preserving their name,
              relationship, and remembrance date.
            </p>
            <Link href="/ancestors/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Ancestor
              </Button>
            </Link>
          </div>
        ) : (
          Object.entries(grouped).map(([branch, members]) =>
            members && members.length > 0 ? (
              <section key={branch}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    {branch} Branch
                  </h2>
                  <span className="text-sm text-muted-foreground">({members.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {members.map((ancestor, i) => (
                    <motion.div
                      key={ancestor.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/ancestors/${ancestor.id}`}>
                        <div className="bg-card border border-card-border rounded-2xl p-5 spiritual-glow hover:border-primary/30 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0">
                              <Flame className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-serif font-semibold text-foreground truncate">
                                {ancestor.fullName}
                              </p>
                              <p className="text-sm text-muted-foreground">{ancestor.relationship}</p>
                              {ancestor.tithi && (
                                <p className="text-xs text-primary/70 mt-0.5">{ancestor.tithi} Tithi</p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            ) : null
          )
        )}

        {ancestors && ancestors.length > 0 && (
          <div className="text-center pt-4">
            <Link href="/ancestors">
              <Button variant="outline">
                View All Ancestors <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
