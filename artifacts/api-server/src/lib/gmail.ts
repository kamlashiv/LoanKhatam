import { extractFinancialsFromText, type ExtractResult } from "./ai-extract";

export class GmailNotConnectedError extends Error {
  constructor() {
    super("Gmail is not connected");
    this.name = "GmailNotConnectedError";
  }
}

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

// Search bank/card/loan related mail from the last ~6 months.
const FINANCE_QUERY =
  '(statement OR "credit card" OR loan OR EMI OR "minimum amount due" OR "payment due" OR "amount due" OR "outstanding") newer_than:180d';

function getReplitToken(): string | null {
  if (process.env.REPL_IDENTITY) {
    return "repl " + process.env.REPL_IDENTITY;
  }
  if (process.env.WEB_REPL_RENEWAL) {
    return "depl " + process.env.WEB_REPL_RENEWAL;
  }
  return null;
}

/**
 * Fetch a fresh Gmail OAuth access token from the Replit connector credential
 * proxy. Returns null when no Gmail account is connected to this Repl.
 * Never cache the token — it expires; always fetch fresh per request.
 */
async function getGmailAccessToken(): Promise<string | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = getReplitToken();
  if (!hostname || !xReplitToken) return null;

  const res = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=google-mail`,
    { headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken } },
  );
  if (!res.ok) return null;

  const data: any = await res.json();
  const connection = data?.items?.[0];
  const settings = connection?.settings;
  const token =
    settings?.access_token ||
    settings?.oauth?.credentials?.access_token ||
    null;
  return typeof token === "string" && token ? token : null;
}

export interface GmailStatus {
  connected: boolean;
  email: string | null;
}

export async function getGmailStatus(): Promise<GmailStatus> {
  const token = await getGmailAccessToken();
  if (!token) return { connected: false, email: null };

  try {
    const res = await fetch(`${GMAIL_API}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { connected: false, email: null };
    const data: any = await res.json();
    return { connected: true, email: data?.emailAddress ?? null };
  } catch {
    return { connected: false, email: null };
  }
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractBody(payload: any): string {
  if (!payload) return "";

  // Walk MIME parts, preferring text/plain.
  const collected: { mime: string; text: string }[] = [];
  const walk = (part: any) => {
    if (!part) return;
    const mime = part.mimeType ?? "";
    const body = part.body;
    if (body?.data && (mime === "text/plain" || mime === "text/html")) {
      collected.push({ mime, text: decodeBase64Url(body.data) });
    }
    if (Array.isArray(part.parts)) part.parts.forEach(walk);
  };
  walk(payload);

  const plain = collected.find((c) => c.mime === "text/plain");
  if (plain) return plain.text;
  const html = collected.find((c) => c.mime === "text/html");
  if (html) return stripHtml(html.text);
  return "";
}

function headerValue(payload: any, name: string): string {
  const headers = payload?.headers;
  if (!Array.isArray(headers)) return "";
  const h = headers.find(
    (x: any) => x?.name?.toLowerCase() === name.toLowerCase(),
  );
  return h?.value ?? "";
}

export interface GmailScanResult extends ExtractResult {
  emailsScanned: number;
}

const MAX_EMAILS = 25;
const MAX_TEXT = 20000;

/**
 * Search the connected Gmail inbox for finance-related mail, extract readable
 * text, and run it through the AI extractor. Returns detected (NOT saved)
 * cards and loans. Throws GmailNotConnectedError when no account is connected.
 */
export async function scanGmailForFinancials(): Promise<GmailScanResult> {
  const token = await getGmailAccessToken();
  if (!token) throw new GmailNotConnectedError();

  const authHeaders = { Authorization: `Bearer ${token}` };

  const listRes = await fetch(
    `${GMAIL_API}/messages?maxResults=${MAX_EMAILS}&q=${encodeURIComponent(FINANCE_QUERY)}`,
    { headers: authHeaders },
  );
  if (!listRes.ok) {
    if (listRes.status === 401 || listRes.status === 403) {
      throw new GmailNotConnectedError();
    }
    throw new Error(`Gmail list failed (${listRes.status})`);
  }

  const listData: any = await listRes.json();
  const ids: string[] = Array.isArray(listData?.messages)
    ? listData.messages.map((m: any) => m.id).filter(Boolean)
    : [];

  if (ids.length === 0) {
    return { cards: [], loans: [], emailsScanned: 0 };
  }

  const sections: string[] = [];
  for (const id of ids) {
    const msgRes = await fetch(`${GMAIL_API}/messages/${id}?format=full`, {
      headers: authHeaders,
    });
    if (!msgRes.ok) continue;
    const msg: any = await msgRes.json();
    const subject = headerValue(msg.payload, "Subject");
    const from = headerValue(msg.payload, "From");
    const body = extractBody(msg.payload).slice(0, 4000);
    const snippet = typeof msg.snippet === "string" ? msg.snippet : "";
    sections.push(
      `--- Email ---\nFrom: ${from}\nSubject: ${subject}\n${body || snippet}`,
    );
  }

  const combined = sections.join("\n\n").slice(0, MAX_TEXT);
  const result = await extractFinancialsFromText(combined, "Gmail");
  return { ...result, emailsScanned: ids.length };
}
