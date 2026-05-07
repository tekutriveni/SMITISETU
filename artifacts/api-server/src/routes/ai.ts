import { Router, type IRouter } from "express";
import { db, ancestorsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { GenerateRemembranceMessageBody, GetRitualSuggestionsBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SPIRITUAL_QUOTES = [
  { quote: "The soul is never born nor dies at any time. It has not come into being, does not come into being, and will not come into being.", source: "Bhagavad Gita 2.20", language: "en" },
  { quote: "Whatever happened, happened for the good. Whatever is happening, is happening for the good. Whatever will happen, will also happen for the good.", source: "Bhagavad Gita", language: "en" },
  { quote: "Those who depart from this world without knowing who they are or what they truly desire have no freedom in all the worlds.", source: "Chandogya Upanishad", language: "en" },
  { quote: "The ancestors watch over us from the other side, guiding our steps on this sacred journey called life.", source: "Ancient Wisdom", language: "en" },
  { quote: "Pitru Devo Bhava — May the ancestors be like God to you. Honor them with gratitude and remembrance.", source: "Taittiriya Upanishad", language: "en" },
  { quote: "As a man casts off his worn-out clothes and takes on others that are new, so does the embodied soul cast off its worn-out bodies and takes on others that are new.", source: "Bhagavad Gita 2.22", language: "en" },
  { quote: "One who performs Shraddha with devotion, faith, and love ensures that their ancestors attain peace and liberation.", source: "Garuda Purana", language: "en" },
  { quote: "Remember the good deeds of your ancestors. Their blessings flow to you through the river of time.", source: "Telugu Proverb", language: "en" },
];

const RITUAL_SUGGESTIONS = [
  "Light a lamp (diya) with sesame oil or ghee in the ancestor's memory",
  "Offer water (Tarpan) to the ancestors while reciting their names",
  "Cook the ancestor's favorite foods as Prasadam offerings",
  "Donate food or clothes to the needy in the ancestor's name",
  "Recite the ancestor's name and perform Pinda Daan if possible",
  "Visit a nearby temple and offer flowers on behalf of the ancestor",
  "Plant a tree in the ancestor's memory to honor their legacy",
  "Gather family members to share memories and stories",
];

const FOOD_OFFERINGS = [
  "Rice with sesame seeds (til rice) — traditional Pitru Paksha offering",
  "Kheer (rice pudding) — sweet offering for ancestral blessings",
  "Ancestor's favorite home-cooked meal",
  "Fruits and flowers — pure sattvic offerings",
  "Til (sesame) ladoo — traditional for ancestral rites",
  "Banana and coconut — auspicious offerings",
];

const PRAYERS = [
  "Om Pitri Devaya Namaha — Salutations to the ancestor deity",
  "Pitru Tarpan Mantra: 'Om namo devabhyah pitribhyah...'",
  "Recite the ancestor's full name and gotra during prayers",
  "Chant the Mahamrityunjaya Mantra for the ancestor's liberation",
  "Read passages from Bhagavad Gita Chapter 2 (Sankhya Yoga)",
];

router.get("/ai/spiritual-quote", async (_req, res): Promise<void> => {
  const randomIndex = Math.floor(Math.random() * SPIRITUAL_QUOTES.length);
  res.json(SPIRITUAL_QUOTES[randomIndex]);
});

router.post("/ai/remembrance-message", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = GenerateRemembranceMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ancestor] = await db.select().from(ancestorsTable)
    .where(and(eq(ancestorsTable.id, parsed.data.ancestorId), eq(ancestorsTable.userId, req.userId!)));

  if (!ancestor) {
    res.status(404).json({ error: "Ancestor not found" });
    return;
  }

  const { occasion } = parsed.data;
  let message = "";

  if (occasion === "anniversary") {
    message = `Today, we remember the soul of ${ancestor.fullName} garu with deep love and reverence. On this sacred Vardhanti, we light a lamp in your memory and offer our heartfelt prayers. Your ${ancestor.relationship}'s wisdom and love continue to guide our family on this journey. May your soul rest in eternal peace and bless us from the divine realm. We carry your memories in our hearts, always.`;
    if (ancestor.tithi) {
      message += ` This auspicious ${ancestor.tithi} Tithi is a reminder of the sacred connection we share across worlds.`;
    }
  } else if (occasion === "birthday") {
    message = `On this day, we lovingly remember ${ancestor.fullName} garu, our beloved ${ancestor.relationship}. Though you are no longer with us in form, your spirit fills our hearts with warmth and guidance. We offer flowers, light, and love in your memory. Your life was a beautiful gift to this family — a gift we carry forward with gratitude and pride.`;
  } else {
    message = `${ancestor.fullName} garu — our cherished ${ancestor.relationship} — lives on in the memories we hold and the values we carry. The love you shared with this family does not fade; it grows stronger with each passing year. We remember you with joy, with gratitude, and with the quiet certainty that your spirit watches over us. Om Shanti.`;
  }

  res.json({ message, language: "en" });
});

router.post("/ai/ritual-suggestions", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = GetRitualSuggestionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ancestor] = await db.select().from(ancestorsTable)
    .where(and(eq(ancestorsTable.id, parsed.data.ancestorId), eq(ancestorsTable.userId, req.userId!)));

  if (!ancestor) {
    res.status(404).json({ error: "Ancestor not found" });
    return;
  }

  let suggestions = [...RITUAL_SUGGESTIONS];
  if (ancestor.traditions) {
    suggestions.unshift(`Follow family tradition: ${ancestor.traditions}`);
  }
  if (ancestor.ritualNotes) {
    suggestions.unshift(`Custom ritual note: ${ancestor.ritualNotes}`);
  }

  let foodOfferings = [...FOOD_OFFERINGS];
  if (ancestor.prasadamDetails) {
    foodOfferings.unshift(`Family Prasadam: ${ancestor.prasadamDetails}`);
  }

  res.json({
    suggestions: suggestions.slice(0, 6),
    foodOfferings: foodOfferings.slice(0, 5),
    prayers: PRAYERS,
  });
});

export default router;
