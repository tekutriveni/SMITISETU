import { useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Globe, Camera, LogOut, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { useGetMe, getGetMeQueryKey, useUpdateProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuthToken } from "@/lib/auth";
import { useLocation } from "wouter";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  language: z.enum(["en", "te", "hi"]),
  photoUrl: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Settings() {
  const { data: me } = useGetMe();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateProfile();
  const [, setLocation] = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", language: "en", photoUrl: "" },
  });

  useEffect(() => {
    if (me) {
      form.reset({
        name: me.name,
        language: me.language as "en" | "te" | "hi",
        photoUrl: me.photoUrl ?? "",
      });
    }
  }, [me]);

  function onSubmit(data: FormData) {
    updateMutation.mutate({ data: {
      name: data.name,
      language: data.language,
      photoUrl: data.photoUrl || null,
    }}, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Profile updated", description: "Your settings have been saved." });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error || "Failed to update", variant: "destructive" });
      },
    });
  }

  function handleLogout() {
    clearAuthToken();
    setLocation("/");
  }

  const initials = me?.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your profile and preferences</p>
        </div>

        {/* Profile avatar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-card-border rounded-2xl p-6 spiritual-glow"
        >
          <div className="flex items-center gap-5 mb-6">
            {me?.photoUrl ? (
              <img src={me.photoUrl} alt={me.name} className="w-20 h-20 rounded-full object-cover border-4 border-primary/20" />
            ) : (
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20">
                <span className="font-serif font-bold text-primary text-xl">{initials}</span>
              </div>
            )}
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">{me?.name}</h2>
              <p className="text-muted-foreground text-sm">{me?.email}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name</FormLabel>
                  <FormControl><Input {...field} data-testid="input-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="language" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Globe className="w-4 h-4" /> Language</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
                        <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Camera className="w-4 h-4" /> Photo URL (optional)</FormLabel>
                  <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-settings">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </motion.div>

        {/* App info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-card-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-primary diya-glow" />
            <h2 className="font-serif font-semibold text-foreground">About SmritiSetu</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            SmritiSetu (స్మృతి సేతు) is a sacred digital space to honor and remember your ancestors.
            Keep their memory alive through Vardhanti reminders, Panchangam dates, ritual notes, and
            AI-generated remembrance messages.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="font-medium text-foreground mb-1">Telugu Panchangam</p>
              <p>Tithi, Nakshatram, Masam tracking</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="font-medium text-foreground mb-1">Smart Reminders</p>
              <p>Automatic yearly anniversary alerts</p>
            </div>
          </div>
        </motion.div>

        {/* Sign out */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6">
          <h2 className="font-serif font-semibold text-foreground mb-2">Sign Out</h2>
          <p className="text-sm text-muted-foreground mb-4">You will be signed out of your SmritiSetu account.</p>
          <Button variant="destructive" onClick={handleLogout} data-testid="button-logout-settings">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
