import { Router } from "express";
import { getAuth } from "@clerk/express";
import multer from "multer";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

const SYSTEM_PROMPT = `You are a loan document data extractor. Extract loan details from the provided document (image, PDF screenshot, JSON, or CSV).

Return ONLY a valid JSON object with these fields (use null for missing values):
{
  "borrowerName": string or null,
  "principalAmount": number or null,
  "interestRate": number or null (annual % rate),
  "startDate": "YYYY-MM-DD" or null,
  "dueDate": "YYYY-MM-DD" or null,
  "description": string or null,
  "confidence": "high" | "medium" | "low",
  "notes": string (brief explanation of what was extracted and any uncertainties)
}

Rules:
- principalAmount must be a plain number (no currency symbols), in Indian Rupees
- interestRate must be annual percentage (if monthly is given, multiply by 12)
- Dates must be YYYY-MM-DD format
- If the document is an amortization schedule, extract the original loan parameters from the header/summary
- Do NOT guess — use null if genuinely unclear
- Return ONLY the JSON, no markdown, no explanation`;

router.post("/", requireAuth, upload.single("file"), async (req: any, res) => {
  try {
    let buffer: Buffer;
    let mimetype: string;
    let originalname: string;

    if (req.file) {
      // Web: multipart/form-data upload
      buffer = req.file.buffer;
      mimetype = req.file.mimetype;
      originalname = req.file.originalname || "";
    } else if (req.body?.imageBase64) {
      // Mobile: JSON body { imageBase64, mimeType }
      buffer = Buffer.from(req.body.imageBase64, "base64");
      mimetype = req.body.mimeType || "image/jpeg";
      originalname = "";
    } else {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const ext = (originalname || "").toLowerCase().split(".").pop();

    const isImage =
      mimetype.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(ext ?? "");
    const isPdf = mimetype === "application/pdf" || ext === "pdf";
    const isText =
      mimetype === "application/json" ||
      mimetype === "text/csv" ||
      mimetype.startsWith("text/") ||
      ["json", "csv", "txt"].includes(ext ?? "");

    const b64 = buffer.toString("base64");
    let userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[];

    if (isImage) {
      const imageMediaType = mimetype.startsWith("image/") ? mimetype : "image/png";
      userContent = [
        {
          type: "image_url",
          image_url: { url: `data:${imageMediaType};base64,${b64}`, detail: "high" },
        },
        { type: "text", text: "Extract loan details from this document. Return only JSON." },
      ];
    } else if (isPdf) {
      // Chat completions accepts PDFs via the `file` content part (not image_url)
      userContent = [
        {
          type: "file",
          file: { filename: originalname || "document.pdf", file_data: `data:application/pdf;base64,${b64}` },
        },
        { type: "text", text: "Extract loan details from this document. Return only JSON." },
      ];
    } else if (isText) {
      const extractedText = buffer.toString("utf-8");
      userContent = [
        {
          type: "text",
          text: `Extract loan details from this document content:\n\n${extractedText.slice(0, 12000)}`,
        },
      ];
    } else {
      res.status(415).json({
        error: "Unsupported file type. Upload an image (PNG/JPG/WEBP), PDF, CSV, or JSON file.",
      });
      return;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });
    const result = response.choices[0]?.message?.content ?? "{}";

    const cleaned = result.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    req.log.info({ confidence: parsed.confidence }, "loan extraction complete");
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    req.log.error({ err }, "loan extraction failed");
    if (err instanceof SyntaxError) {
      res.status(422).json({ error: "AI returned invalid JSON — try a clearer document" });
      return;
    }
    res.status(500).json({ error: err.message ?? "Extraction failed" });
  }
});

export default router;
