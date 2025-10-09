import { LoginForm } from '@/components/LoginForm'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AFP</h1>
          <p className="text-muted-foreground">
            Система управления Сессии и проверки штрафов
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

