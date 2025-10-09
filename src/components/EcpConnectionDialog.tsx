'use client'

import React, { useState, useCallback } from 'react'
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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { NCALayerClient } from 'ncalayer-js-client'
import { useRouter } from 'next/navigation'

interface EcpConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EcpConnectionDialog = React.memo(function EcpConnectionDialog({
  open,
  onOpenChange,
}: EcpConnectionDialogProps) {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [label, setLabel] = useState('')

  if (!open) return null

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      // Step 1: Connect to NCALayer
      const client = new NCALayerClient()
      await client.connect()

      // Step 2: Get access UUID from PSAP
      const uuidResponse = await fetch('/api/psap/access-uuid')
      if (!uuidResponse.ok) throw new Error('Ошибка получения UUID')
      const { guid } = await uuidResponse.json()

      // Step 3: Sign XML with certificate
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

      // Step 4: Authenticate with PSAP (send signed XML)
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

      // authData contains: { uuid, token, refreshToken, id, iin }

      // Step 5: Save authentication to our database
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

        // If unauthorized, redirect to login
        if (saveResponse.status === 401) {
          toast.error('Сессия истекла. Пожалуйста, войдите снова.')
          window.location.href = '/login'
          return
        }

        throw new Error(error.error || 'Ошибка сохранения аутентификации')
      }

      toast.success('Сессии успешно подключена!')
      onOpenChange(false)
      setLabel('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Произошла ошибка при подключении Сессии')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Подключить Сессии</DialogTitle>
          <DialogDescription>
            Подключите вашу электронную цифровую подпись через NCALayer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Название
            </Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="col-span-3"
              placeholder="Например: Моя основная Сессии"
              disabled={isConnecting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Подключить Сессии
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
