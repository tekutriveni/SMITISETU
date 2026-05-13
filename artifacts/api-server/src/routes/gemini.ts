import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db/schema";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

const SYSTEM_PROMPT = (language: string) => `You are SmritiSetu AI Assistant — a sacred spiritual guide for Telugu Hindu families. You must ALWAYS respond in ${language} only — never mix languages. You can answer ANY question the user asks — general knowledge, daily life, spiritual topics, anything. But for topics related to Vardhanti, Tithi, Nakshatram, Panchangam, Amavasya, Ekadashi, Shraddha karma, ancestor remembrance, Hindu rituals and prasadam — give especially detailed, warm and knowledgeable answers. You are deeply familiar with Telugu culture, traditions, Bhagavad Gita, Upanishads, and Vedic wisdom. Always respond with warmth, compassion and spiritual depth. Address the user respectfully.`;

// GET /api/gemini/conversations
router.get("/gemini/conversations", async (req, res) => {
  try {
    const rows = await db.select().from(conversations).orderBy(asc(conversations.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

// POST /api/gemini/conversations
router.post("/gemini/conversations", async (req, res) => {
  try {
    const { title } = req.body as { title: string };
    const [row] = await db.insert(conversations).values({ title: title ?? "New Chat" }).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// GET /api/gemini/conversations/:id
router.get("/gemini/conversations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) return res.status(404).json({ error: "Not found" });
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
    res.json({ ...conv, messages: msgs });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

// DELETE /api/gemini/conversations/:id
router.delete("/gemini/conversations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(conversations).where(eq(conversations.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// POST /api/gemini/conversations/:id/messages  (SSE stream)
router.post("/gemini/conversations/:id/messages", async (req, res) => {
  try {
    const convId = Number(req.params.id);
    const { content, language = "English" } = req.body as { content: string; language?: string };

    // Save user message
    await db.insert(messages).values({ conversationId: convId, role: "user", content });

    // Load full history
    const history = await db.select().from(messages).where(eq(messages.conversationId, convId)).orderBy(asc(messages.createdAt));

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        systemInstruction: SYSTEM_PROMPT(language),
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    // Save assistant message
    await db.insert(messages).values({ conversationId: convId, role: "assistant", content: fullResponse });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err);
    res.write(`data: ${JSON.stringify({ error: "Something went wrong, please try again" })}\n\n`);
    res.end();
  }
});

export default router;
