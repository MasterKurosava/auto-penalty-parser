'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { EcpConnectionDialog } from './EcpConnectionDialog'
import { EcpReconnectDialog } from './EcpReconnectDialog'
import { Plus, Loader2, Pencil, Trash2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface EcpAuth {
  id: string
  label: string | null
  iinBin: string
  psapId: string
  lastCheckedAt: string | null
  validUntil: string | null
  isValid: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const EcpList = React.memo(function EcpList() {
  const [ecpAuths, setEcpAuths] = useState<EcpAuth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showReconnectDialog, setShowReconnectDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editActive, setEditActive] = useState(false)

  const loadEcpAuths = useCallback(async () => {
    try {
      const response = await fetch('/api/ecp/list')
      if (response.ok) {
        const data = await response.json()
        setEcpAuths(data.ecpAuths || [])
      }
    } catch (error) {
      toast.error('Ошибка загрузки подключений')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEcpAuths()
  }, [loadEcpAuths])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это подключение?')) {
      return
    }

    try {
      const response = await fetch(`/api/ecp/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Подключение удалено')
        loadEcpAuths()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка удаления')
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу')
    }
  }, [loadEcpAuths])

  const handleEdit = useCallback((ecpAuth: EcpAuth) => {
    setEditingId(ecpAuth.id)
    setEditLabel(ecpAuth.label || '')
    setEditActive(ecpAuth.isActive)
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/ecp/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editLabel || null,
          isActive: editActive,
        }),
      })

      if (response.ok) {
        toast.success('Подключение обновлено')
        setEditingId(null)
        loadEcpAuths()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка обновления')
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу')
    }
  }, [editingId, editLabel, editActive, loadEcpAuths])

  const getStatusBadge = useCallback((ecpAuth: EcpAuth) => {
    if (!ecpAuth.isValid) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Недействителен
        </Badge>
      )
    }
    if (ecpAuth.validUntil && new Date(ecpAuth.validUntil) < new Date()) {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Истёк
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="gap-1 bg-green-500">
        <CheckCircle className="h-3 w-3" />
        Действителен
      </Badge>
    )
  }, [])

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Мои подключения</CardTitle>
            <CardDescription>
              Управление подключениями через Сессии для доступа к штрафам
            </CardDescription>
          </div>
          <Button onClick={() => setIsConnecting(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Подключить Сессии
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ecpAuths.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">У вас пока нет подключений</p>
              <Button onClick={() => setIsConnecting(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Подключить первую Сессии
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>ИИН/БИН</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Активно</TableHead>
                    <TableHead>Последняя проверка</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ecpAuths.map((ecpAuth) => (
                    <TableRow key={ecpAuth.id}>
                      <TableCell className="font-medium">
                        {ecpAuth.label || 'Без названия'}
                      </TableCell>
                      <TableCell className="font-mono">{ecpAuth.iinBin}</TableCell>
                      <TableCell>{getStatusBadge(ecpAuth)}</TableCell>
                      <TableCell>
                        {ecpAuth.isActive ? (
                          <Badge variant="outline" className="bg-green-600 text-white">Да</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700">Нет</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {ecpAuth.lastCheckedAt
                          ? format(new Date(ecpAuth.lastCheckedAt), 'dd.MM.yyyy HH:mm', {
                              locale: ru,
                            })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!ecpAuth.isValid && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setShowReconnectDialog(true)}
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Переподключить
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(ecpAuth)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(ecpAuth.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EcpConnectionDialog
        open={isConnecting}
        onOpenChange={(open) => {
          setIsConnecting(open)
          if (!open) loadEcpAuths()
        }}
      />

      <EcpReconnectDialog
        open={showReconnectDialog}
        onOpenChange={(open) => {
          setShowReconnectDialog(open)
          if (!open) loadEcpAuths()
        }}
        invalidEcpCount={ecpAuths.filter(e => !e.isValid).length}
      />

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать подключение</DialogTitle>
            <DialogDescription>
              Измените название или статус активности подключения
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-label">Название</Label>
              <Input
                id="edit-label"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="Например: Моя основная Сессии"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Активно для проверки штрафов</Label>
              <Switch
                id="edit-active"
                checked={editActive}
                onCheckedChange={setEditActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})
