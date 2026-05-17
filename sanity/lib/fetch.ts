import { client, previewClient } from './client'

export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
  tags,
  preview = false,
}: {
  query: string
  params?: Record<string, unknown>
  revalidate?: number | false
  tags?: string[]
  preview?: boolean
}): Promise<T | null> {
  const activeClient = preview && previewClient ? previewClient : client
  if (!activeClient) return null
  try {
    return await activeClient.fetch<T>(query, params, {
      next: {
        revalidate: preview ? 0 : revalidate, // no cache in preview
        tags,
      },
    })
  } catch (err) {
    console.error('[sanityFetch] failed', err)
    return null
  }
}