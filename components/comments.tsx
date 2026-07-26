import Link from "next/link";
import { Calendar, MessageSquare, User } from "lucide-react";
import { getCommentsByArticleId } from "@/lib/data/comments";
import { auth } from "@/lib/auth/server";
import CreateCommentForm from "@/components/create-comment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface CommentsProps {
  articleId: number;
}

function AuthorInitial({
  name,
}: {
  name: string;
}) {

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground ring-1 ring-foreground/10"
    >
      {initial}
    </div>
  );
}

export default async function Comments({ articleId }: CommentsProps) {
  const [{ data: session }, comments] = await Promise.all([
    auth.getSession(),
    getCommentsByArticleId(articleId),
  ]);

  const isSignedIn = Boolean(session?.user);
  const count = comments.length;

  return (
    <section className="mt-10 space-y-6" aria-labelledby="comments-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2
            id="comments-heading"
            className="text-2xl font-semibold text-foreground"
          >
            Comments
          </h2>
          <Badge variant="secondary">
            {count} {count === 1 ? "comment" : "comments"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Join the discussion
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isSignedIn ? (
            <CreateCommentForm articleId={articleId} />
          ) : (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Sign in to share your thoughts on this article.
              </p>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/auth/sign-in" />}
                className="cursor-pointer"
              >
                Sign in to comment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {count === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
            <p className="font-medium text-foreground">No comments yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to start the conversation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const authorName = comment.author?.name ?? "Unknown";

            return (
              <li key={comment.id}>
                <Card size="sm">
                  <CardContent className="pt-1">
                    <div className="flex gap-3">
                      <AuthorInitial
                        name={authorName}
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center font-medium text-foreground">
                            <User className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                            {authorName}
                          </span>
                          <span className="inline-flex items-center">
                            <Calendar className="mr-1 h-3.5 w-3.5" />
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-foreground leading-7">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
