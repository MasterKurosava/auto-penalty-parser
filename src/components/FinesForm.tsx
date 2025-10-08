'use client'

import React, { useState, useCallback } from 'react'
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
import { FormError } from '@/components/ui/form-error'
import { toast } from 'sonner'
import { Loader2, FileSearch } from 'lucide-react'
import { FinesTable } from '@/components/FinesTable'
import { PsapCase } from '@/lib/types'
import { finesFilterSchema, validateFormData, type FinesFilterData } from '@/lib/validations'

export const FinesForm = React.memo(function FinesForm() {
  const [formData, setFormData] = useState<FinesFilterData>({
    dateFrom: '',
    dateTo: '',
    limit: 10,
    grnzFilter: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [cases, setCases] = useState<PsapCase[]>([])
  const [allCases, setAllCases] = useState<PsapCase[]>([])

  const handleInputChange = useCallback((field: keyof FinesFilterData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Очищаем ошибку для этого поля при изменении
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      }
      return prev
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    // Валидация формы
    const validation = validateFormData(finesFilterSchema as any, {
      dateFrom: formData.dateFrom,
      dateTo: formData.dateTo,
      limit: formData.limit.toString(),
      grnzFilter: formData.grnzFilter,
    })

    if (!validation.success) {
      setErrors(validation.errors || {})
      setIsLoading(false)
      return
    }

    try {
      const validatedData = validation.data as FinesFilterData
      const params = new URLSearchParams({
        limit: validatedData.limit.toString(),
      })

      if (validatedData.dateFrom) params.append('from', validatedData.dateFrom)
      if (validatedData.dateTo) params.append('to', validatedData.dateTo)

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

  const handleGrnzFilter = useCallback((value: string) => {
    handleInputChange('grnzFilter', value)

    if (!value.trim()) {
      setCases(allCases)
    } else {
      const filtered = allCases.filter(c =>
        c.av1o?.grnz?.toLowerCase().includes(value.toLowerCase())
      )
      setCases(filtered)
    }
  }, [allCases, handleInputChange])

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Дата от</Label>
                <div className="relative">
                  <Input
                    id="dateFrom"
                    type="date"
                    value={formData.dateFrom}
                    onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                    disabled={isLoading}
                    className="cursor-pointer"
                    aria-invalid={!!errors.dateFrom}
                    aria-describedby={errors.dateFrom ? 'dateFrom-error' : undefined}
                  />
                </div>
                <FormError
                  message={errors.dateFrom?.[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Дата до</Label>
                <div className="relative">
                  <Input
                    id="dateTo"
                    type="date"
                    value={formData.dateTo}
                    onChange={(e) => handleInputChange('dateTo', e.target.value)}
                    disabled={isLoading}
                    className="cursor-pointer"
                    aria-invalid={!!errors.dateTo}
                    aria-describedby={errors.dateTo ? 'dateTo-error' : undefined}
                  />
                </div>
                <FormError
                  message={errors.dateTo?.[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Лимит записей</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.limit}
                  onChange={(e) => handleInputChange('limit', parseInt(e.target.value) || 10)}
                  disabled={isLoading}
                  aria-invalid={!!errors.limit}
                  aria-describedby={errors.limit ? 'limit-error' : undefined}
                />
                <FormError
                  message={errors.limit?.[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grnzFilter">Фильтр по госномеру</Label>
                <Input
                  id="grnzFilter"
                  type="text"
                  placeholder="Введите госномер"
                  value={formData.grnzFilter}
                  onChange={(e) => handleGrnzFilter(e.target.value)}
                  disabled={isLoading || allCases.length === 0}
                  aria-invalid={!!errors.grnzFilter}
                  aria-describedby={errors.grnzFilter ? 'grnzFilter-error' : undefined}
                />
                <FormError
                  message={errors.grnzFilter?.[0]}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Загрузить штрафы
              </Button>
              {cases.length !== allCases.length && allCases.length > 0 && (
                <span className="text-sm text-muted-foreground text-center sm:text-left">
                  Показано {cases.length} из {allCases.length}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {(cases.length > 0 || isLoading) && <FinesTable cases={cases} isLoading={isLoading} />}
    </div>
  )
})
