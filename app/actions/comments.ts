"use server";

import { createComment } from "@/lib/data/comments";
import { getSession } from "@/lib/data/auth";
import { createCommentSchema } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCommentInputSchema = createCommentSchema.pick({
  content: true,
  articleId: true,
});

export type CreateCommentState = {
  success: boolean;
  error?: string;
  message?: string;
} | null;

export async function createCommentAction(
  _prevState: CreateCommentState,
  formData: FormData,
): Promise<CreateCommentState> {
  try {
    const session = await getSession();
    const authorId = session.user?.id;

    if (!authorId) {
      return { success: false, error: "You must be signed in to comment." };
    }

    const validated = createCommentInputSchema.safeParse({
      content: formData.get("content"),
      articleId: Number(formData.get("articleId")),
    });

    if (!validated.success) {
      return {
        success: false,
        error: z.prettifyError(validated.error),
      };
    }

    const content = validated.data.content.trim();
    if (!content) {
      return { success: false, error: "Comment cannot be empty." };
    }

    const comment = await createComment({
      content,
      articleId: validated.data.articleId,
      authorId,
    });

    if (!comment) {
      return { success: false, error: "Failed to post comment." };
    }

    revalidatePath(`/wiki/${validated.data.articleId}`);
    return { success: true, message: "Comment posted." };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Failed to post comment." };
  }
}
