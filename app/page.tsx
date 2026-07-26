import { WikiCard } from "@/components/wiki-card";
import { getArticles } from "@/lib/data/articles";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const articles = await getArticles();
  return (
    <div>
      <main className="max-w-2xl mx-auto my-10 flex flex-col gap-6">
      <Button className="cursor-pointer w-fit">
        <Link href="/wiki/edit/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4 mr-2" />
                <p>New Article</p>
        </Link>
        </Button>
        {articles.map(({ title, id, createdAt, author, summary }) => (
          <WikiCard
            title={title}
            author={author ? author : "Unknown"}
            date={createdAt}
            summary={summary ?? ""}
            href={`/wiki/${id}`}
            key={id}
          />
        ))}
      </main>
    </div>
  );
}
