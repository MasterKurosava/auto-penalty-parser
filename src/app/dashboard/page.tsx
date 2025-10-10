import { Header } from '@/components/Header'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Key, BarChart3, Info } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header username={user.username} />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Добро пожаловать, {user.username}!</CardTitle>
              <CardDescription>
                Система управления Сессии и автоматической проверки штрафов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/ecp" className="block">
                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Key className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Мои Сессии</h3>
                          <p className="text-sm text-muted-foreground">
                            Управление электронными подписями
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                        <Link href="/fines" className="block">
                          <Card className="cursor-pointer hover:bg-accent transition-colors">
                            <CardContent className="pt-6">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <BarChart3 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">Штрафы</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Проверка и управление штрафами
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Как начать работу
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>
                    Перейдите в раздел <strong>&quot;Мои Сессии&quot;</strong> и подключите вашу электронную цифровую подпись
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>
                    Убедитесь, что <strong>NCALayer</strong> запущен на вашем компьютере
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>
                    Выберите сертификат и подтвердите подключение
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>
                    Система автоматически сохранит токены и будет готова к проверке штрафов
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
