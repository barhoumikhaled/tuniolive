import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import BlogListing from '@/components/blog/blog-listing'
import { sanityFetch } from '@/sanity/lib/fetch'
import { POSTS_COUNT_QUERY, POSTS_LIST_QUERY } from '@/sanity/lib/queries'
import { isSanityConfigured } from '@/sanity/env'
import type { BlogListPost } from '@/sanity/lib/types'

export const revalidate = 60

const PAGE_SIZE = 9

export const metadata: Metadata = {
  title: 'Blog · TuniOlive',
  description:
    'Stories, recipes, and insights from the TuniOlive family — discover the world of Tunisian olive oil.',
}

interface PageProps {
  searchParams?: Promise<{ page?: string }>
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {}
  const pageRaw = parseInt(sp.page ?? '1', 10)
  const requestedPage = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1

  const total = (await sanityFetch<number>({
    query: POSTS_COUNT_QUERY,
    revalidate: 60,
    tags: ['post'],
  })) ?? 0

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (requestedPage > totalPages) {
    redirect(totalPages === 1 ? '/blog' : `/blog?page=${totalPages}`)
  }

  const currentPage = requestedPage
  const start = (currentPage - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE

  const posts = (await sanityFetch<BlogListPost[]>({
    query: POSTS_LIST_QUERY,
    params: { start, end },
    revalidate: 60,
    tags: ['post'],
  })) ?? []

  return (
    <BlogListing
      posts={ posts }
      currentPage={ currentPage }
      totalPages={ totalPages }
      isConfigured={ isSanityConfigured }
    />
  )
}
