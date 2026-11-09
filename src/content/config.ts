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
      'reconnaissance',
      'web-exploitation',
      'privilege-escalation',
      'red-team-ops',
      'malware',
      'evasion',
      'forensics',
      'tools',
      'tutorials',
    ]),
    difficulty: z.enum(['easy', 'medium', 'hard', 'info']).default('medium'),
    draft: z.boolean().default(false),
    author: z.string().default('z4des'),
    event: z.string().optional(),
  }),
});

export const collections = { blog };
