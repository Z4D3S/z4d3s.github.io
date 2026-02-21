import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog').then(p => 
    p.filter(post => post.data.draft !== true)
  );

  return rss({
    title: 'NightOps - Blog de Ciberseguridad Blue Team',
    description: 'Blog técnico de ciberseguridad enfocado en defensa, detección y respuesta a incidentes.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>es-ES</language>`,
  });
}
