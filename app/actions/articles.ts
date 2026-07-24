"use server";

import { auth } from "@/lib/auth/server";
import { createArticle, deleteArticle, updateArticle } from "@/lib/data/articles";
import { redirect } from "next/navigation";
import authorizeUserToEditArticle from "@/db/authorization";

export type CreateArticleInput = {
  title: string;
  content: string;
  imageUrl?: string;
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
};

export async function createArticleAction(data: CreateArticleInput) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { success: false as const, error: "You must be signed in to create an article." };
  }
  const authorId = session.user.id;
  console.log("✨ createArticle called:", data, authorId);
  const result = await createArticle(data, authorId);
  
  if (!result) {
    return { success: false as const, error: "Failed to create article." };
  }
  return { success: true as const, message: "Article created" };
}

export async function updateArticleAction(id: string, data: UpdateArticleInput) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { success: false as const, error: "You must be signed in to update an article." };
  }
  const authorId = session.user.id;
  const isAuthorized = await authorizeUserToEditArticle(authorId, Number(id));
  if (!isAuthorized) {
    return { success: false as const, error: "You are not authorized to update this article." };
  }
  const result = await updateArticle(Number(id), data, authorId);
  if (!result) {
    return { success: false as const, error: "Failed to update article." };
  }
  console.log("✨ updateArticle called:", id, data, authorId);
  return { success: true as const, message: "Article updated" };
}

export async function deleteArticleAction(id: string) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { success: false as const, error: "You must be signed in to delete an article." };
  }
  const authorId = session.user.id;
  const isAuthorized = await authorizeUserToEditArticle(authorId, Number(id));
  if (!isAuthorized) {
    return { success: false as const, error: "You are not authorized to delete this article." };
  }
  const result = await deleteArticle(Number(id));
  if (!result) {
    return { success: false as const, error: "Failed to delete article." };
  }
  console.log("🗑️ deleteArticle called:", id);
  return { success: true as const, message: "Article deleted" };
}

// Form-friendly server action: accepts FormData from a client form and calls deleteArticle
export async function deleteArticleForm(formData: FormData): Promise<void> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    throw new Error("You must be signed in to delete an article.");
  }
  const authorId = session.user.id;
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
}