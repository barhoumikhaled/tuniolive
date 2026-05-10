import { defineField, defineType } from 'sanity'

const portableTextBody = (lang: string) =>
  defineField({
    name: `body_${lang}`,
    title: `Body (${lang.toUpperCase()})`,
    type: 'array',
    group: lang,
    of: [
      {
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' },
          { title: 'H4', value: 'h4' },
          { title: 'Quote', value: 'blockquote' },
        ],
        lists: [
          { title: 'Bullet', value: 'bullet' },
          { title: 'Numbered', value: 'number' },
        ],
        marks: {
          decorators: [
            { title: 'Strong', value: 'strong' },
            { title: 'Emphasis', value: 'em' },
          ],
          annotations: [
            {
              name: 'link',
              type: 'object',
              title: 'Link',
              fields: [
                {
                  name: 'href',
                  type: 'url',
                  title: 'URL',
                  validation: (Rule) =>
                    Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
                },
                {
                  name: 'blank',
                  type: 'boolean',
                  title: 'Open in new tab',
                  initialValue: true,
                },
              ],
            },
          ],
        },
      },
      {
        type: 'image',
        options: { hotspot: true },
        fields: [
          {
            name: 'alt',
            type: 'string',
            title: 'Alt text',
          },
          {
            name: 'caption',
            type: 'string',
            title: 'Caption',
          },
        ],
      },
    ],
  })

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'shared', title: 'Shared', default: true },
    { name: 'en', title: 'English' },
    { name: 'fr', title: 'Français' },
    { name: 'ar', title: 'العربية' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title_en',
      title: 'Title (EN)',
      type: 'string',
      group: 'en',
      validation: (Rule) => Rule.required().min(2).max(200),
    }),
    defineField({
      name: 'title_fr',
      title: 'Title (FR)',
      type: 'string',
      group: 'fr',
    }),
    defineField({
      name: 'title_ar',
      title: 'Title (AR)',
      type: 'string',
      group: 'ar',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'shared',
      options: {
        source: 'title_en',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      group: 'shared',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'shared',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'shared',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt_en',
      title: 'Excerpt (EN)',
      type: 'text',
      rows: 3,
      group: 'en',
      validation: (Rule) => Rule.required().max(280),
    }),
    defineField({
      name: 'excerpt_fr',
      title: 'Excerpt (FR)',
      type: 'text',
      rows: 3,
      group: 'fr',
    }),
    defineField({
      name: 'excerpt_ar',
      title: 'Excerpt (AR)',
      type: 'text',
      rows: 3,
      group: 'ar',
    }),
    portableTextBody('en'),
    portableTextBody('fr'),
    portableTextBody('ar'),
    defineField({
      name: 'seoDescription_en',
      title: 'SEO description (EN)',
      type: 'text',
      rows: 2,
      group: 'seo',
      description: 'Optional. Falls back to excerpt if empty.',
    }),
    defineField({
      name: 'seoDescription_fr',
      title: 'SEO description (FR)',
      type: 'text',
      rows: 2,
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription_ar',
      title: 'SEO description (AR)',
      type: 'text',
      rows: 2,
      group: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Published date, newest',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title_en',
      author: 'author',
      media: 'coverImage',
      date: 'publishedAt',
    },
    prepare({ title, author, media, date }) {
      const subtitle = [author, date ? new Date(date).toLocaleDateString() : null]
        .filter(Boolean)
        .join(' · ')
      return {
        title: title || 'Untitled post',
        subtitle,
        media,
      }
    },
  },
})
