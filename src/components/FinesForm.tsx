'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, FileSearch } from 'lucide-react'
import { FinesTable } from './FinesTable'
import { PsapCase } from '@/lib/types'

export function FinesForm() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [limit, setLimit] = useState('10')
  const [grnzFilter, setGrnzFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cases, setCases] = useState<PsapCase[]>([])
  const [allCases, setAllCases] = useState<PsapCase[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        limit,
      })

      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)

      const response = await fetch(`/api/psap/cases?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch cases')
      }

      const result = await response.json()

      const casesData = Array.isArray(result.data)
        ? result.data
        : result.data?.cases || result.data?.content || []

      setAllCases(casesData)
      setCases(casesData)

      toast.success(`Загружено записей: ${casesData.length}`)
    } catch (error: any) {
      let errorMessage = 'Ошибка загрузки штрафов'

      if (error.message.includes('Not authenticated')) {
        errorMessage = 'Сначала подключите ЭЦП'
      } else if (error.message.includes('authentication expired')) {
        errorMessage = 'Сессия истекла. Переподключите ЭЦП'
      }

      toast.error(errorMessage, {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGrnzFilter = (value: string) => {
    setGrnzFilter(value)
    if (!value.trim()) {
      setCases(allCases)
    } else {
      const filtered = allCases.filter(c =>
        c.av1o?.grnz?.toLowerCase().includes(value.toLowerCase())
      )
      setCases(filtered)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Запрос штрафов
          </CardTitle>
          <CardDescription>
            Загрузите данные о штрафах из PSAP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Дата от</Label>
                <div className="relative">
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Дата до</Label>
                <div className="relative">
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Лимит записей</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="100"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grnzFilter">Фильтр по госномеру</Label>
                <Input
                  id="grnzFilter"
                  type="text"
                  placeholder="Введите госномер"
                  value={grnzFilter}
                  onChange={(e) => handleGrnzFilter(e.target.value)}
                  disabled={isLoading || allCases.length === 0}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Загрузить штрафы
              </Button>
              {cases.length !== allCases.length && allCases.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  Показано {cases.length} из {allCases.length}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {cases.length > 0 && <FinesTable cases={cases} />}
    </div>
  )
}

