import { motion } from "framer-motion";
import { Link } from "wouter";
import { Users, Calendar, Bell, Flame, Star, Plus, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout";
import {
  useGetDashboardSummary,
  useGetUpcomingEvents,
  useGetPanchangamToday,
  useGetSpiritualQuote,
  useGetTodayReminders,
  useGetMe,
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

function CountdownBadge({ days }: { days: number }) {
  if (days === 0) return <Badge className="countdown-urgent border-0 text-xs font-medium">Today</Badge>;
  if (days === 1) return <Badge className="countdown-urgent border-0 text-xs font-medium">Tomorrow</Badge>;
  if (days <= 7) return <Badge className="countdown-soon border-0 text-xs font-medium">In {days} days</Badge>;
  return <Badge className="countdown-normal border-0 text-xs font-medium">In {days} days</Badge>;
}

export default function Dashboard() {
  const { data: me } = useGetMe();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: upcoming, isLoading: upcomingLoading } = useGetUpcomingEvents();
  const { data: panchangam } = useGetPanchangamToday();
  const { data: quote } = useGetSpiritualQuote();
  const { data: todayReminders } = useGetTodayReminders();

  const stats = [
    { label: "Ancestors", value: summary?.totalAncestors ?? 0, icon: Users, color: "text-primary" },
    { label: "This Month", value: summary?.upcomingThisMonth ?? 0, icon: Calendar, color: "text-accent" },
    { label: "This Week", value: summary?.upcomingThisWeek ?? 0, icon: Clock, color: "text-orange-500" },
    { label: "Today", value: summary?.todayCount ?? 0, icon: Flame, color: "text-destructive" },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Namaste{me?.name ? `, ${me.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">May your ancestors' blessings guide your day.</p>
          </div>
          <Link href="/ancestors/new">
            <Button className="hidden sm:flex items-center gap-2" data-testid="button-add-ancestor">
              <Plus className="w-4 h-4" />
              Add Ancestor
            </Button>
          </Link>
        </div>

        {/* Today's alerts */}
        {todayReminders && todayReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-semibold text-foreground">Today's Remembrances</h2>
            </div>
            <div className="space-y-2">
              {todayReminders.map((r) => (
                <div key={r.id} className="text-sm text-foreground bg-background/60 rounded-xl px-4 py-3 border border-primary/10">
                  {r.message}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-card-border rounded-2xl p-5 spiritual-glow"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={cn("w-5 h-5", stat.color)} />
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="font-serif text-3xl font-bold text-foreground">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming events */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-serif font-semibold text-foreground">Upcoming Remembrances</h2>
              </div>
              <Link href="/ancestors">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {upcomingLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : upcoming && upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.slice(0, 5).map((event) => (
                  <motion.div
                    key={event.ancestorId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-4 bg-background/60 rounded-xl border border-border hover:border-primary/30 transition-colors"
                    data-testid={`card-upcoming-${event.ancestorId}`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                      <Flame className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{event.ancestorName}</p>
                      <p className="text-xs text-muted-foreground">{event.relationship} • {event.anniversaryDate}</p>
                      {event.tithi && <p className="text-xs text-primary/70">{event.tithi} Tithi</p>}
                    </div>
                    <CountdownBadge days={event.daysUntil} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No upcoming remembrances in the next 90 days.</p>
                <Link href="/ancestors/new">
                  <Button variant="outline" size="sm" className="mt-3">Add an Ancestor</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right sidebar: Panchangam + Quote */}
          <div className="space-y-5">
            {/* Today's Panchangam */}
            {panchangam && (
              <div className="bg-card border border-card-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="font-serif font-semibold text-sm text-foreground">Today's Panchangam</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Tithi", value: panchangam.tithi },
                    { label: "Nakshatram", value: panchangam.nakshatram },
                    { label: "Masam", value: panchangam.masam },
                    { label: "Vara", value: panchangam.vara },
                    { label: "Paksham", value: panchangam.paksham },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/panchangam">
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-primary text-xs">
                    Full Calendar <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Spiritual Quote */}
            {quote && (
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-accent" />
                  <h3 className="font-serif font-semibold text-sm text-foreground">Daily Quote</h3>
                </div>
                <p className="font-serif text-sm italic text-foreground/90 leading-relaxed">"{quote.quote}"</p>
                {quote.source && <p className="text-xs text-muted-foreground mt-2">— {quote.source}</p>}
              </div>
            )}

            {/* Quick Add */}
            <Link href="/ancestors/new">
              <div className="bg-primary text-primary-foreground rounded-2xl p-5 cursor-pointer hover:bg-primary/90 transition-colors">
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6" />
                  <div>
                    <p className="font-medium text-sm">Add Ancestor</p>
                    <p className="text-xs opacity-80">Record their memory</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
