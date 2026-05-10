'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'

import { urlForImage } from '@/sanity/lib/image'
import type { SanityImageWithAlt } from '@/sanity/lib/types'

interface LinkValue {
  href?: string
  blank?: boolean
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="my-4 leading-relaxed text-base">{ children }</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 text-2xl font-semibold tracking-tight">{ children }</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight">{ children }</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-2 text-lg font-semibold tracking-tight">{ children }</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-s-4 border-primary/50 ps-4 italic text-muted-foreground">
        { children }
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 ms-6 list-disc space-y-2">{ children }</ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 ms-6 list-decimal space-y-2">{ children }</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{ children }</li>,
    number: ({ children }) => <li className="leading-relaxed">{ children }</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{ children }</strong>,
    em: ({ children }) => <em className="italic">{ children }</em>,
    link: ({ value, children }) => {
      const link = (value ?? {}) as LinkValue
      const href = link.href ?? '#'
      const isExternal = /^https?:\/\//.test(href)
      const target = link.blank ?? isExternal ? '_blank' : undefined
      const rel = target === '_blank' ? 'noopener noreferrer' : undefined
      if (isExternal) {
        return (
          <a href={ href } target={ target } rel={ rel } className="text-primary underline underline-offset-4">
            { children }
          </a>
        )
      }
      return (
        <Link href={ href } className="text-primary underline underline-offset-4">
          { children }
        </Link>
      )
    },
  },
  types: {
    image: ({ value }) => {
      const image = (value ?? {}) as SanityImageWithAlt
      const builder = urlForImage(image)
      if (!builder) return null
      const url = builder.width(1200).url()
      return (
        <figure className="my-8">
          <div className="relative w-full overflow-hidden rounded-lg" style={ { aspectRatio: '16 / 9' } }>
            <Image
              src={ url }
              alt={ image.alt || '' }
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          { image.caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              { image.caption }
            </figcaption>
          ) : null }
        </figure>
      )
    },
  },
}

export function BlogPortableText({ value }: { value: PortableTextBlock[] }) {
  if (!value || value.length === 0) return null
  return <PortableText value={ value } components={ components } />
}
