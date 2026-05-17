import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sun, Star, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGetPanchangamToday, useGetCalendarEvents } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Panchangam() {
  const { t } = useLanguage();
  const today = new Date();
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });

  const { data: panchangamToday, isLoading: loadingToday } = useGetPanchangamToday();
  const { data: calendarEvents } = useGetCalendarEvents({ year: viewDate.year, month: viewDate.month });

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month - 1);
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month - 1);

  function prevMonth() {
    setViewDate(v => {
      if (v.month === 1) return { year: v.year - 1, month: 12 };
      return { ...v, month: v.month - 1 };
    });
  }
  function nextMonth() {
    setViewDate(v => {
      if (v.month === 12) return { year: v.year + 1, month: 1 };
      return { ...v, month: v.month + 1 };
    });
  }

  function getEventsForDay(day: number) {
    const dateStr = `${viewDate.year}-${String(viewDate.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return (calendarEvents ?? []).filter(e => e.date === dateStr);
  }

  const isToday = (day: number) =>
    viewDate.year === today.getFullYear() &&
    viewDate.month === today.getMonth() + 1 &&
    day === today.getDate();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Panchangam Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Telugu calendar with Tithi, Nakshatram, and remembrance dates</p>
        </div>

        {/* Today's Panchangam */}
        <div className="bg-card border border-card-border rounded-2xl p-6 spiritual-glow">
          <div className="flex items-center gap-2 mb-5">
            <Sun className="w-5 h-5 text-accent" />
            <h2 className="font-serif font-semibold text-foreground">Today's Panchangam</h2>
            <span className="text-xs text-muted-foreground ml-auto">{today.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          {loadingToday ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : panchangamToday ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                {[
                  { label: t("tithi"), value: panchangamToday.tithi, icon: Moon },
                  { label: t("nakshatram"), value: panchangamToday.nakshatram, icon: Star },
                  { label: t("masam"), value: panchangamToday.masam, icon: Calendar },
                  { label: t("paksham"), value: panchangamToday.paksham, icon: Moon },
                  { label: t("vara"), value: panchangamToday.vara, icon: Sun },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-center p-4 bg-primary/5 rounded-xl">
                      <Icon className="w-4 h-4 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="font-serif font-semibold text-foreground text-sm">{item.value}</p>
                    </motion.div>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {panchangamToday.auspiciousTimings.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">Auspicious Times</p>
                    <ul className="space-y-1">{panchangamToday.auspiciousTimings.map(t => (
                      <li key={t} className="text-xs text-foreground/80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />{t}
                      </li>
                    ))}</ul>
                  </div>
                )}
                {panchangamToday.inauspiciousTimings.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-2">Inauspicious Times (Avoid)</p>
                    <ul className="space-y-1">{panchangamToday.inauspiciousTimings.map(t => (
                      <li key={t} className="text-xs text-foreground/80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{t}
                      </li>
                    ))}</ul>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Calendar */}
        <div className="bg-card border border-card-border rounded-2xl p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
            <h2 className="font-serif text-xl font-bold text-foreground">
              {MONTHS[viewDate.month - 1]} {viewDate.year}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const events = getEventsForDay(day);
              const anniversaries = events.filter(e => e.type === "anniversary");
              const reminders = events.filter(e => e.type === "reminder");

              return (
                <div key={day} className={cn(
                  "min-h-[60px] p-1 rounded-lg text-center relative transition-colors",
                  isToday(day) ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  events.length > 0 && !isToday(day) ? "bg-primary/5" : ""
                )}>
                  <span className={cn("text-sm font-medium", isToday(day) ? "text-primary-foreground" : "text-foreground")}>{day}</span>
                  <div className="space-y-0.5 mt-1">
                    {anniversaries.map(e => (
                      <div key={`a-${e.ancestorId}`} className="text-xs px-1 py-0.5 bg-destructive/20 text-destructive rounded truncate">
                        {e.ancestorName.split(" ")[0]}
                      </div>
                    ))}
                    {reminders.map(e => (
                      <div key={`r-${e.ancestorId}`} className="text-xs px-1 py-0.5 bg-accent/20 text-accent-foreground rounded truncate">
                        Reminder
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 justify-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded bg-destructive/20 flex-shrink-0" />
              Anniversary
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded bg-accent/20 flex-shrink-0" />
              Reminder
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
