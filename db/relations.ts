import { relations } from "drizzle-orm";
import { articles, comments, userInNeonAuth } from "./schema";

const articleRelations = relations(articles, ({ many }) => ({
  comments: many(comments),
}));

const commentRelations = relations(comments, ({ one }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  author: one(userInNeonAuth, {
    fields: [comments.authorId],
    references: [userInNeonAuth.id],
  }),
}));

export { articleRelations, commentRelations };