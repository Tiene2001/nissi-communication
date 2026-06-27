'use client'
import { usePathname } from 'next/navigation'
import Navigation from '@/components/public/Navigation'
import Footer from '@/components/public/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/') {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex flex-col flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  )
}
