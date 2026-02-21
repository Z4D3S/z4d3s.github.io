import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()),
    category: z.enum([
      'forensics', 
      'incident-response', 
      'threat-hunting', 
      'malware-analysis', 
      'log-analysis',
      'defense', 
      'tools', 
      'tutorials'
    ]),
    draft: z.boolean().default(false),
    author: z.string().default('NightOps Team')
  })
});

export const collections = { blog };
