'use client'

import Layout from '@/components/client-layout'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from '@/contexts/language-context'
import { DefaultSeo } from "next-seo";
import defaultSEO from "../next-seo.config";
import React from 'react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Layout>
        {/* <DefaultSeo { ...defaultSEO } /> */}
        { children }
      </Layout>
      <Toaster />
    </LanguageProvider>
  )
}
