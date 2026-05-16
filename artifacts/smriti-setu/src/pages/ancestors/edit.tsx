import { useRoute, useLocation } from "wouter";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import {
  useGetAncestor, getGetAncestorQueryKey, getListAncestorsQueryKey,
  useUpdateAncestor, useListTithis, useListNakshatrams, useListMasams,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  fullName: z.string().min(2),
  relationship: z.string().min(1),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfDeath: z.string().min(1),
  dateOfBirth: z.string().optional(),
  placeOfDeath: z.string().optional(),
  photoUrl: z.string().optional(),
  tithi: z.string().optional(),
  nakshatram: z.string().optional(),
  masam: z.string().optional(),
  paksham: z.string().optional(),
  familySide: z.string().optional(),
  gotram: z.string().optional(),
  reminderDaysBefore: z.number().default(7),
  ritualNotes: z.string().optional(),
  traditions: z.string().optional(),
  favoriteMemories: z.string().optional(),
  prasadamDetails: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

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

const RELATIONSHIPS = ["Grandfather", "Grandmother", "Father", "Mother", "Uncle", "Aunt", "Brother", "Sister", "Spouse", "Other"];
const REMINDER_OPTIONS = [
  { value: 30, label: "1 month before" },
  { value: 15, label: "15 days before" },
  { value: 7, label: "7 days before" },
  { value: 1, label: "1 day before" },
];

export default function EditAncestor() {
  const [, params] = useRoute("/ancestors/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = Number(params?.id);

  const { data: ancestor, isLoading } = useGetAncestor(id, {
    query: { enabled: !!id, queryKey: getGetAncestorQueryKey(id) },
  });
  const updateMutation = useUpdateAncestor();
  const { data: tithis = [] } = useListTithis();
  const { data: nakshatrams = [] } = useListNakshatrams();
  const { data: masams = [] } = useListMasams();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "Male", reminderDaysBefore: 7 },
  });

  useEffect(() => {
    if (ancestor) {
      form.reset({
        fullName: ancestor.fullName,
        relationship: ancestor.relationship,
        gender: ancestor.gender as "Male" | "Female" | "Other",
        dateOfDeath: ancestor.dateOfDeath,
        dateOfBirth: ancestor.dateOfBirth ?? "",
        placeOfDeath: ancestor.placeOfDeath ?? "",
        photoUrl: ancestor.photoUrl ?? "",
        tithi: ancestor.tithi ?? "",
        nakshatram: ancestor.nakshatram ?? "",
        masam: ancestor.masam ?? "",
        paksham: ancestor.paksham ?? "",
        familySide: ancestor.familySide ?? "",
        gotram: ancestor.gotram ?? "",
        reminderDaysBefore: ancestor.reminderDaysBefore,
        ritualNotes: ancestor.ritualNotes ?? "",
        traditions: ancestor.traditions ?? "",
        favoriteMemories: ancestor.favoriteMemories ?? "",
        prasadamDetails: ancestor.prasadamDetails ?? "",
      });
    }
  }, [ancestor]);

  function onSubmit(data: FormData) {
    updateMutation.mutate({ id, data: {
      ...data,
      dateOfBirth: data.dateOfBirth || null,
      placeOfDeath: data.placeOfDeath || null,
      photoUrl: data.photoUrl || null,
      tithi: data.tithi || null,
      nakshatram: data.nakshatram || null,
      masam: data.masam || null,
      paksham: data.paksham || null,
      familySide: data.familySide || null,
      gotram: data.gotram || null,
      ritualNotes: data.ritualNotes || null,
      traditions: data.traditions || null,
      favoriteMemories: data.favoriteMemories || null,
      prasadamDetails: data.prasadamDetails || null,
    }}, {
      onSuccess: (a) => {
        queryClient.invalidateQueries({ queryKey: getListAncestorsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAncestorQueryKey(id) });
        toast({ title: "Updated", description: `${a.fullName} has been updated.` });
        setLocation(`/ancestors/${id}`);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error || "Failed to update", variant: "destructive" });
      },
    });
  }

  if (isLoading) {
    return <Layout><div className="max-w-3xl mx-auto space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation(`/ancestors/${id}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Edit Ancestor</h1>
            <p className="text-muted-foreground text-sm">{ancestor?.fullName}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Section title="Basic Details">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Full Name *</FormLabel>
                  <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="relationship" render={({ field }) => (
                <FormItem><FormLabel>Relationship *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dateOfDeath" render={({ field }) => (
                <FormItem><FormLabel>Date of Death *</FormLabel>
                  <FormControl><Input {...field} type="date" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Date of Birth</FormLabel>
                  <FormControl><Input {...field} type="date" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="placeOfDeath" render={({ field }) => (
                <FormItem><FormLabel>Place</FormLabel>
                  <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {field.value ? (
                        <div className="relative w-24 h-24">
                          <img src={field.value} alt="Ancestor" className="w-24 h-24 rounded-2xl object-cover border border-border" />
                          <button type="button" onClick={() => field.onChange("")}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                        </div>
                      ) : null}
                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <input type="file" accept="image/*" className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("file", file);
                            formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                            const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                              method: "POST", body: formData
                            });
                            const data = await res.json();
                            field.onChange(data.secure_url);
                          }}
                        />
                        <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-xl hover:border-primary/50 transition-colors text-sm text-muted-foreground">
                          📷 {field.value ? "Change Photo" : "Upload Photo"}
                        </div>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Section>

            <Section title="Panchangam Details">
              <FormField control={form.control} name="tithi" render={({ field }) => (
                <FormItem><FormLabel>Tithi</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select Tithi" /></SelectTrigger>
                      <SelectContent>{tithis.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl></FormItem>
              )} />
              <FormField control={form.control} name="nakshatram" render={({ field }) => (
                <FormItem><FormLabel>Nakshatram</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select Nakshatram" /></SelectTrigger>
                      <SelectContent>{nakshatrams.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl></FormItem>
              )} />
              <FormField control={form.control} name="masam" render={({ field }) => (
                <FormItem><FormLabel>Telugu Masam</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select Masam" /></SelectTrigger>
                      <SelectContent>{masams.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl></FormItem>
              )} />
              <FormField control={form.control} name="paksham" render={({ field }) => (
                <FormItem><FormLabel>Paksham</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select Paksham" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shukla">Shukla Paksham</SelectItem>
                        <SelectItem value="Krishna">Krishna Paksham</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl></FormItem>
              )} />
            </Section>

            <Section title="Family & Remembrance">
              <FormField control={form.control} name="familySide" render={({ field }) => (
                <FormItem><FormLabel>Family Side</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Select side" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maternal">Maternal</SelectItem>
                        <SelectItem value="Paternal">Paternal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl></FormItem>
              )} />
              <FormField control={form.control} name="gotram" render={({ field }) => (
                <FormItem><FormLabel>Gotram</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="reminderDaysBefore" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Remind me</FormLabel>
                  <FormControl>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{REMINDER_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl></FormItem>
              )} />
              <FormField control={form.control} name="ritualNotes" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Ritual Notes</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="traditions" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Traditions</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="favoriteMemories" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Favorite Memories</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="prasadamDetails" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Prasadam Details</FormLabel>
                  <FormControl><Textarea {...field} rows={2} /></FormControl></FormItem>
              )} />
            </Section>

            <div className="flex gap-3 justify-end pb-8">
              <Button type="button" variant="outline" onClick={() => setLocation(`/ancestors/${id}`)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
