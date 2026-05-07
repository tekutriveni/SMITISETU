import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Flame, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { setAuthToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: FormData) {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuthToken(res.token);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({
          title: "Sign in failed",
          description: err?.data?.error || "Invalid email or password",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-card-border rounded-3xl p-8 shadow-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20">
                <Flame className="w-8 h-8 text-primary diya-glow" />
              </div>
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to SmritiSetu</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          data-testid="input-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full py-6 text-base font-medium"
                disabled={loginMutation.isPending}
                data-testid="button-submit"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>New to SmritiSetu?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          A sacred space to honor your ancestors
        </p>
      </motion.div>
    </div>
  );
}
