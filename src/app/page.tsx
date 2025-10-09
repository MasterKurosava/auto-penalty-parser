import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 p-8">
        <div>
          <h1 className="text-6xl font-bold mb-4">AFP</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Система управления Сессии и проверки штрафов
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Войти</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Регистрация
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
