import db from "@/db";
import {
  articles,
  NewArticle,
  UpdateArticle,
  userInNeonAuth,
} from "@/db/schema";
import { desc, eq, isNull } from "drizzle-orm";
import redis from "@/cache";

/** Matches the home-page select + Redis cache payload — not the full Article row. */
export type ArticleListItem = {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: string | null;
  createdAt: string;
  summary: string | null;
};

export async function getArticles(): Promise<ArticleListItem[]> {
  const cachedArticles = await redis.get<ArticleListItem[]>("articles:all");
  if (cachedArticles) {
    console.log("Articles cached returned");
    return cachedArticles;
  }

  console.log("Articles not cached, fetching from database");
  const response = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      author: userInNeonAuth.name,
      createdAt: articles.createdAt,
      summary: articles.summary,
    })
    .from(articles)
    .leftJoin(userInNeonAuth, eq(articles.authorId, userInNeonAuth.id))
    .orderBy(desc(articles.createdAt));

  await redis.set("articles:all", response, {
    ex: 60, // 60 seconds
  });
  return response;
}

export async function getArticlesWithoutSummary() {
  const response = await db
    .select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
    })
    .from(articles)
    .where(isNull(articles.summary));

  return response;
}

export async function getArticleById(id: number) {
  const response = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      author: userInNeonAuth.name,
      createdAt: articles.createdAt,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .leftJoin(userInNeonAuth, eq(articles.authorId, userInNeonAuth.id))
    .where(eq(articles.id, id));
  return response[0] ? response[0] : null;
}

export async function createArticle(
  data: Pick<NewArticle, "title" | "content" | "imageUrl" | "summary">,
  userId: string,
) {
  const response = await db.insert(articles).values({
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl ?? undefined,
    summary: data.summary ?? undefined,
    slug: `${Date.now()}`,
    published: true,
    authorId: userId,
  });
  await redis.del("articles:all");
  return response;
}

export async function updateArticle(id: number, data: UpdateArticle) {
  const response = await db
    .update(articles)
    .set({
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl ?? undefined,
      summary: data.summary ?? undefined,
    })
    .where(eq(articles.id, id));
  await redis.del("articles:all");

  return response;
}

export async function deleteArticle(id: number) {
  const response = await db.delete(articles).where(eq(articles.id, id));
  return response;
}