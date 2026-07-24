import { CreateArticleInput, UpdateArticleInput } from "@/app/actions/articles";
import db from "@/db";
import { articles, userInNeonAuth } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getArticles() {
    const response = await db.select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        author: userInNeonAuth.name,
        createdAt: articles.createdAt,
    })
    .from(articles)
    .leftJoin(userInNeonAuth, eq(articles.authorId, userInNeonAuth.id))
    .orderBy(desc(articles.createdAt));
    return response;
}

export async function getArticleById(id: number) {
    const response = await db.select({
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

export async function createArticle(data: CreateArticleInput, userId: string) {
    const response = await db.insert(articles).values({
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        slug: `${Date.now()}`,
        published: true,
        authorId: userId,
    });
    return response;
}

export async function updateArticle(id: number, data: UpdateArticleInput, userId: string) {
    const response = await db.update(articles).set({
        title: data.title,
        content: data.content,
    }).where(eq(articles.id, id));
    return response;
}


export async function deleteArticle(id: number) {
    const response = await db.delete(articles).where(eq(articles.id, id));
    return response;
}