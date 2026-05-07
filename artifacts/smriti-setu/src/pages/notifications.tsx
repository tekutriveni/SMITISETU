import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import {
  useListNotifications, getListNotificationsQueryKey,
  useMarkNotificationRead, useMarkAllNotificationsRead,
  getGetUnreadNotificationCountQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const unread = (notifications ?? []).filter(n => !n.isRead).length;

  function handleMarkRead(id: number) {
    markRead.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetUnreadNotificationCountQueryKey() });
      },
    });
  }

  function handleMarkAll() {
    markAll.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetUnreadNotificationCountQueryKey() });
        toast({ title: "All notifications marked as read" });
      },
    });
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={markAll.isPending}
              data-testid="button-mark-all-read">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-10 h-10 text-muted-foreground/40" />
              </div>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No notifications yet</h3>
            <p className="text-muted-foreground text-sm">Reminders will appear here as upcoming anniversaries approach.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-2xl border transition-all",
                    notif.isRead
                      ? "bg-card border-card-border"
                      : "bg-primary/5 border-primary/20 spiritual-glow"
                  )}
                  data-testid={`notification-${notif.id}`}
                >
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0",
                    notif.type === "reminder" ? "bg-primary/10" : "bg-accent/10"
                  )}>
                    <Bell className={cn("w-5 h-5", notif.type === "reminder" ? "text-primary" : "text-accent")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-medium", notif.isRead ? "text-foreground" : "text-foreground font-semibold")}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">{notif.type}</Badge>
                      {!notif.isRead && (
                        <button
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          onClick={() => handleMarkRead(notif.id)}
                          data-testid={`button-mark-read-${notif.id}`}
                        >
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
