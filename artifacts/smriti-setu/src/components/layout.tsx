import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Home, Users, Calendar, Bell, Settings, LogOut, Menu, X, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clearAuthToken } from "@/lib/auth";
import { useGetUnreadNotificationCount } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: unreadData } = useGetUnreadNotificationCount();
  const unread = unreadData?.count ?? 0;
  const { t } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: Home },
    { href: "/ancestors", label: t("ancestors"), icon: Users },
    { href: "/panchangam", label: t("panchangam"), icon: Calendar },
    { href: "/notifications", label: t("notifications"), icon: Bell },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  function handleLogout() {
    clearAuthToken();
    setLocation("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-sidebar border-r border-sidebar-border shadow-lg",
        "transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
            <Flame className="w-5 h-5 text-primary-foreground diya-glow" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-sidebar-foreground leading-tight">{t("appName")}</h1>
            <p className="text-xs text-muted-foreground">Ancestor Remembrance</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors relative",
                    active
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                  {item.href === "/notifications" && unread > 0 && (
                    <Badge className="ml-auto text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-destructive text-destructive-foreground">
                      {unread > 9 ? "9+" : unread}
                    </Badge>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-3" />
            {t("logout")}
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary diya-glow" />
            <span className="font-serif font-bold text-foreground">{t("appName")}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
