import { groq } from 'next-sanity'

export const POSTS_COUNT_QUERY = groq`count(*[_type == "post" && defined(slug.current) && defined(publishedAt)])`

export const POSTS_LIST_QUERY = groq`
  *[_type == "post" && defined(slug.current) && defined(publishedAt)]
    | order(publishedAt desc) [$start...$end] {
      _id,
      "slug": slug.current,
      title_en,
      title_fr,
      title_ar,
      excerpt_en,
      excerpt_fr,
      excerpt_ar,
      author,
      publishedAt,
      coverImage
    }
`

export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current) && defined(publishedAt)].slug.current
`

export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug && defined(publishedAt)][0] {
    _id,
    "slug": slug.current,
    title_en,
    title_fr,
    title_ar,
    excerpt_en,
    excerpt_fr,
    excerpt_ar,
    body_en,
    body_fr,
    body_ar,
    seoDescription_en,
    seoDescription_fr,
    seoDescription_ar,
    author,
    publishedAt,
    coverImage
  }
`
