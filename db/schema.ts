import {
  boolean,
  integer,
  pgSchema,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Managed by Neon Auth (Better Auth) — do not migrate/create these tables yourself.
export const neonAuth = pgSchema("neon_auth");

export const userInNeonAuth = neonAuth.table(
  "user",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    role: text(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [unique("user_email_key").on(table.email)],
);

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  published: boolean("published").notNull().default(false),
  authorId: uuid("author_id")
    .notNull()
    .references(() => userInNeonAuth.id),
  createdAt: timestamp("created_at", { mode: "string" , withTimezone: true}).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" , withTimezone: true}).defaultNow().notNull(),
  summary: text("summary"),
});


export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  articleId: integer("article_id")
    .notNull()
    .references(() => articles.id),
  authorId: uuid("author_id")
    .notNull()
    .references(() => userInNeonAuth.id),
  createdAt: timestamp("created_at", { mode: "string" , withTimezone: true}).defaultNow().notNull(),
})


const schema = { articles, userInNeonAuth, comments };
export default schema;

export const createArticleSchema = createInsertSchema(articles);
export const updateArticleSchema = createUpdateSchema(articles);
export const selectArticleSchema = createSelectSchema(articles);
export const createCommentSchema = createInsertSchema(comments);
export const updateCommentSchema = createUpdateSchema(comments);
export const selectCommentSchema = createSelectSchema(comments);

export type Article = z.infer<typeof selectArticleSchema>;
export type NewArticle = z.infer<typeof createArticleSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type Comment = z.infer<typeof selectCommentSchema>;
export type NewComment = z.infer<typeof createCommentSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;