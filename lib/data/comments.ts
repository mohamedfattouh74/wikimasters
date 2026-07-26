import db from "@/db";
import { comments, type NewComment } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getCommentsByArticleId(articleId: number) {
    try {
        const response = await db.query.comments.findMany({
            where: eq(comments.articleId, articleId),
            with: {
                author: true,
            },
            orderBy: [desc(comments.createdAt)],
        })
        return response;
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function createComment(
    data: Pick<NewComment, "content" | "articleId" | "authorId">,
) {
    try {
    const [comment] = await db
        .insert(comments)
        .values({
            content: data.content,
            articleId: data.articleId,
            authorId: data.authorId,
        })
        .returning();
        return comment;
    } catch (err) {
        console.error(err);
        return null;
    }
}
