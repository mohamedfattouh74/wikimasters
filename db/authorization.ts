import { eq } from "drizzle-orm";
import db from ".";
import { articles } from "./schema";

export default async function authorizeUserToEditArticle(userId: string, articleId: number) {
    const response = await db.select({
        authorId: articles.authorId,
    })
    .from(articles)
    .where(eq(articles.id, articleId));

    if (!response.length) {
        return false;
    }

    return response[0].authorId === userId;
}