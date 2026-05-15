import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateAncestor, getListAncestorsQueryKey,
  useListTithis, useListNakshatrams, useListMasams
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfDeath: z.string().min(1, "Date of death is required"),
  dateOfBirth: z.string().optional(),
  placeOfDeath: z.string().optional(),
  photoUrl: z.string().optional(),
  tithi: z.string().optional(),
  nakshatram: z.string().optional(),
  masam: z.string().optional(),
  paksham: z.string().optional(),
  samvatsaram: z.string().optional(),
  teluguYearName: z.string().optional(),
  timeOfDeath: z.string().optional(),
  familySide: z.string().optional(),
  gotram: z.string().optional(),
  reminderDaysBefore: z.number().default(7),
  ritualNotes: z.string().optional(),
  traditions: z.string().optional(),
  favoriteMemories: z.string().optional(),
  prasadamDetails: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const RELATIONSHIPS = ["Grandfather", "Grandmother", "Father", "Mother", "Uncle", "Aunt", "Brother", "Sister", "Spouse", "Other"];
const REMINDER_OPTIONS = [
  { value: 30, label: "1 month before" },
  { value: 15, label: "15 days before" },
  { value: 7, label: "7 days before" },
  { value: 1, label: "1 day before" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <h2 className="font-serif font-semibold text-foreground mb-5 flex items-center gap-2">
        <Flame className="w-4 h-4 text-primary" />
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function AddAncestor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateAncestor();
  const { data: tithis = [] } = useListTithis();
  const { data: nakshatrams = [] } = useListNakshatrams();
  const { data: masams = [] } = useListMasams();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "Male", reminderDaysBefore: 7 },
  });

  function onSubmit(data: FormData) {
    createMutation.mutate({
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth || null,
        placeOfDeath: data.placeOfDeath || null,
        photoUrl: data.photoUrl || null,
        tithi: data.tithi || null,
        nakshatram: data.nakshatram || null,
        masam: data.masam || null,
        paksham: data.paksham || null,
        samvatsaram: data.samvatsaram || null,
        teluguYearName: data.teluguYearName || null,
        timeOfDeath: data.timeOfDeath || null,
        familySide: data.familySide || null,
        gotram: data.gotram || null,
        ritualNotes: data.ritualNotes || null,
        traditions: data.traditions || null,
        favoriteMemories: data.favoriteMemories || null,
        prasadamDetails: data.prasadamDetails || null,
      },
    }, {
      onSuccess: (ancestor) => {
        queryClient.invalidateQueries({ queryKey: getListAncestorsQueryKey() });
        toast({ title: "Ancestor added", description: `${ancestor.fullName} has been remembered.` });
        setLocation(`/ancestors/${ancestor.id}`);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error || "Failed to add ancestor", variant: "destructive" });
      },
    });
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/ancestors")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Add Ancestor</h1>
            <p className="text-muted-foreground text-sm">Record their sacred memory</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic details */}
            <Section title="Basic Details">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl><Input {...field} placeholder="Sri Ramulu Garu" data-testid="input-fullname" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="relationship" render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger data-testid="select-relationship"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dateOfDeath" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Death (Vardhanti) *</FormLabel>
                  <FormControl><Input {...field} type="date" data-testid="input-date-of-death" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth (optional)</FormLabel>
                  <FormControl><Input {...field} type="date" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="placeOfDeath" render={({ field }) => (
                <FormItem>
                  <FormLabel>Place</FormLabel>
                  <FormControl><Input {...field} placeholder="Hyderabad, Telangana" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Photo URL (optional)</FormLabel>
                  <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Section>

            {/* Panchangam */}
            <Section title="Spiritual / Panchangam Details">
              <FormField control={form.control} name="tithi" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tithi</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select Tithi" /></SelectTrigger>
                      <SelectContent>{tithis.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="nakshatram" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nakshatram</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select Nakshatram" /></SelectTrigger>
                      <SelectContent>{nakshatrams.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="masam" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telugu Masam</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select Masam" /></SelectTrigger>
                      <SelectContent>{masams.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="paksham" render={({ field }) => (
                <FormItem>
                  <FormLabel>Paksham</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select Paksham" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shukla">Shukla Paksham</SelectItem>
                        <SelectItem value="Krishna">Krishna Paksham</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="samvatsaram" render={({ field }) => (
                <FormItem>
                  <FormLabel>Samvatsaram (optional)</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Vikrama" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="teluguYearName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telugu Year Name</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Shubhakruti" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="timeOfDeath" render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Death (optional)</FormLabel>
                  <FormControl><Input {...field} type="time" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Section>

            {/* Family */}
            <Section title="Family Details">
              <FormField control={form.control} name="familySide" render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Side</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select side" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maternal">Maternal</SelectItem>
                        <SelectItem value="Paternal">Paternal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gotram" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gotram (optional)</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Kashyapa Gotram" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Section>

            {/* Remembrance */}
            <Section title="Remembrance Settings">
              <FormField control={form.control} name="reminderDaysBefore" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Remind me</FormLabel>
                  <FormControl>
                    <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {REMINDER_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="ritualNotes" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Ritual Notes</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Notes about the remembrance ceremony..." rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="traditions" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Important Traditions</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Family traditions to follow..." rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="favoriteMemories" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Favorite Memories</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Cherished memories..." rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="prasadamDetails" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Food Offerings / Prasadam</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Their favorite foods and prasadam details..." rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Section>

            <div className="flex gap-3 justify-end pb-8">
              <Button type="button" variant="outline" onClick={() => setLocation("/ancestors")}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-ancestor">
                {createMutation.isPending ? "Saving..." : "Add Ancestor"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
