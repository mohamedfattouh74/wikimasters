import { NextRequest, NextResponse } from "next/server";
import { eq, isNull } from "drizzle-orm";
import { summarizeArticle } from "@/ai/summarize";
import db from "@/db";
import { articles } from "@/db/schema";
import redis from "@/cache";
import { getArticlesWithoutSummary, updateArticle } from "@/lib/data/articles";

export async function GET(req: NextRequest) {
  if (
    process.env.NODE_ENV !== "development" &&
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  let updated = 0;

  const rows = await getArticlesWithoutSummary();

  for (const row of rows) {
    try {
      const summary = await summarizeArticle(row.title, row.content);
      if (summary && summary.trim().length > 0) {
        await updateArticle(row.id, { summary });
        updated++;
      }
    } catch (e) {
      console.error(`Failed to summarize id ${row.id}`);
    }
  }

  if (updated > 0) {
    try {
      await redis.del("articles:all");
    } catch (e) {
      console.error("Failed to clear articles cache", e);
    }
  }

  console.log(`Concluding AI Summary job , updated ${updated} rows`);

  return NextResponse.json({
    ok: true,
    updated,
  });
}
