import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'

import BlogPostView from '@/components/blog/blog-post'
import { PreviewBanner } from '@/components/blog/preview-banner'
import { sanityFetch } from '@/sanity/lib/fetch'
import { POST_BY_SLUG_QUERY, POST_BY_SLUG_PREVIEW_QUERY, POST_SLUGS_QUERY } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import { isSanityConfigured } from '@/sanity/env'
import type { BlogPostDoc } from '@/sanity/lib/types'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  if (!isSanityConfigured) return []
  const slugs = (await sanityFetch<string[]>({
    query: POST_SLUGS_QUERY,
    revalidate: 60,
    tags: ['post'],
  })) ?? []
  return slugs.map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await sanityFetch<BlogPostDoc>({
    query: POST_BY_SLUG_QUERY,
    params: { slug },
    revalidate: 60,
    tags: ['post', `post:${slug}`],
  })
  if (!post) return { title: 'Blog · TuniOlive' }

  const title = post.title_en || post.title_fr || post.title_ar || 'TuniOlive Blog'
  const description = post.seoDescription_en || post.excerpt_en || post.seoDescription_fr || post.excerpt_fr || ''
  const builder = urlForImage(post.coverImage)
  const ogImage = builder ? builder.width(1200).height(630).url() : undefined

  return {
    title: `${title} · TuniOlive`,
    description,
    openGraph: {
      title, description, type: 'article',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const { isEnabled: isPreview } = await draftMode()

  const post = await sanityFetch<BlogPostDoc>({
    query: isPreview ? POST_BY_SLUG_PREVIEW_QUERY : POST_BY_SLUG_QUERY,
    params: { slug },
    revalidate: isPreview ? 0 : 60,
    tags: ['post', `post:${slug}`],
    preview: isPreview,
  })

  if (!post) notFound()

  return (
    <>
      { isPreview && <PreviewBanner slug={ slug } /> }
      <BlogPostView post={ post } />
    </>
  )
}