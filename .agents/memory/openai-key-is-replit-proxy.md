---
name: OPENAI_API_KEY is a Replit AI Integrations key
description: Why raw OpenAI SDK calls 401 in this repo and how to wire the proxy
---

The `OPENAI_API_KEY` secret in this repo is a **Replit-managed AI Integrations key** (prefix ``), NOT a raw platform key from platform.openai.com.

**Symptom:** `new OpenAI({ apiKey: process.env.OPENAI_API_KEY })` against `api.openai.com` returns `401 Incorrect API key provided: `.

**Fix:** Provision proxy env vars once via the JS sandbox:
`setupReplitAIIntegrations({ providerSlug:"openai", providerUrlEnvVarName:"AI_INTEGRATIONS_OPENAI_BASE_URL", providerApiKeyEnvVarName:"AI_INTEGRATIONS_OPENAI_API_KEY" })`
then construct the client with `baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL` + `apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY`.

**Why:** Replit bills AI usage through its proxy; the `AQ.*` key is only valid against that proxy base URL.

**How to apply:** Any new OpenAI call in this repo must go through the proxy base URL. For a single stateless route, configuring `baseURL`+`apiKey` directly is fine; the full `@workspace/integrations-openai-ai-server` lib package is only needed for conversation/voice/image features.

**Verified facts (June 2026):** `gpt-5-mini` works on the proxy. PDFs work via chat-completions `{ type:"file", file:{ filename, file_data:"data:application/pdf;base64,..." } }` content part (NOT `image_url` — that is images only). gpt-5 models reject `temperature` and `max_tokens`; use `max_completion_tokens`.
