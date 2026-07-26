"use client";

import { useActionState, useEffect, useRef } from "react";
import { MessageSquarePlus } from "lucide-react";
import {
  createCommentAction,
  type CreateCommentState,
} from "@/app/actions/comments";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateCommentFormProps {
  articleId: number;
}

export default function CreateCommentForm({
  articleId,
}: CreateCommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<
    CreateCommentState,
    FormData
  >(createCommentAction, null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="articleId" value={articleId} />

      <div className="space-y-2">
        <Label htmlFor="comment-content" className="text-foreground">
          Add a comment
        </Label>
        <textarea
          id="comment-content"
          name="content"
          required
          rows={3}
          maxLength={2000}
          disabled={isPending}
          placeholder="Share your thoughts on this article…"
          className={cn(
            "w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground md:text-sm",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
            "resize-y field-sizing-content min-h-20",
          )}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          {isPending ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
