import { LoginForm } from '@/components/LoginForm'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await getSession()
  if (session.isLoggedIn) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Nuraly</h1>
          <p className="text-muted-foreground">
            Система работы со штрафами
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

