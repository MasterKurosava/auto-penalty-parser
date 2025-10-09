import { getCurrentUser } from '@/lib/auth'
import { Header } from '@/components/Header'
import { EcpList } from '@/components/EcpList'
import { redirect } from 'next/navigation'

export default async function EcpPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header username={user.username} />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <EcpList />
      </main>
    </div>
  )
}

