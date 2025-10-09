import { getCurrentUser } from '@/lib/auth'
import { Header } from '@/components/Header'
import { redirect } from 'next/navigation'
import { FinesTable } from '@/components/FinesTable'
import { FinesForm } from '@/components/FinesForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, BarChart3, FileText } from 'lucide-react'

export default async function FinesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header username={user.username} />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          <FinesForm />
          <FinesTable />
        </div>
      </main>
    </div>
  )
}
