import { createClient } from 'next-sanity'

import {
  apiVersion,
  dataset,
  projectId,
  useCdn,
  isSanityConfigured,
  readToken,
} from '../env'

export const client = isSanityConfigured
  ? createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    perspective: 'published',
    token: readToken || undefined,
  })
  : null
