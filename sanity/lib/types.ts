import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImageSource } from '@sanity/image-url'

export type BlogLanguage = 'en' | 'fr' | 'ar'

export interface SanityImageWithAlt {
  _type?: 'image'
  asset?: {
    _ref?: string
    _type?: string
  }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
  caption?: string
}

export type LocalizedString<F extends string> = {
  [K in `${F}_${BlogLanguage}`]?: string
}

export type LocalizedBlocks<F extends string> = {
  [K in `${F}_${BlogLanguage}`]?: PortableTextBlock[]
}

export type BlogListPost = LocalizedString<'title'> &
  LocalizedString<'excerpt'> & {
    _id: string
    slug: string
    author?: string
    publishedAt?: string
    coverImage?: SanityImageWithAlt
  }

export type BlogPostDoc = BlogListPost &
  LocalizedBlocks<'body'> &
  LocalizedString<'seoDescription'>

export function pickLocalized<F extends string, O extends LocalizedString<F>>(
  obj: O,
  field: F,
  lang: BlogLanguage,
): string | undefined {
  return (
    obj[`${field}_${lang}` as keyof O] as string | undefined
  ) ?? (obj[`${field}_en` as keyof O] as string | undefined)
    ?? (obj[`${field}_fr` as keyof O] as string | undefined)
    ?? (obj[`${field}_ar` as keyof O] as string | undefined)
}

export function pickLocalizedBlocks<F extends string, O extends LocalizedBlocks<F>>(
  obj: O,
  field: F,
  lang: BlogLanguage,
): PortableTextBlock[] | undefined {
  return (
    obj[`${field}_${lang}` as keyof O] as PortableTextBlock[] | undefined
  ) ?? (obj[`${field}_en` as keyof O] as PortableTextBlock[] | undefined)
    ?? (obj[`${field}_fr` as keyof O] as PortableTextBlock[] | undefined)
    ?? (obj[`${field}_ar` as keyof O] as PortableTextBlock[] | undefined)
}

export type { SanityImageSource }
