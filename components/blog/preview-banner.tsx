'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'

export function PreviewBanner({ slug }: { slug: string }) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-400 px-4 py-2 text-sm font-medium text-amber-900 shadow">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>Preview mode — this post is not published yet</span>
      </div>
      <Link
        href={ `/api/disable-draft?slug=${slug}` }
        className="rounded bg-amber-900 px-3 py-1 text-xs text-amber-50 hover:bg-amber-800 transition-colors"
      >
        Exit preview
      </Link>
    </div>
  )
}