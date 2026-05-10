import { client } from './client'

export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
  tags,
}: {
  query: string
  params?: Record<string, unknown>
  revalidate?: number | false
  tags?: string[]
}): Promise<T | null> {
  if (!client) return null
  try {
    return await client.fetch<T>(query, params, {
      next: {
        revalidate,
        tags,
      },
    })
  } catch (err) {
    console.error('[sanityFetch] failed', err)
    return null
  }
}
