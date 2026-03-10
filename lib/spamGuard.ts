import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash-lite-preview-09-2025";
const SPAM_THRESHOLD = 0.6;

/**
 * Fetches the claim from Supabase and builds the evaluation prompt.
 */
async function getPrompt(claimId: string): Promise<string> {
  // Create an admin supabase client using the role key to bypass RLS
  const supabase = createAdminClient();
  // Fetch claim and item data from supabase by the ID
  const { data: claim, error } = await supabase
    .from("claims")
    .select(
      `
      id,
      extra_descriptions,
      proof_of_ownerships,
      created_at,
      claimant (id, name),
      claimed_item:items!claim_claimed_item_fkey (
        id,
        name,
        category,
        description
      )
    `,
    )
    .eq("id", claimId)
    .single();
  // Error catching
  if (error || !claim) {
    throw new Error(`Failed to fetch claim ${claimId}: ${error?.message}`);
  }
  // Turn the JSON object into a string to put into the prompt
  const claimJson = JSON.stringify(claim, null, 2);

  return (
    "Evaluate how likely this ownership claim of a found item is to be spam or fraudulent. " +
    "Consider the plausibility of the description, whether it matches the item details, " +
    "and any suspicious patterns. " +
    "Respond with ONLY a single decimal number between 0 and 1 (e.g. 0.12), where 0 means " +
    "definitely legitimate and 1 means definitely spam. No other text.\n\n" +
    "Claim data:\n" +
    claimJson
  );
}

/**
 * Evaluates the spam likelihood of a claim using Gemini.
 * Returns a score from 0 (legitimate) to 1 (spam).
 */
export async function evaluateSpam(claimId: string): Promise<number> {
  // Get the custom prompt from the function given the claim ID
  const prompt = await getPrompt(claimId);
  // Create a GenAI instance securely using the API key in the .env file
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
// Generate the spam score
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: -1, // dynamic thinking for better responses
        includeThoughts: true,
      },
    },
  });
  // extract all response items
  const parts = response.candidates?.[0]?.content?.parts ?? [];

  // Log thinking to console
  const thoughts = parts
    .filter((p: { thought?: boolean }) => p.thought)
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (thoughts) {
    // Log thoughts for spamGuard
    console.log(
      `[spamGuard] Gemini thoughts for claim ${claimId}:\n${thoughts}`,
    );
  }

  // Extract only non-thought text parts
  const text = parts
    .filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();

  const score = parseFloat(text);
  if (isNaN(score)) {
    throw new Error(`Unexpected response from Gemini: "${text}"`);
  }

  return Math.min(1, Math.max(0, score));
}

/**
 * Fetches the item from Supabase and builds the evaluation prompt.
 */
async function getItemPrompt(itemId: string): Promise<string> {
  // Create a supabase instance using the service role key to bypass RLS
  const supabase = createAdminClient();
  // Get the item information from the supabase database.
  const { data: item, error } = await supabase
    .from("items")
    .select(
      `
      id,
      name,
      category,
      description,
      last_location,
      date_lost,
      posted_by (id, name)
    `,
    )
    .eq("id", itemId)
    .single();

  if (error || !item) {
    throw new Error(`Failed to fetch item ${itemId}: ${error?.message}`);
  }
  // Turn it into a string to put in the prompt
  const itemJson = JSON.stringify(item, null, 2);

  return (
    "Evaluate the following lost-and-found item listing for any policy violations. " +
    "Specifically consider: (1) spam or fake listings (e.g. nonsensical, duplicate, or " +
    "clearly fabricated content), (2) profanity or offensive language in any field, " +
    "(3) inappropriate or harmful content, and (4) suspicious patterns that suggest " +
    "misuse of the platform. " +
    "Respond with ONLY a single decimal number between 0 and 1 (e.g. 0.08), where 0 means " +
    "completely clean and legitimate, and 1 means definitely spam or inappropriate. No other text.\n\n" +
    "Item data:\n" +
    itemJson
  );
}

/**
 * Evaluates the spam/inappropriateness of a newly posted item using Gemini.
 * Returns a score from 0 (clean) to 1 (spam/inappropriate).
 */
export async function evaluateItem(itemId: string): Promise<number> {
  const prompt = await getItemPrompt(itemId);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: -1, // Dynamic thinking for better results
        includeThoughts: true,
      },
    },
  });
  // extract all response items
  const parts = response.candidates?.[0]?.content?.parts ?? [];

  const thoughts = parts
    .filter((p: { thought?: boolean }) => p.thought)
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (thoughts) {
    // Log thoughts for spamGuard
    console.log(`[spamGuard] Gemini thoughts for item ${itemId}:\n${thoughts}`);
  }

  const text = parts
    .filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();

  const score = parseFloat(text);
  if (isNaN(score)) {
    throw new Error(`Unexpected response from Gemini: "${text}"`);
  }

  return Math.min(1, Math.max(0, score));
}

export { SPAM_THRESHOLD };