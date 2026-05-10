'use client';
import dynamic from 'next/dynamic'
import config from '@/sanity.config'

const Studio = dynamic(() => import('sanity').then(mod => mod.Studio), {
  ssr: false,
  loading: () => <p>Loading Studio...</p>,
})

export default function StudioPage() {
  return <Studio config={ config } />
}
