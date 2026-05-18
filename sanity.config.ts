'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from '@sanity/presentation'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'

const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuniolive.com'

export default defineConfig({
  basePath: '/studio',
  projectId: projectId || 'placeholder',
  dataset: dataset || 'production',
  schema,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Blog posts')
              .schemaType('post')
              .child(
                S.documentTypeList('post')
                  .title('Blog posts')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
              ),
          ]),
    }),
    // Presentation tool adds a "Preview" button in the studio sidebar
    presentationTool({
      previewUrl: {
        origin: productionUrl,
        previewMode: {
          enable: '/api/draft',
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})