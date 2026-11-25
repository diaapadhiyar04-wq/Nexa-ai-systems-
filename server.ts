import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "GEMINI_API_KEY is not configured. Please add your API key in Settings > Secrets."
    ) as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseApiError(err: unknown): { status: number; message: string; code: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const anyErr = err as { status?: number; code?: string | number };
  let status = typeof anyErr?.status === "number" ? anyErr.status : 500;

  if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED")) {
    status = 429;
    return {
      status,
      code: "RESOURCE_EXHAUSTED",
      message:
        "Quota exhausted or billing-enabled API key required for this model. Select a billing-enabled key in Settings > Secrets to use paid image or video generation.",
    };
  }
  if (raw.includes("403") || raw.includes("PERMISSION_DENIED")) {
    status = 403;
    return {
      status,
      code: "PERMISSION_DENIED",
      message:
        "Permission denied for this model. Please verify your API key and billing permissions in Settings > Secrets.",
    };
  }
  if (raw.includes("400") || raw.includes("API_KEY_INVALID")) {
    status = 400;
    return {
      status,
      code: "INVALID_REQUEST",
      message: raw,
    };
  }
  if (raw.includes("404") || raw.includes("NOT_FOUND")) {
    status = 404;
    return {
      status,
      code: "NOT_FOUND",
      message: "Requested AI model endpoint was not found or is unavailable for your project.",
    };
  }

  return {
    status,
    code: "UPSTREAM_ERROR",
    message: raw || "Unexpected error while communicating with Gemini API.",
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.post("/api/assistant/chat", async (req, res) => {
    try {
      const { messages, workspaceContext } = req.body as {
        messages: Array<{ role: "user" | "assistant"; text: string }>;
        workspaceContext?: string;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "messages array is required." });
      }

      const ai = getAiClient();
      const conversationText = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n\n");

      const systemInstruction = `You are the NEXA AI SYSTEMS Operations Assistant.
You help businesses automate repetitive tasks, triage customer enquiries, streamline team operations, and design workflow automations.
Respond concisely, practically, and in plain executive language (no fluff or hype).
When relevant to the user's request, optionally include ONE concrete suggestedTask or ONE suggestedWorkflow in the structured output so the user can add it to their workspace in one click. Only include suggestedTask or suggestedWorkflow when genuinely useful.
Current workspace context:
${workspaceContext || "Standard business operations workspace."}`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: conversationText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Concise, actionable operational response to the user.",
              },
              suggestedTask: {
                type: Type.OBJECT,
                nullable: true,
                description: "Optional new task the user can add to their task board.",
                properties: {
                  title: { type: Type.STRING },
                  department: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  dueDate: { type: Type.STRING },
                },
              },
              suggestedWorkflow: {
                type: Type.OBJECT,
                nullable: true,
                description: "Optional automation workflow blueprint the user can add.",
                properties: {
                  name: { type: Type.STRING },
                  trigger: { type: Type.STRING },
                  condition: { type: Type.STRING },
                  action: { type: Type.STRING },
                  department: { type: Type.STRING },
                  hoursSavedPerWeek: { type: Type.NUMBER },
                },
              },
            },
            required: ["reply"],
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      const parsedErr = parseApiError(err);
      res.status(parsedErr.status).json({ error: parsedErr.message, code: parsedErr.code });
    }
  });

  app.post("/api/enquiries/draft-reply", async (req, res) => {
    try {
      const { enquiry, tone, industry } = req.body as {
        enquiry: {
          customerName: string;
          company: string;
          subject: string;
          priority: string;
          channel: string;
          messages: Array<{ sender: string; body: string; timestamp: string }>;
        };
        tone?: string;
        industry?: string;
      };

      if (!enquiry || !enquiry.subject) {
        return res.status(400).json({ error: "Enquiry details are required." });
      }

      const ai = getAiClient();
      const threadSummary = enquiry.messages
        .map((m) => `[${m.timestamp}] ${m.sender}: ${m.body}`)
        .join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Draft a ${tone || "Concise and professional"} customer response for this ${
          industry || "business"
        } enquiry.
Customer: ${enquiry.customerName} (${enquiry.company})
Channel: ${enquiry.channel}
Priority: ${enquiry.priority}
Subject: ${enquiry.subject}

Conversation history:
${threadSummary}

Write only the reply message body ready to send, signed by "Operations Team, NEXA Workspace". Keep it clear, specific, and accurate to the thread.`,
        config: {
          systemInstruction:
            "You draft clear, accurate, polite business customer replies with zero placeholders like [Insert X] unless strictly necessary.",
        },
      });

      res.json({ draft: (response.text ?? "").trim() });
    } catch (err) {
      const parsedErr = parseApiError(err);
      res.status(parsedErr.status).json({ error: parsedErr.message, code: parsedErr.code });
    }
  });

  app.post("/api/tasks/breakdown", async (req, res) => {
    try {
      const { title, department, industry } = req.body as {
        title: string;
        department?: string;
        industry?: string;
      };
      if (!title) {
        return res.status(400).json({ error: "Task title is required." });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Break down this operational task for a ${industry || "modern business"} team (${
          department || "Operations"
        }) into 3 to 5 clear, actionable checklist subtasks: "${title}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      const subtasks = JSON.parse((response.text ?? "[]").trim());
      res.json({ subtasks: Array.isArray(subtasks) ? subtasks : [] });
    } catch (err) {
      const parsedErr = parseApiError(err);
      res.status(parsedErr.status).json({ error: parsedErr.message, code: parsedErr.code });
    }
  });

  app.post("/api/media/generate-image", async (req, res) => {
    try {
      const { prompt, imageSize, aspectRatio } = req.body as {
        prompt: string;
        imageSize?: "1K" | "2K" | "4K";
        aspectRatio?: "1:1" | "16:9" | "4:3" | "3:4" | "9:16";
      };

      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const validSizes = ["1K", "2K", "4K"] as const;
      const resolvedSize = validSizes.includes(imageSize as "1K" | "2K" | "4K")
        ? imageSize
        : "1K";
      const validRatios = ["1:1", "16:9", "4:3", "3:4", "9:16"];
      const resolvedRatio = aspectRatio && validRatios.includes(aspectRatio) ? aspectRatio : "1:1";

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: {
          parts: [{ text: prompt.trim() }],
        },
        config: {
          imageConfig: {
            aspectRatio: resolvedRatio,
            imageSize: resolvedSize,
          },
        },
      });

      let imageUrl: string | null = null;
      let captionText = "";

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          captionText += part.text;
        }
      }

      if (!imageUrl) {
        return res.status(502).json({
          error: "The model did not return an image asset. Try refining your prompt.",
        });
      }

      res.json({
        imageUrl,
        caption: captionText.trim(),
        imageSize: resolvedSize,
        aspectRatio: resolvedRatio,
      });
    } catch (err) {
      const parsedErr = parseApiError(err);
      res.status(parsedErr.status).json({ error: parsedErr.message, code: parsedErr.code });
    }
  });

  app.post("/api/media/animate-image", async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt, aspectRatio } = req.body as {
        imageBase64: string;
        mimeType: string;
        prompt: string;
        aspectRatio?: "16:9" | "9:16";
      };

      if (!imageBase64) {
        return res.status(400).json({ error: "Please upload an image to animate." });
      }

      const resolvedRatio = aspectRatio === "9:16" ? "9:16" : "16:9";
      const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      const resolvedMime = mimeType || "image/png";

      const ai = getAiClient();
      const interaction = await ai.interactions.create(
        {
          model: "gemini-omni-1.2-flash",
          input: [
            {
              type: "image",
              mime_type: resolvedMime,
              data: cleanBase64,
            },
            {
              type: "text",
              text:
                (prompt && prompt.trim()) ||
                "Subtle, realistic camera motion bringing the scene to life with smooth lighting.",
            },
          ],
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: "video",
            aspect_ratio: resolvedRatio,
          },
        },
        { timeout: 300000 }
      );

      const videoPart = interaction.output_video;
      if (!videoPart || (!videoPart.data && !videoPart.uri)) {
        return res.status(502).json({
          error: "Video generation completed without a playable video payload.",
        });
      }

      const videoMime = videoPart.mime_type || "video/mp4";
      const videoUrl = videoPart.data
        ? `data:${videoMime};base64,${videoPart.data}`
        : videoPart.uri;

      res.json({
        videoUrl,
        mimeType: videoMime,
        aspectRatio: resolvedRatio,
      });
    } catch (err) {
      const parsedErr = parseApiError(err);
      res.status(parsedErr.status).json({ error: parsedErr.message, code: parsedErr.code });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NEXA AI SYSTEMS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
