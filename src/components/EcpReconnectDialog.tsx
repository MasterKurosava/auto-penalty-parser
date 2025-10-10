'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { NCALayerClient } from 'ncalayer-js-client'
import { useRouter } from 'next/navigation'

interface EcpReconnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invalidEcpCount?: number
}

export const EcpReconnectDialog = React.memo(function EcpReconnectDialog({
  open,
  onOpenChange,
  invalidEcpCount = 0,
}: EcpReconnectDialogProps) {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [label, setLabel] = useState('')

  if (!open) return null

  const handleReconnect = async () => {
    setIsConnecting(true)

    try {
      const client = new NCALayerClient()
      await client.connect()

      const uuidResponse = await fetch('/api/psap/access-uuid')
      if (!uuidResponse.ok) throw new Error('Ошибка получения UUID')
      const { guid } = await uuidResponse.json()

      const xml = `<auth><guid>${guid}</guid></auth>`
      let signedXml

      try {
        signedXml = await client.basicsSignXML(
          'PKCS12',
          xml,
          { tbsElementXPath: '/', signatureElementXPath: '/' },
          NCALayerClient.basicsSignerTestAny
        )

        if (Array.isArray(signedXml)) {
          signedXml = signedXml[0]
        }
      } catch (signError: any) {
        throw new Error('Ошибка подписания: ' + (signError.message || 'Неизвестная ошибка'))
      }

      const authResponse = await fetch('/api/psap/auth-by-uuid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: signedXml,
      })

      if (!authResponse.ok) {
        const errorText = await authResponse.text()
        throw new Error('Ошибка аутентификации: ' + errorText)
      }

      const authData = await authResponse.json()

      const saveResponse = await fetch('/api/ecp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(label.trim() ? { label: label.trim() } : {}),
          iinBin: authData.iin,
          authToken: authData.token,
          refreshToken: authData.refreshToken,
          uuid: authData.uuid,
          psapId: authData.id,
        }),
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()

        if (saveResponse.status === 401) {
          toast.error('Сессия истекла. Пожалуйста, войдите снова.')
          window.location.href = '/login'
          return
        }

        throw new Error(error.error || 'Ошибка сохранения аутентификации')
      }

      toast.success('ЭЦП успешно переподключена!')
      onOpenChange(false)
      setLabel('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Произошла ошибка при переподключении ЭЦП')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div>
              <DialogTitle>Сессия истекла</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-2">
            {invalidEcpCount > 0 ? (
              <>
                <span className="font-semibold text-foreground">{invalidEcpCount}</span>{' '}
                {invalidEcpCount === 1 ? 'подключение' : 'подключения'} больше не{' '}
                {invalidEcpCount === 1 ? 'действительно' : 'действительны'}.
              </>
            ) : (
              'Ваши токены PSAP больше не действительны.'
            )}
            <br />
            <br />
            Это могло произойти потому что:
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>Вы авторизовались на сайте erap-public.kgp.kz</li>
              <li>Истек срок действия токенов</li>
              <li>Токены были аннулированы сервером</li>
            </ul>
            <br />
            Переподключите ЭЦП для продолжения работы.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="label">
              Название подключения (необязательно)
            </Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Например: Моя основная ЭЦП"
              disabled={isConnecting}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConnecting}
          >
            Отмена
          </Button>
          <Button onClick={handleReconnect} disabled={isConnecting}>
            {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isConnecting && <RefreshCw className="mr-2 h-4 w-4" />}
            Переподключить ЭЦП
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

