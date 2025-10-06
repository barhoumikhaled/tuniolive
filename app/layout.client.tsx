'use client'

import Layout from '@/components/client-layout'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from '@/contexts/language-context'
import React from 'react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Layout>
        { children }
      </Layout>
      <Toaster />
    </LanguageProvider>
  )
}
