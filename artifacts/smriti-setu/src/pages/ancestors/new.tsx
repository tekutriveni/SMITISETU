import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Flame, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Layout from "@/components/layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateAncestor,
  getListAncestorsQueryKey,
  useListTithis,
  useListNakshatrams,
  useListMasams,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

const NAKSHATRAMS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Moola",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishtha",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];
const TITHIS_LIST = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Amavasya",
];
const MASAMS_LIST = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashwina",
  "Kartika",
  "Margashira",
  "Pushya",
  "Magha",
  "Phalguna",
];
const SAMVATSARAMS = [
  "Prabhava",
  "Vibhava",
  "Shukla",
  "Pramodoota",
  "Prajothpatti",
  "Aangirasa",
  "Shrimukha",
  "Bhava",
  "Yuva",
  "Dhaata",
  "Eeshvara",
  "Bahudhanya",
  "Pramathi",
  "Vikrama",
  "Vrusha",
  "Chitrabhanu",
  "Swabhanu",
  "Tharana",
  "Parthiva",
  "Vyaya",
  "Sarvajith",
  "Sarvadhari",
  "Virodhi",
  "Vikriti",
  "Khara",
  "Nandana",
  "Vijaya",
  "Jaya",
  "Manmatha",
  "Durmukhi",
  "Hevilambi",
  "Vilambi",
  "Vikari",
  "Sharvari",
  "Plava",
  "Shubhakruti",
  "Sobhakruti",
  "Krodhi",
  "Vishwavasu",
  "Parabhava",
  "Plavanga",
  "Keelaka",
  "Saumya",
  "Sadharana",
  "Virodhikruth",
  "Paridhavi",
  "Pramadicha",
  "Ananda",
  "Rakshasa",
  "Nala",
  "Pingala",
  "Kalayuktha",
  "Siddharthi",
  "Raudra",
  "Durmathi",
  "Dundubhi",
  "Rudhirodgari",
  "Raktakshi",
  "Krodhana",
  "Akshaya",
];

function jd(y: number, m: number, d: number) {
  const a = Math.floor((14 - m) / 12),
    yr = y + 4800 - a,
    mo = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mo + 2) / 5) +
    365 * yr +
    Math.floor(yr / 4) -
    Math.floor(yr / 100) +
    Math.floor(yr / 400) -
    32045 -
    0.5 +
    (6 - 5.5) / 24
  );
}
function sunLong(j: number) {
  const T = (j - 2451545) / 36525,
    L0 = 280.46646 + 36000.76983 * T;
  const M = ((357.52911 + 35999.05029 * T) * Math.PI) / 180;
  return (
    (((L0 +
      (1.914602 - 0.004817 * T) * Math.sin(M) +
      0.019993 * Math.sin(2 * M)) %
      360) +
      360) %
    360
  );
}
function moonLong(j: number) {
  const T = (j - 2451545) / 36525;
  const L = 218.3164477 + 481267.88123421 * T;
  const M = ((357.5291092 + 35999.0502909 * T) * Math.PI) / 180;
  const Mp = ((134.9633964 + 477198.8675055 * T) * Math.PI) / 180;
  const D = ((297.8501921 + 445267.1114034 * T) * Math.PI) / 180;
  const F = ((93.272095 + 483202.0175233 * T) * Math.PI) / 180;
  const dL =
    6288774 * Math.sin(Mp) +
    1274027 * Math.sin(2 * D - Mp) +
    658314 * Math.sin(2 * D) +
    213618 * Math.sin(2 * Mp) -
    185116 * Math.sin(M) -
    114332 * Math.sin(2 * F) +
    58793 * Math.sin(2 * D - 2 * Mp) +
    57066 * Math.sin(2 * D - M - Mp) +
    53322 * Math.sin(2 * D + Mp) +
    45758 * Math.sin(2 * D - M) -
    40923 * Math.sin(Mp - 2 * F) -
    34720 * Math.sin(D) -
    30383 * Math.sin(Mp + M);
  return (((L + dL / 1000000) % 360) + 360) % 360;
}
function calcPanchangam(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const j = jd(y, m, d);

  // Ayanamsa (Lahiri) - Telugu Panchangam use చేసే system
  const T = (j - 2451545) / 36525;
  const ayanamsa =
    23.85 + 0.013646 * (y - 1900) - 0.000139 * Math.pow(y - 1900, 2);

  const sl = (((sunLong(j) - ayanamsa) % 360) + 360) % 360;
  const ml = (((moonLong(j) - ayanamsa) % 360) + 360) % 360;

  const diff = (((ml - sl) % 360) + 360) % 360;
  const nakshatram = NAKSHATRAMS[Math.floor(ml / (360 / 27)) % 27];
  const masam = MASAMS_LIST[Math.floor(sl / 30) % 12];
  const tyStart = m < 4 || (m === 3 && d < 15) ? y - 1 : y;
  const samvatsaram = SAMVATSARAMS[(tyStart - 1987 + 600) % 60];

  return {
    tithi: TITHIS_LIST[Math.floor(diff / 12)],
    paksham: diff < 180 ? "Shukla" : "Krishna",
    nakshatram,
    masam,
    samvatsaram,
  };
}

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

