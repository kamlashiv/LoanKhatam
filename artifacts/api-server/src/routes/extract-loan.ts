import { Router } from "express";
import { getAuth } from "@clerk/express";
import multer from "multer";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { mimetype, buffer, originalname } = req.file;
    const ext = (originalname || "").toLowerCase().split(".").pop();

    let extractedText = "";
    let useVision = false;

    if (mimetype === "application/json" || ext === "json") {
      extractedText = buffer.toString("utf-8");
    } else if (mimetype === "text/csv" || ext === "csv") {
      extractedText = buffer.toString("utf-8");
    } else if (mimetype.startsWith("image/") || ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp") {
      useVision = true;
    } else if (mimetype === "application/pdf" || ext === "pdf") {
      useVision = true;
    } else {
      extractedText = buffer.toString("utf-8");
    }

    let result: string;

    if (useVision) {
      const b64 = buffer.toString("base64");
      const imageMediaType = mimetype.startsWith("image/") ? mimetype : "image/png";

      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${imageMediaType};base64,${b64}`, detail: "high" },
              },
              {
                type: "text",
                text: "Extract loan details from this document. Return only JSON.",
              },
            ],
          },
        ],
      });
      result = response.choices[0]?.message?.content ?? "{}";
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Extract loan details from this document content:\n\n${extractedText.slice(0, 12000)}`,
          },
        ],
      });
      result = response.choices[0]?.message?.content ?? "{}";
    }

    const cleaned = result.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    req.log.info({ confidence: parsed.confidence }, "loan extraction complete");
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    req.log.error({ err }, "loan extraction failed");
    if (err instanceof SyntaxError) {
      return res.status(422).json({ error: "AI returned invalid JSON — try a clearer document" });
    }
    res.status(500).json({ error: err.message ?? "Extraction failed" });
  }
});

export default router;
