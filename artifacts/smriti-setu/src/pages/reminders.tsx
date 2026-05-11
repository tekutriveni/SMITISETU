import { motion } from "framer-motion";
import { Bell, Flame, Clock, Calendar } from "lucide-react";
import Layout from "@/components/layout";
import { useGetTodayReminders, useGetUpcomingEvents } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

function CountdownBadge({ days }: { days: number }) {
  if (days === 0) return <Badge className="countdown-urgent border-0 text-xs font-medium">Today</Badge>;
  if (days === 1) return <Badge className="countdown-urgent border-0 text-xs font-medium">Tomorrow</Badge>;
  if (days <= 7) return <Badge className="countdown-soon border-0 text-xs font-medium">In {days} days</Badge>;
  return <Badge className="countdown-normal border-0 text-xs font-medium">In {days} days</Badge>;
}

export default function Reminders() {
  const { data: todayReminders } = useGetTodayReminders();
  const { data: upcoming } = useGetUpcomingEvents();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Smart Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Stay connected with your ancestors' remembrance dates.
          </p>
        </div>

        {/* Today's Reminders */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold text-foreground">Today's Reminders</h2>
          </div>
          {todayReminders && todayReminders.length > 0 ? (
            <div className="space-y-3">
              {todayReminders.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-primary/10 border border-primary/20 rounded-2xl p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 flex-shrink-0">
                      <Flame className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{r.message}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{r.type?.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-card-border rounded-2xl p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No reminders for today. All is peaceful.</p>
            </div>
          )}
        </section>

        {/* Upcoming Remembrances */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold text-foreground">Upcoming (Next 90 Days)</h2>
          </div>
          {upcoming && upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((event) => (
                <motion.div
                  key={event.ancestorId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-card-border rounded-2xl p-5 spiritual-glow"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-foreground">{event.ancestorName}</p>
                      <p className="text-sm text-muted-foreground">{event.relationship}</p>
                      <p className="text-xs text-primary/70 mt-0.5">{event.anniversaryDate}{event.tithi ? ` • ${event.tithi} Tithi` : ""}</p>
                    </div>
                    <CountdownBadge days={event.daysUntil} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-card-border rounded-2xl p-8 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No upcoming remembrances in the next 90 days.</p>
            </div>
          )}
        </section>

        {/* Reminder schedule info */}
        <section className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
          <h3 className="font-serif font-semibold text-foreground mb-3">Reminder Schedule</h3>
          <p className="text-sm text-muted-foreground mb-4">
            SmritiSetu automatically notifies you before each ancestor's death anniversary:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["1 Month", "15 Days", "7 Days", "1 Day"].map((t) => (
              <div key={t} className="text-center p-3 bg-background/60 rounded-xl border border-border">
                <Bell className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">{t}</p>
                <p className="text-xs text-muted-foreground">before</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
