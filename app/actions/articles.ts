"use server";


import {
  createArticle,
  deleteArticle,
  updateArticle,
} from "@/lib/data/articles";
import { redirect } from "next/navigation";
import authorizeUserToEditArticle from "@/db/authorization";
import {
  createArticleSchema,
  UpdateArticle,
  updateArticleSchema,
  NewArticle,
} from "@/db/schema";
import { z } from "zod";
import { summarizeArticle } from "@/ai/summarize";
import { getSession } from "@/lib/data/auth";
import slugify from "slugify";

export type CreateArticleInput = Pick<
  NewArticle,
  "title" | "content" | "imageUrl"
>;

export async function createArticleAction(data: CreateArticleInput) {
  console.log("createArticleAction called:", data);
  try {
    const session = await getSession();
    const authorId = session.user?.id;
    const validatedData = createArticleSchema.safeParse({...data, authorId, slug: slugify(data.title, { lower: true, strict: true })});
    if (!validatedData.success) {
      return {
        success: false as const,
        error: z.treeifyError(validatedData.error),
      };
    }
    console.log("✨ createArticle called:", data, authorId);
    const summary = await summarizeArticle(data.title || "", data.content || "");
    const result = await createArticle({ ...data, summary }, authorId);

    if (!result) {
      return { success: false as const, error: "Failed to create article." };
    }
    return { success: true as const, message: "Article created" };
  } catch (error) {
    console.error("Error creating article:", error);
    return { success: false as const, error: "Failed to create article.", message: error };
  }
}

export async function updateArticleAction(id: string, data: UpdateArticle) {
  try {
    const session = await getSession();
    const authorId = session.user?.id;
    const isAuthorized = await authorizeUserToEditArticle(authorId, Number(id));
    if (!isAuthorized) {
      return {
        success: false as const,
        error: "You are not authorized to update this article.",
      };
    }
    const validatedData = updateArticleSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false as const,
        error: z.treeifyError(validatedData.error),
      };
    }

    const summary = await summarizeArticle(data.title || "", data.content || "");

    const result = await updateArticle(Number(id), {
      ...validatedData.data,
      summary: summary ?? undefined,
    });
    if (!result) {
      return { success: false as const, error: "Failed to update article." };
    }
    console.log("✨ updateArticle called:", id, data, authorId);
    return { success: true as const, message: "Article updated" };
  } catch (error) {
    console.error("Error updating article:", error);
    return { success: false as const, error: "Failed to update article." };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    const session = await getSession();
    const authorId = session.user?.id;
    const isAuthorized = await authorizeUserToEditArticle(authorId, Number(id));
    if (!isAuthorized) {
      return {
        success: false as const,
        error: "You are not authorized to delete this article.",
      };
    }
    const result = await deleteArticle(Number(id));
    if (!result) {
      return { success: false as const, error: "Failed to delete article." };
    }
    console.log("🗑️ deleteArticle called:", id);
    return { success: true as const, message: "Article deleted" };
  } catch (error) {
    console.error("Error deleting article:", error);
    return { success: false as const, error: "Failed to delete article." };
  }
}

export async function deleteArticleForm(formData: FormData): Promise<void> {
  try {
    const session = await getSession();
    const authorId = session.user?.id;
    const id = formData.get("id");
    const isAuthorized = await authorizeUserToEditArticle(authorId, Number(id));
    if (!isAuthorized) {
      throw new Error("You are not authorized to delete this article.");
    }
    if (!id) {
      throw new Error("Missing article id");
    }

    await deleteArticle(Number(id));
    // After deleting, redirect the user back to the homepage.
    redirect("/");
  } catch (error) {
    console.error("Error deleting article:", error);
  }
}