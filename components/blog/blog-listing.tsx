'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { useLanguage } from '@/contexts/language-context'
import { urlForImage } from '@/sanity/lib/image'
import { pickLocalized, type BlogListPost, type BlogLanguage } from '@/sanity/lib/types'

export type { BlogListPost }

function formatDate(iso: string | undefined, lang: BlogLanguage) {
  if (!iso) return ''
  try {
    const locale = lang === 'fr' ? 'fr-FR' : lang === 'ar' ? 'ar' : 'en-US'
    return new Date(iso).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

interface BlogListingProps {
  posts: BlogListPost[]
  currentPage: number
  totalPages: number
  isConfigured: boolean
}

export default function BlogListing({ posts, currentPage, totalPages, isConfigured }: BlogListingProps) {
  const { t, language, isRTL } = useLanguage()

  if (!isConfigured) {
    return (
      <section className="container mx-auto px-4 py-16">
        
        <div className="mx-auto max-w-xl rounded-lg border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">{ t('blog.notConfigured') }</p>
        </div>
      </section>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16">
        
        <div className="mx-auto max-w-xl rounded-lg border bg-muted/30 p-12 text-center">
          <p className="text-lg">{ t('blog.empty') }</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-16" dir={ isRTL ? 'rtl' : 'ltr' }>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        { posts.map((post) => {
          const title = pickLocalized(post, 'title', language) ?? ''
          const excerpt = pickLocalized(post, 'excerpt', language) ?? ''
          const builder = urlForImage(post.coverImage)
          const cover = builder ? builder.width(800).height(500).url() : null
          const date = formatDate(post.publishedAt, language)
          const byAuthor = post.author
            ? t('blog.byAuthor').replace('{author}', post.author)
            : ''

          return (
            <Link
              key={ post._id }
              href={ `/blog/${post.slug}` }
              className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                { cover ? (
                  <Image
                    src={ cover }
                    alt={ post.coverImage?.alt || title }
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : null }
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  { date }
                  { byAuthor ? <span className="mx-2">·</span> : null }
                  { byAuthor }
                </div>
                <h2 className="mb-2 text-lg font-semibold leading-snug">{ title }</h2>
                <p className="line-clamp-3 text-sm text-muted-foreground">{ excerpt }</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  { t('blog.readMore') }
                  { isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" /> }
                </span>
              </div>
            </Link>
          )
        }) }
      </div>

      { totalPages > 1 ? (
        <nav className="mt-12 flex items-center justify-center gap-3">
          { currentPage > 1 ? (
            <Link
              href={ currentPage - 1 === 1 ? '/blog' : `/blog?page=${currentPage - 1}` }
              className="inline-flex items-center gap-1 rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              { isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" /> }
              { t('blog.previous') }
            </Link>
          ) : null }
          <span className="text-sm text-muted-foreground">
            { t('blog.pageOf').replace('{current}', String(currentPage)).replace('{total}', String(totalPages)) }
          </span>
          { currentPage < totalPages ? (
            <Link
              href={ `/blog?page=${currentPage + 1}` }
              className="inline-flex items-center gap-1 rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              { t('blog.next') }
              { isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" /> }
            </Link>
          ) : null }
        </nav>
      ) : null }
    </section>
  )
}
