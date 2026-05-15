import { motion } from "framer-motion";
import { Heart, Flame, ChevronRight, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { useListAncestors } from "@workspace/api-client-react";

export default function MemoryGallery() {
  const { data: ancestors } = useListAncestors();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Memory Gallery</h1>
          <p className="text-muted-foreground mt-1">
            A sacred space to preserve memories, traditions, and prasadam details.
          </p>
        </div>

        {!ancestors || ancestors.length === 0 ? (
          <div className="bg-card border border-card-border rounded-2xl p-12 text-center">
            <Heart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Begin Preserving Memories
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Add ancestors to start building your family's memory gallery. Each ancestor's
              profile becomes a sacred space to preserve traditions and prasadam details.
            </p>
            <Link href="/ancestors/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Ancestor
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ancestors.map((ancestor, i) => (
              <motion.div
                key={ancestor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/ancestors/${ancestor.id}`}>
                  <div className="bg-card border border-card-border rounded-2xl p-6 spiritual-glow hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 flex-shrink-0 overflow-hidden">
                        {ancestor.photoUrl ? (
                          <img src={ancestor.photoUrl} alt={ancestor.fullName} className="w-14 h-14 object-cover rounded-2xl" />
                        ) : (
                          <Flame className="w-7 h-7 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-foreground truncate text-lg">
                          {ancestor.fullName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{ancestor.relationship}</p>
                        {ancestor.gotram && (
                          <p className="text-xs text-primary/70 mt-1">Gotram: {ancestor.gotram}</p>
                        )}
                        {ancestor.tithi && (
                          <p className="text-xs text-muted-foreground mt-0.5">{ancestor.tithi} Tithi</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                    </div>

                    {ancestor.favoriteMemories && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-1 mb-1">
                          <Heart className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-foreground">Memory</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 italic">
                          "{ancestor.favoriteMemories}"
                        </p>
                      </div>
                    )}

                    {ancestor.prasadamDetails && (
                      <div className="mt-3">
                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          {ancestor.prasadamDetails}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Each ancestor's profile holds their favorite memories, traditions, and prasadam details —
            a living tribute that passes down through generations.
          </p>
        </div>
      </div>
    </Layout>
  );
}
