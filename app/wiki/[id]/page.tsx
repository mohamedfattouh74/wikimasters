import Comments from "@/components/comments";
import WikiArticleViewer from "@/components/wiki-article-viewer";
import { getArticleById } from "@/lib/data/articles";
import { notFound } from "next/navigation";

interface ViewArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewArticlePage({
  params,
}: ViewArticlePageProps) {
  const { id } = await params;

  const canEdit = true;

  const article = await getArticleById(parseInt(id));

  if (!article) {
    notFound();
  }

  return (
    <WikiArticleViewer article={article} canEdit={canEdit}>
      <Comments articleId={Number(id)} />
    </WikiArticleViewer>
  );
}
