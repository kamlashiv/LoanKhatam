import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

router.post("/", async (req, res) => {
  const { imageBase64, mimeType } = req.body as {
    imageBase64?: string;
    mimeType?: string;
  };

  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: "imageBase64 and mimeType are required" });
    return;
  }

  const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validMimeTypes.includes(mimeType)) {
    res.status(400).json({ error: "Unsupported image type. Use JPEG, PNG, WEBP, or GIF." });
    return;
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `You are a loan document parser. Extract loan details from this image and return ONLY a valid JSON object with these exact keys (use null for any field you cannot find):
{
  "borrowerName": string or null,
  "principalAmount": number or null,
  "interestRate": number or null,
  "startDate": "YYYY-MM-DD" or null,
  "dueDate": "YYYY-MM-DD" or null,
  "description": string or null
}

Rules:
- principalAmount: the loan amount in numbers (no currency symbols)
- interestRate: annual interest rate as a percentage number (e.g. 12 for 12%)
- Dates must be in YYYY-MM-DD format
- description: a brief summary of the loan purpose if visible
- Return ONLY the JSON object, no markdown, no explanation`,
          },
        ],
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    res.status(500).json({ error: "Unexpected response from AI" });
    return;
  }

  const text = block.text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    res.status(422).json({ error: "Could not extract loan details from image" });
    return;
  }

  const extracted = JSON.parse(jsonMatch[0]);
  res.json(extracted);
});

export default router;
