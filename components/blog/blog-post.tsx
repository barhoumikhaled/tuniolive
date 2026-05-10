'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { useLanguage } from '@/contexts/language-context'
import { urlForImage } from '@/sanity/lib/image'
import {
  pickLocalized,
  pickLocalizedBlocks,
  type BlogPostDoc,
  type BlogLanguage,
} from '@/sanity/lib/types'
import { BlogPortableText } from './portable-text'

export type { BlogPostDoc }

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

export default function BlogPostView({ post }: { post: BlogPostDoc }) {
  const { t, language, isRTL } = useLanguage()
  const title = pickLocalized(post, 'title', language) ?? ''
  const body = pickLocalizedBlocks(post, 'body', language) ?? []
  const date = formatDate(post.publishedAt, language)
  const byAuthor = post.author ? t('blog.byAuthor').replace('{author}', post.author) : ''
  const builder = urlForImage(post.coverImage)
  const cover = builder ? builder.width(1600).height(900).url() : null

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl" dir={ isRTL ? 'rtl' : 'ltr' }>
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        { isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" /> }
        { t('blog.back') }
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{ title }</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          { date ? <span>{ date }</span> : null }
          { date && byAuthor ? <span>·</span> : null }
          { byAuthor ? <span>{ byAuthor }</span> : null }
        </div>
      </header>

      { cover ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={ cover }
            alt={ post.coverImage?.alt || title }
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : null }

      <div className="prose prose-neutral mt-8 max-w-none">
        <BlogPortableText value={ body } />
      </div>

      <div className="mt-12 border-t pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          { isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" /> }
          { t('blog.back') }
        </Link>
      </div>
    </article>
  )
}
