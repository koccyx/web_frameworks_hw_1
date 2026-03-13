import { env } from "../../config/env";
import { z } from "zod";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with"
]);

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

const matchResultSchema = z.object({
  score: z.number().min(0).max(1),
  missingKeywords: z.array(z.string()),
  overlapKeywords: z.array(z.string()),
  suggestions: z.array(z.string()).min(1),
  resumeImprovements: z.array(z.string()).optional()
});

export type MatchResult = z.infer<typeof matchResultSchema>;

export const calculateHeuristicMatch = (resumeText: string, vacancyText: string): MatchResult => {
  const resumeSet = new Set(tokenize(resumeText));
  const vacancySet = new Set(tokenize(vacancyText));

  const overlapKeywords = [...resumeSet].filter((keyword) => vacancySet.has(keyword));
  const missingKeywords = [...vacancySet].filter((keyword) => !resumeSet.has(keyword));
  const union = new Set([...resumeSet, ...vacancySet]);
  const score = union.size === 0 ? 0 : Number((overlapKeywords.length / union.size).toFixed(2));

  const suggestions: string[] = [];

  if (missingKeywords.length > 0) {
    suggestions.push("Add missing keywords to your resume when they reflect real experience.");
  }

  if (overlapKeywords.length > 0) {
    suggestions.push("Emphasize overlapping skills with concrete achievements.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Add more specific skills and domain terms to both texts.");
  }

  return matchResultSchema.parse({
    score,
    missingKeywords,
    overlapKeywords,
    suggestions
  });
};

const extractJsonObject = (content: string): string => {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response does not contain JSON object");
  }

  return content.slice(start, end + 1);
};

export const calculateLlmMatch = async (
  resumeText: string,
  vacancyText: string
): Promise<MatchResult> => {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const systemPrompt =
    "You are an expert recruiter. Compare resume text with vacancy text and return ONLY valid JSON.";

  const userPrompt = `Analyze the resume against the vacancy and provide actionable feedback.

Return strictly JSON with this exact shape:
{
  "score": number from 0 to 1,
  "missingKeywords": string[],
  "overlapKeywords": string[],
  "suggestions": string[],
  "resumeImprovements": string[]
}

Rules:
- score must be rounded to 2 decimals.
- suggestions should explain how to adjust the resume to this vacancy.
- resumeImprovements must be concrete rewrite actions (bullet-style short sentences).
- Do not include markdown or any text outside JSON.

Resume:
${resumeText}

Vacancy:
${vacancyText}`;

  const response = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": env.OPENROUTER_APP_URL,
      "X-Title": "resume-platform-core-service"
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${details}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned empty content");
  }

  const jsonObject = extractJsonObject(content);
  const parsed = JSON.parse(jsonObject) as unknown;
  return matchResultSchema.parse(parsed);
};
