import { Link } from "wouter";
import { motion } from "framer-motion";
import { Flame, Star, Heart, Calendar, Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSpiritualQuote, useGetPanchangamToday } from "@workspace/api-client-react";
import { isAuthenticated } from "@/lib/auth";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { data: quote } = useGetSpiritualQuote();
  const { data: panchangam } = useGetPanchangamToday();
  const loggedIn = isAuthenticated();
  const { t } = useLanguage();

  const features = [
    { icon: Calendar, title: t("feat1Title"), desc: t("feat1Desc"), href: "/panchangam" },
    { icon: Bell, title: t("feat2Title"), desc: t("feat2Desc"), href: "/reminders" },
    { icon: Users, title: t("feat3Title"), desc: t("feat3Desc"), href: "/family-tree" },
    { icon: Star, title: t("feat4Title"), desc: t("feat4Desc"), href: "/ai-remembrance" },
    { icon: Heart, title: t("feat5Title"), desc: t("feat5Desc"), href: "/memory-gallery" },
    { icon: Flame, title: t("feat6Title"), desc: t("feat6Desc"), href: "/spiritual-quotes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20">
                <Flame className="w-10 h-10 text-primary diya-glow" />
              </div>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground leading-tight mb-4">
              {t("appName")}
            </h1>
            <p className="text-xl text-primary font-medium mb-3 font-serif italic">
              {t("appSubtitle")}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("appDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {loggedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 py-6 text-base font-medium">
                    {t("openDashboard")}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="px-8 py-6 text-base font-medium" data-testid="button-get-started">
                      {t("beginJourney")}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="px-8 py-6 text-base" data-testid="button-sign-in">
                      {t("signIn")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {panchangam && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-6xl mx-auto px-4 mb-16">
          <div className="bg-card border border-card-border rounded-2xl p-6 spiritual-glow">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-semibold text-foreground">{t("todayPanchangam")}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Tithi", value: panchangam.tithi },
                { label: "Nakshatram", value: panchangam.nakshatram },
                { label: "Masam", value: panchangam.masam },
                { label: "Vara", value: panchangam.vara },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 bg-primary/5 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-serif font-semibold text-foreground text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {quote && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="max-w-3xl mx-auto px-4 mb-16 text-center">
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-8">
            <Star className="w-6 h-6 text-accent mx-auto mb-4" />
            <p className="font-serif text-xl italic text-foreground leading-relaxed mb-3">"{quote.quote}"</p>
            {quote.source && <p className="text-sm text-muted-foreground">— {quote.source}</p>}
          </div>
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="font-serif text-3xl font-bold text-center text-foreground mb-12">
          {t("sacredFeatures")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Link key={f.title} href={f.href}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.2 }}
                  className="bg-card border border-card-border rounded-2xl p-6 spiritual-glow transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-primary" />
          <span className="font-serif font-semibold text-foreground">{t("appName")}</span>
        </div>
        <p>{t("honoringAncestors")}</p>
      </footer>
    </div>
  );
}
