import resend from "@/email";
import db from "@/db";
import { articles, userInNeonAuth } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/server";
import CelebrationTemplate from "./templates/celebration-template";

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export default async function sendCelebrationEmail(
  articleId: number,
  pageviews: number,
) {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return {
      success: false as const,
      error: "You must be signed in to create an article.",
    };
  }

  if (!session.user.email) {
    return;
  }

  const response = await db
    .select()
    .from(articles)
    .leftJoin(userInNeonAuth, eq(articles.authorId, userInNeonAuth.id))
    .where(eq(articles.id, articleId));

  const user = response[0]?.user;
  const article = response[0].articles;

  if (!user?.email) {
    console.log(
      `Skipping celebration email for ${articleId} on page views ${pageviews} could not find email for user`,
    );
    return;
  }

  const { email, id, name } = user;
  const { title } = article;

  const emailRes = await resend.emails.send({
    from: "Wikimasters <onboarding@resend.dev>",
    to: email,
    subject: `Your article on wikimasters got ${pageviews} views`,
    react: (
      <CelebrationTemplate
        articleTitle={title}
        articleUrl={`${BASE_URL}/wiki/${articleId}`}
        name={name ?? "Friend"}
        pageviews={pageviews}
      ></CelebrationTemplate>
    ),
  });

  if (!emailRes.error) {
    console.log(
      `email sent ${id} a celebration email for getting page views on article ${articleId}`,
    );
  } else {
    console.log(
      `error sending email ${id} a celebration email for getting page views on article ${articleId}`,
    );
  }
}