const RELATIONSHIPS = [
  "Grandfather",
  "Grandmother",
  "Father",
  "Mother",
  "Uncle",
  "Aunt",
  "Brother",
  "Sister",
  "Spouse",
  "Other",
];
const REMINDER_OPTIONS = [
  { value: 30, label: "1 month before" },
  { value: 15, label: "15 days before" },
  { value: 7, label: "7 days before" },
  { value: 1, label: "1 day before" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateAncestor();
  const { data: tithis = [] } = useListTithis();
  const { data: nakshatrams = [] } = useListNakshatrams();
  const { data: masams = [] } = useListMasams();
  const [autoFilled, setAutoFilled] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "Male", reminderDaysBefore: 7 },
  });

  const handleDateChange = useCallback(
    (dateStr: string) => {
      if (!dateStr) return;
      try {
        const p = calcPanchangam(dateStr);
        form.setValue("tithi", p.tithi, { shouldDirty: true });
        form.setValue("nakshatram", p.nakshatram, { shouldDirty: true });
        form.setValue("masam", p.masam, { shouldDirty: true });
        form.setValue("paksham", p.paksham, { shouldDirty: true });
        form.setValue("samvatsaram", p.samvatsaram, { shouldDirty: true });
        form.setValue("teluguYearName", p.samvatsaram, { shouldDirty: true });
        setAutoFilled(true);
      } catch {
        setAutoFilled(false);
      }
    },
    [form],
  );

  function onSubmit(data: FormData) {
    createMutation.mutate(
      {
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
      },
      {
        onSuccess: (ancestor) => {
          queryClient.invalidateQueries({
            queryKey: getListAncestorsQueryKey(),
          });
          toast({
            title: "Ancestor added",
            description: `${ancestor.fullName} has been remembered.`,
          });
          setLocation(`/ancestors/${ancestor.id}`);
        },
        onError: (err: any) => {
          toast({
            title: "Error",
            description: err?.data?.error || "Failed to add ancestor",
            variant: "destructive",
          });
        },
      },
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/ancestors")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Add Ancestor
            </h1>
            <p className="text-muted-foreground text-sm">
              Record their sacred memory
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Details */}
            <Section title="Basic Details">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Sri Ramulu Garu"
                        data-testid="input-fullname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship *</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger data-testid="select-relationship">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIPS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfDeath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Death (Vardhanti) *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        data-testid="input-date-of-death"
                        onChange={(e) => {
                          field.onChange(e);
                          handleDateChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="placeOfDeath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Hyderabad, Telangana" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Photo</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {field.value && (
                          <div className="relative w-24 h-24">
                            <img
                              src={field.value}
                              alt="Ancestor"
                              className="w-24 h-24 rounded-2xl object-cover border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => field.onChange("")}
                              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append(
                                "upload_preset",
                                import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                              );
                              const res = await fetch(
                                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                                { method: "POST", body: formData },
                              );
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
                )}
              />
            </Section>

            {/* Spiritual / Panchangam */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h2 className="font-serif font-semibold text-foreground mb-1 flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                Spiritual / Panchangam Details
              </h2>
              {autoFilled ? (
                <div className="flex items-center gap-2 text-xs text-emerald-600 mb-4">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Death date నుండి auto-fill అయింది — అవసరమైతే మార్చుకోవచ్చు
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Date of Death enter చేయగానే automatically fill అవుతుంది
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tithi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tithi</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <SelectTrigger
                            className={
                              autoFilled && field.value
                                ? "border-emerald-400"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select Tithi" />
                          </SelectTrigger>
                          <SelectContent>
                            {tithis.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nakshatram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nakshatram</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <SelectTrigger
                            className={
                              autoFilled && field.value
                                ? "border-emerald-400"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select Nakshatram" />
                          </SelectTrigger>
                          <SelectContent>
                            {nakshatrams.map((n) => (
                              <SelectItem key={n} value={n}>
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="masam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telugu Masam</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <SelectTrigger
                            className={
                              autoFilled && field.value
                                ? "border-emerald-400"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select Masam" />
                          </SelectTrigger>
                          <SelectContent>
                            {masams.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paksham"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paksham</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <SelectTrigger
                            className={
                              autoFilled && field.value
                                ? "border-emerald-400"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select Paksham" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Shukla">
                              Shukla Paksham
                            </SelectItem>
                            <SelectItem value="Krishna">
                              Krishna Paksham
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="samvatsaram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Samvatsaram</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Vikrama"
                          className={
                            autoFilled && field.value
                              ? "border-emerald-400"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teluguYearName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telugu Year Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Shubhakruti"
                          className={
                            autoFilled && field.value
                              ? "border-emerald-400"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Death (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Family */}
            <Section title="Family Details">
              <FormField
                control={form.control}
                name="familySide"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Side</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select side" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maternal">Maternal</SelectItem>
                          <SelectItem value="Paternal">Paternal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gotram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gotram (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Kashyapa Gotram" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            {/* Remembrance */}
            <Section title="Remembrance Settings">
              <FormField
                control={form.control}
                name="reminderDaysBefore"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Remind me</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        defaultValue={String(field.value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REMINDER_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={String(o.value)}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ritualNotes"
                render={({ field }) => {
                  const OPTIONS = [
                    "Perform Masoosavam / Vardhanti",
                    "Arrange Brahmin feast",
                    "Light deepam & agarbatti",
                    "Offer Pinda pradam",
                    "Sprinkle Ganga jalam",
                    "Special puja at temple",
                    "Recite Vedic mantras",
                    "Perform Gothram tarpanam",
                    "Arrange Anna danam",
                    "Go danam / Vasthra danam",
                    "Perform 16 upacharalu",
                    "Perform Sapindi karanam",
                  ];
                  const selected: string[] = field.value
                    ? field.value.split(", ").filter(Boolean)
                    : [];
                  const toggle = (opt: string) => {
                    const next = selected.includes(opt)
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    field.onChange(next.join(", "));
                  };
                  return (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Ritual Notes</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${selected.includes(opt) ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
                          >
                            {selected.includes(opt) ? "✓ " : ""}
                            {opt}
                          </button>
                        ))}
                      </div>
                      <Textarea
                        className="mt-2"
                        {...field}
                        placeholder="Additional notes..."
                        rows={2}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="traditions"
                render={({ field }) => {
                  const OPTIONS = [
                    "Amavasya river bath",
                    "Light lamps in Karthika masam",
                    "Special remembrance on Sankranthi",
                    "Family gathering on annual tithi",
                    "Pitru paksha tarpanam",
                    "Perform Dana dharmalu",
                    "Ekadashi fasting",
                    "Perform Shraddha karma",
                    "Special Mahalaya amavasya observance",
                    "Special puja during Navaratri",
                    "Karthika Somavaram fasting",
                    "Tulasi puja",
                  ];
                  const selected: string[] = field.value
                    ? field.value.split(", ").filter(Boolean)
                    : [];
                  const toggle = (opt: string) => {
                    const next = selected.includes(opt)
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    field.onChange(next.join(", "));
                  };
                  return (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Important Traditions</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${selected.includes(opt) ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
                          >
                            {selected.includes(opt) ? "✓ " : ""}
                            {opt}
                          </button>
                        ))}
                      </div>
                      <Textarea
                        className="mt-2"
                        {...field}
                        placeholder="Additional traditions..."
                        rows={2}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="favoriteMemories"
                render={({ field }) => {
                  const OPTIONS = [
                    "Always did early morning prayers",
                    "Used to recite Ramayanam / Bhagavatam",
                    "Did puja with great devotion",
                    "Respected elders greatly",
                    "Told stories to children",
                    "Was an excellent cook",
                    "Kept everyone happy with humor",
                    "Sang bhajans and keertanas",
                    "Loved gardening",
                    "Knew Ayurvedic remedies",
                    "Taught moral values to children",
                    "Kept the family united",
                    "Welcomed guests warmly",
                    "Chanted mantras and shlokas",
                    "Narrated Mahabharatam / Puranas",
                    "Told stories late at night",
                    "Led pujas at home",
                    "Spoke lovingly with everyone",
                  ];
                  const selected: string[] = field.value
                    ? field.value.split(", ").filter(Boolean)
                    : [];
                  const toggle = (opt: string) => {
                    const next = selected.includes(opt)
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    field.onChange(next.join(", "));
                  };
                  return (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Favorite Memories</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${selected.includes(opt) ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
                          >
                            {selected.includes(opt) ? "✓ " : ""}
                            {opt}
                          </button>
                        ))}
                      </div>
                      <Textarea
                        className="mt-2"
                        {...field}
                        placeholder="Additional memories..."
                        rows={2}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="prasadamDetails"
                render={({ field }) => {
                  const OPTIONS = [
                    "Pulihora",
                    "Payasam / Kheer",
                    "Vadapappu & Panakam",
                    "Garelu / Vada",
                    "Bobbatlu",
                    "Chalimidi",
                    "Kobbari mithai",
                    "Chakkara Pongali",
                    "Daddojanam / Curd rice",
                    "Modak / Kudumulu",
                    "Nuvvula Laddu",
                    "Banana / Fruits offering",
                    "Tamarind rice",
                    "Coconut rice",
                    "Milk / Panchamrutham",
                    "Sesame rice",
                  ];
                  const selected: string[] = field.value
                    ? field.value.split(", ").filter(Boolean)
                    : [];
                  const toggle = (opt: string) => {
                    const next = selected.includes(opt)
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    field.onChange(next.join(", "));
                  };
                  return (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Food Offerings / Prasadam</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${selected.includes(opt) ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
                          >
                            {selected.includes(opt) ? "✓ " : ""}
                            {opt}
                          </button>
                        ))}
                      </div>
                      <Textarea
                        className="mt-2"
                        {...field}
                        placeholder="Additional prasadam details..."
                        rows={2}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </Section>
            <div className="flex gap-3 justify-end pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/ancestors")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-save-ancestor"
              >
                {createMutation.isPending ? "Saving..." : "Add Ancestor"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
