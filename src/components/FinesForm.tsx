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
    console.log('[CLIENT] Начало синхронизации штрафов')
    setIsLoading(true)

    try {
      console.log('[CLIENT] Отправка запроса на /api/fines/sync')
      const startTime = Date.now()
      
      const response = await fetch('/api/fines/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const elapsed = Date.now() - startTime
      console.log(`[CLIENT] Ответ получен через ${elapsed}ms, статус: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        console.error('[CLIENT] Ошибка ответа:', response.status, response.statusText)
        const error = await response.json()
        console.error('[CLIENT] Данные ошибки:', error)
        toast.error(error.error || 'Ошибка синхронизации штрафов')
        return
      }

      console.log('[CLIENT] Парсинг JSON ответа...')
      const data = await response.json()
      console.log('[CLIENT] Данные получены:', {
        totalSynced: data.totalSynced,
        resultsCount: data.results?.length,
        results: data.results,
      })

      const invalidResults = data.results?.filter((r: any) => !r.success && r.invalidated) || []

      if (invalidResults.length > 0) {
        console.log('[CLIENT] Найдены невалидные подключения:', invalidResults.length)
        setInvalidEcpCount(invalidResults.length)
        setShowReconnectDialog(true)
      } else {
        console.log('[CLIENT] Синхронизация успешна')
        toast.success(`Синхронизировано штрафов: ${data.totalSynced || 0}`)
      }

      window.dispatchEvent(new CustomEvent('fines-synced'))
    } catch (error) {
      console.error('[CLIENT] Критическая ошибка при синхронизации:', error)
      toast.error('Ошибка подключения к серверу')
    } finally {
      console.log('[CLIENT] Завершение синхронизации')
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
