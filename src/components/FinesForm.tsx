'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, RefreshCw } from 'lucide-react'
import { EcpReconnectDialog } from '@/components/EcpReconnectDialog'

export const FinesForm = React.memo(function FinesForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showReconnectDialog, setShowReconnectDialog] = useState(false)
  const [invalidEcpCount, setInvalidEcpCount] = useState(0)

  const handleSync = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/fines/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Ошибка синхронизации штрафов')
        return
      }

      const data = await response.json()

      // Проверяем, есть ли невалидные ЭЦП
      const invalidResults = data.results?.filter((r: any) => !r.success && r.invalidated) || []

      if (invalidResults.length > 0) {
        setInvalidEcpCount(invalidResults.length)
        setShowReconnectDialog(true)
      } else {
        toast.success(`Синхронизировано штрафов: ${data.totalSynced || 0}`)
      }

      window.dispatchEvent(new CustomEvent('fines-synced'))
    } catch (error) {
      toast.error('Ошибка подключения к серверу')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Синхронизация штрафов</CardTitle>
          <CardDescription>
            Нажмите кнопку, чтобы получить актуальные штрафы по всем активным подключениям.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSync} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
            Синхронизировать штрафы
          </Button>
        </CardContent>
      </Card>

      <EcpReconnectDialog
        open={showReconnectDialog}
        onOpenChange={setShowReconnectDialog}
        invalidEcpCount={invalidEcpCount}
      />
    </>
  )
})
