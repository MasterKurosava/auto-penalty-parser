'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, Key } from 'lucide-react'
import { authenticateWithEds } from '@/lib/ncalayer'

export function EcpCard() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [userData, setUserData] = useState<{
    uuid?: string
    iin?: string
    id?: string
  } | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      toast.info('Подключение к NCALayer...')

      const data = await authenticateWithEds()

      setUserData(data)
      setIsConnected(true)
      toast.success('ЭЦП успешно подключена!')
    } catch (error: any) {
      let errorMessage = 'Ошибка подключения ЭЦП'

      if (error.message.includes('NCALayer')) {
        errorMessage = 'Не удалось подключиться к NCALayer. Убедитесь, что сервис запущен.'
      } else if (error.message.includes('Authentication failed')) {
        errorMessage = 'Ошибка аутентификации с PSAP'
      }

      toast.error(errorMessage, {
        description: error.message,
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Электронно-цифровая подпись</h3>
                {isConnected && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Подключено
                  </Badge>
                )}
              </div>
              {!isConnected ? (
                <p className="text-sm text-muted-foreground">
                  Подключите ЭЦП для доступа к данным PSAP
                </p>
              ) : (
                <div className="flex items-center gap-4 text-sm">
                  {userData?.iin && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">ИИН:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {userData.iin}
                      </code>
                    </div>
                  )}
                  {userData?.uuid && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">UUID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                        {userData.uuid}
                      </code>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                size="lg"
              >
                {isConnecting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Подключить ЭЦП
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                variant="outline"
                disabled={isConnecting}
              >
                {isConnecting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Переподключить
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

