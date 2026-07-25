import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function summarizeArticle(
  title: string,
  article: string,
): Promise<string | null> {
  if (!article.trim()) {
    throw new Error("Article content is required.");
  }
  const prompt = `Summarize the following wiki article in 1-2 concise sentences. Focus on the main idea and the most important details a reader should remember. Do not add opinions or unrelated information. Your goal is inform users of what the gist of a wiki article is so they can decide if they want to read more or not.\n\n<title>\n${title}</title>\n\n<wiki_content>\n${article}</wiki_content>`;

  try {
    const { text } = await generateText({
      model: google("gemini-3.5-flash"),
      system: "You are an assistant that writes concise factual summaries.",
      prompt,
    });
    return text.trim();
  } catch (error) {
    console.error("Error summarizing article:", error);
    return null;
  }
}
