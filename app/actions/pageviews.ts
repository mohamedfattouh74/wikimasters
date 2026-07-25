"use server";

import redis from "@/cache";
import sendCelebrationEmail from "@/email/celebration-email";

const milestones = [10, 25, 50, 100, 1000];

const keyFor = (id: number) => `pageviews:article:${id}`;

export async function incrementPageview(articleId: number) {
  const articleKey = keyFor(articleId);
  const newval = await redis.incr(articleKey);

  if (milestones.includes(newval)) {
    sendCelebrationEmail(articleId, newval);
  }
  return Number(newval);
}
