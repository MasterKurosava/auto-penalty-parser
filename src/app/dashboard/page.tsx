import { Header } from '@/components/Header'
import { EcpCard } from '@/components/EcpCard'
import { FinesForm } from '@/components/FinesForm'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <EcpCard />
          <FinesForm />
        </div>
      </main>
    </div>
  )
}

