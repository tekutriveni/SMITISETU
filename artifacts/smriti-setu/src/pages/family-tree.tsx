import { motion } from "framer-motion";
import { Users, Plus, ChevronRight, Flame, TreePine } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useListAncestors } from "@workspace/api-client-react";

function TreeNode({ ancestor, index }: { ancestor: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex flex-col items-center"
    >
      {/* Vertical line from parent */}
      <div className="w-px h-6 bg-amber-300" />

      <Link href={`/ancestors/${ancestor.id}`}>
        <div className="relative group bg-white border-2 border-amber-200 hover:border-amber-500 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-all cursor-pointer w-36 text-center">
          {/* Diya icon */}
          <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif font-semibold text-amber-900 text-xs leading-tight truncate">
            {ancestor.fullName}
          </p>
          <p className="text-xs text-amber-600 mt-0.5 truncate">{ancestor.relationship}</p>
          {ancestor.tithi && (
            <p className="text-xs text-amber-400 mt-0.5 truncate">{ancestor.tithi}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function BranchTree({ branch, members, color }: { branch: string; members: any[]; color: string }) {
  return (
    <div className="flex flex-col items-center">
      {/* Root Node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 shadow-md ${color}`}
      >
        <TreePine className="w-4 h-4" />
        <span className="font-serif font-bold text-sm">{branch} Branch</span>
        <span className="text-xs opacity-70">({members.length})</span>
      </motion.div>

      {/* Trunk line down */}
      <div className="w-px bg-amber-300" style={{ height: members.length === 1 ? "24px" : "20px" }} />

      {members.length === 1 ? (
        <TreeNode ancestor={members[0]} index={0} />
      ) : (
        <div className="flex flex-col items-center w-full">
          {/* Horizontal connector */}
          <div className="relative flex items-start justify-center" style={{ width: `${members.length * 160}px`, maxWidth: "100%" }}>
            {/* Horizontal bar */}
            <div
              className="absolute top-0 bg-amber-300"
              style={{
                height: "1px",
                left: `calc(50% - ${((members.length - 1) * 80)}px)`,
                width: `${(members.length - 1) * 160}px`,
              }}
            />
            {/* Nodes */}
            <div className="flex gap-4 flex-wrap justify-center">
              {members.map((ancestor, i) => (
                <TreeNode key={ancestor.id} ancestor={ancestor} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FamilyTree() {
  const { t } = useLanguage();
  const { data: ancestors } = useListAncestors();

  const PATERNAL_RELS = ["father", "grandfather", "greatgrandfather", "uncle", "paternaluncle", "paternalaunt"];
  const MATERNAL_RELS = ["mother", "grandmother", "greatgrandmother", "aunt", "maternaluncle", "maternalaunt"];

  const grouped: Record<string, any[]> = { Paternal: [], Maternal: [], Other: [] };

  if (ancestors) {
    for (const a of ancestors) {
      const rel = (a.relationship ?? "").toLowerCase().replace(/\s/g, "");
      if (PATERNAL_RELS.some((r) => rel.includes(r))) {
        grouped.Paternal.push(a);
      } else if (MATERNAL_RELS.some((r) => rel.includes(r))) {
        grouped.Maternal.push(a);
      } else {
        grouped.Other.push(a);
      }
    }
  }

  const hasBranches = ancestors && ancestors.length > 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">{t("familyTree")}</h1>
            <p className="text-muted-foreground mt-1">మీ వంశ వృక్షం — పితృ & మాతృ శాఖలు</p>
          </div>
          <Link href="/ancestors/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Ancestor
            </Button>
          </Link>
        </div>

        {!hasBranches ? (
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
          <div className="space-y-12">
            {/* Paternal & Maternal side by side on desktop */}
            <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
              {grouped.Paternal.length > 0 && (
                <div className="flex-1 overflow-x-auto pb-4">
                  <BranchTree
                    branch="Paternal"
                    members={grouped.Paternal}
                    color="bg-amber-100 border-amber-400 text-amber-900"
                  />
                </div>
              )}

              {grouped.Paternal.length > 0 && grouped.Maternal.length > 0 && (
                <div className="hidden lg:block w-px bg-amber-100 self-stretch" />
              )}

              {grouped.Maternal.length > 0 && (
                <div className="flex-1 overflow-x-auto pb-4">
                  <BranchTree
                    branch="Maternal"
                    members={grouped.Maternal}
                    color="bg-rose-50 border-rose-300 text-rose-900"
                  />
                </div>
              )}
            </div>

            {/* Other branch */}
            {grouped.Other.length > 0 && (
              <BranchTree
                branch="Other"
                members={grouped.Other}
                color="bg-stone-100 border-stone-300 text-stone-800"
              />
            )}

            {/* View all */}
            <div className="text-center pt-4">
              <Link href="/ancestors">
                <Button variant="outline">
                  View All Ancestors <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
