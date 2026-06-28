import { Router } from "express";
import { clerkClient } from "@clerk/express";
import fs from "fs";
import path from "path";

const router = Router();
const CONFIG_PATH = path.join(__dirname, "../../admin_config.json");

const DEFAULT_CONFIG = {
  discountEnabled: true,
  planTitle: "Upgrade to Premium",
  regularPrice: 1000,
  offerPrice: 99,
  promoText: "Special Offer: Buy 1 Year, Get 1 Year Extra FREE!",
  features: [
    "AI Financial Assistant — Ask custom strategy questions",
    "Splitwise Group Split — Split expenses seamlessly with friends",
    "EMI vs SIP Planner — Smart arbitrage calculation"
  ]
};

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, "utf-8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    }
  } catch (e) {
    console.error("Failed to read admin config file, using defaults:", e);
  }
  return DEFAULT_CONFIG;
}

function writeConfig(data: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write admin config file:", e);
  }
}

const authorizeAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: Missing credentials" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "basic") {
    return res.status(401).json({ error: "Unauthorized: Invalid format" });
  }

  const token = parts[1];
  let credentials;
  try {
    credentials = Buffer.from(token, "base64").toString("utf-8");
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized: Invalid base64 encoding" });
  }

  const firstColon = credentials.indexOf(":");
  if (firstColon === -1) {
    return res.status(401).json({ error: "Unauthorized: Invalid credentials string" });
  }

  const username = credentials.slice(0, firstColon);
  const password = credentials.slice(firstColon + 1);

  const expectedUsername = process.env.ADMIN_USERNAME || "loankhatam.app@gmail.com";
  const expectedPassword = process.env.ADMIN_PASSWORD || "LoanKhatamAdmin2026!";

  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ error: "Unauthorized: Invalid username or password" });
  }

  next();
};

router.get("/admin/config", (req, res) => {
  const config = readConfig();
  return res.json(config);
});

router.post("/admin/config", authorizeAdmin, (req, res) => {
  const { discountEnabled, planTitle, regularPrice, offerPrice, promoText, features } = req.body;
  
  const current = readConfig();
  const updated = {
    discountEnabled: typeof discountEnabled === "boolean" ? discountEnabled : current.discountEnabled,
    planTitle: typeof planTitle === "string" ? planTitle : current.planTitle,
    regularPrice: typeof regularPrice === "number" ? regularPrice : current.regularPrice,
    offerPrice: typeof offerPrice === "number" ? offerPrice : current.offerPrice,
    promoText: typeof promoText === "string" ? promoText : current.promoText,
    features: Array.isArray(features) ? features : current.features,
  };

  writeConfig(updated);
  return res.json({ success: true, config: updated });
});

router.get("/admin/users", authorizeAdmin, async (req, res) => {
  try {
    // Fetch users from Clerk
    const response = await clerkClient.users.getUserList({
      limit: 100,
    });

    const users = response.data.map((user) => {
      const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress || "—";
      const phone = user.phoneNumbers.find((p) => p.id === user.primaryPhoneNumberId)?.phoneNumber || user.phoneNumbers[0]?.phoneNumber || "—";
      return {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email,
        phone,
        createdAt: new Date(user.createdAt).toISOString(),
      };
    });

    return res.json({ users });
  } catch (error: any) {
    console.error("Failed to list users from Clerk:", error);
    return res.status(500).json({ error: "Failed to fetch user list from Clerk" });
  }
});

export default router;
