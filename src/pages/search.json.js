import { getCollection } from 'astro:content';

export async function GET() {
  const posts = (await getCollection('blog'))
    .filter(post => !post.id.startsWith('.obsidian') && !post.id.startsWith('templates/') && !post.id.startsWith('Templates/') && post.id.endsWith('.md'));
  
  const filteredPosts = posts.filter(post => post.data.draft !== true);

  return new Response(JSON.stringify(filteredPosts.map(post => ({
    slug: post.slug,
    data: {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate.toISOString(),
      tags: post.data.tags,
      difficulty: post.data.difficulty
    }
  }))), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
