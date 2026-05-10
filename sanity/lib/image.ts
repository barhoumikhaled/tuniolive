import createImageUrlBuilder from '@sanity/image-url'

import { dataset, projectId, isSanityConfigured } from '../env'
import type { SanityImageSource } from './types'

const builder = isSanityConfigured
  ? createImageUrlBuilder({ projectId, dataset })
  : null

export function urlForImage(source: SanityImageSource | undefined | null) {
  if (!source || !builder) return null
  return builder.image(source).auto('format').fit('max')
}
