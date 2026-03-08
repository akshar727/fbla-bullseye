import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash-lite-preview-06-17";

/**
 * Fetches the claim from Supabase and builds the evaluation prompt.
 */
async function getPrompt(claimId: string): Promise<string> {
  const supabase = createAdminClient();

  const { data: claim, error } = await supabase
    .from("claims")
    .select(
      `
      id,
      extra_descriptions,
      proof_of_ownerships,
      created_at,
      claimant:users!claims_claimant_fkey (id, name),
      claimed_item:items!claim_claimed_item_fkey (
        id,
        name,
        category,
        description,
        status,
        last_location,
        date_lost,
        date_found
      )
    `,
    )
    .eq("id", claimId)
    .single();

  if (error || !claim) {
    throw new Error(`Failed to fetch claim ${claimId}: ${error?.message}`);
  }

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
  const prompt = await getPrompt(claimId);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: -1, // dynamic thinking
        includeThoughts: false,
      },
    },
  });

  // Extract only non-thought text parts
  const text = (response.candidates?.[0]?.content?.parts ?? [])
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
