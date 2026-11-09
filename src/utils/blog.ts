import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function isVisiblePost(post: BlogPost): boolean {
  return (
    !post.id.startsWith('.obsidian') &&
    !post.id.startsWith('templates/') &&
    !post.id.startsWith('Templates/') &&
    post.id.endsWith('.md') &&
    post.data.draft !== true
  );
}

export function isChallenge(post: BlogPost): boolean {
  return Boolean(post.data.event);
}

export function sortByDateDesc(a: BlogPost, b: BlogPost): number {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}
