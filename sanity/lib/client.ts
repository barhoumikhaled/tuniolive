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

// Preview client — uses token and previewDrafts perspective
export const previewClient = isSanityConfigured && readToken
  ? createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: 'previewDrafts',
    token: readToken,
  })
  : null