import WikiEditor from "@/components/wiki-editor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Article",
  description: "Create a new article",
}

export default function NewArticlePage() {
  return <WikiEditor isEditing={false} />;
}