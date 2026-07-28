import WikiEditor from "@/components/wiki-editor";
import { getArticleById } from "@/lib/data/articles";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Article",
  description: "Edit an article",
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } = await params;

  const article = await getArticleById(Number(id));
  if (!article) {
    notFound();
  }
  return (
    <WikiEditor
      initialTitle={article?.title}
      initialContent={article?.content}
      isEditing={true}
      articleId={id}
    />
  );
}