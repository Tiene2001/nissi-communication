import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader  from '@/components/admin/Header'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-surface flex">
      <AdminSidebar userRole={(session.user as any)?.role} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
