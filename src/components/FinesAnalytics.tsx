'use client'

import React, { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { StatusDistributionChart } from './analytics/StatusDistributionChart'
import { TopViolationsChart } from './analytics/TopViolationsChart'
import { VehicleStatsChart } from './analytics/VehicleStatsChart'
import { FinancialStatsCard } from './analytics/FinancialStatsCard'
import { TimelineChart } from './analytics/TimelineChart'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FinesAnalyticsSkeleton } from './FinesAnalyticsSkeleton'

interface Fine {
  id: string
  externalId: string
  status: string
  commitDate: string | null
  decisionDate: string | null
  fullName: string
  vehicleNumber: string
  serialNumber: string | null
  articleCode: string
  articleName: string
  amountTotal: string
  pdfUrl: string | null
  ecpAuth: {
    id: string
    label: string | null
    iinBin: string
  }
  createdAt: string
  updatedAt: string
}

interface FinesAnalyticsProps {
  fines: Fine[]
  selectedFines: Set<string>
}

const COLORS = {
  paid: '#10b981',      // Более мягкий зелёный
  partial: '#f59e0b',   // Мягкий оранжевый
  unpaid: '#ef4444',    // Мягкий красный с прозрачностью 85%
}

export const FinesAnalytics = React.memo(function FinesAnalytics({
  fines,
  selectedFines
}: FinesAnalyticsProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const filteredFines = selectedFines.size > 0
    ? fines.filter(f => selectedFines.has(f.id))
    : fines

  const statusData = useMemo(() => {
    const paid = filteredFines.filter(f => f.status === 'paid').length
    const partial = filteredFines.filter(f => f.status === 'partially_paid').length
    const unpaid = filteredFines.filter(f => f.status === 'unpaid').length

    return [
      { name: 'Оплачено', value: paid, color: COLORS.paid },
      { name: 'Частично оплачено', value: partial, color: COLORS.partial },
      { name: 'Не оплачено', value: unpaid, color: COLORS.unpaid },
    ].filter(item => item.value > 0)
  }, [filteredFines])

  const topArticles = useMemo(() => {
    const articleCount = new Map<string, { count: number; name: string; total: number }>()

    filteredFines.forEach(f => {
      const code = f.articleCode || 'Неизвестно'
      const name = f.articleName || 'Неизвестно'
      const amount = parseFloat(f.amountTotal || '0')

      if (articleCount.has(code)) {
        const current = articleCount.get(code)!
        articleCount.set(code, {
          count: current.count + 1,
          name: current.name,
          total: current.total + amount
        })
      } else {
        articleCount.set(code, { count: 1, name, total: amount })
      }
    })

    return Array.from(articleCount.entries())
      .map(([code, data]) => ({
        code,
        name: data.name,
        count: data.count,
        total: data.total,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredFines])

  const timelineData = useMemo(() => {
    const dateCount = new Map<string, { count: number; amount: number }>()

    filteredFines.forEach(f => {
      if (f.commitDate) {
        try {
          const date = format(new Date(f.commitDate), 'dd.MM.yyyy', { locale: ru })
          const amount = parseFloat(f.amountTotal || '0')

          if (dateCount.has(date)) {
            const current = dateCount.get(date)!
            dateCount.set(date, {
              count: current.count + 1,
              amount: current.amount + amount
            })
          } else {
            dateCount.set(date, { count: 1, amount })
          }
        } catch {}
      }
    })

    return Array.from(dateCount.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        amount: data.amount,
      }))
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('.')
        const [dayB, monthB, yearB] = b.date.split('.')
        return new Date(+yearA, +monthA - 1, +dayA).getTime() -
               new Date(+yearB, +monthB - 1, +dayB).getTime()
      })
      .slice(-30)
  }, [filteredFines])

  const financialStats = useMemo(() => {
    const totalAmount = filteredFines.reduce((sum, f) => sum + parseFloat(f.amountTotal || '0'), 0)
    const paidAmount = filteredFines
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + parseFloat(f.amountTotal || '0'), 0)
    const partialAmount = filteredFines
      .filter(f => f.status === 'partially_paid')
      .reduce((sum, f) => sum + parseFloat(f.amountTotal || '0'), 0)
    const unpaidAmount = filteredFines
      .filter(f => f.status === 'unpaid')
      .reduce((sum, f) => sum + parseFloat(f.amountTotal || '0'), 0)

    return {
      totalAmount,
      paidAmount,
      partialAmount,
      unpaidAmount,
      averageAmount: filteredFines.length > 0 ? totalAmount / filteredFines.length : 0
    }
  }, [filteredFines])

  const vehicleData = useMemo(() => {
    const vehicleCount = new Map<string, { count: number; total: number }>()

    filteredFines.forEach(f => {
      const vehicle = f.vehicleNumber || 'Неизвестно'
      const amount = parseFloat(f.amountTotal || '0')

      if (vehicleCount.has(vehicle)) {
        const current = vehicleCount.get(vehicle)!
        vehicleCount.set(vehicle, {
          count: current.count + 1,
          total: current.total + amount
        })
      } else {
        vehicleCount.set(vehicle, { count: 1, total: amount })
      }
    })

    return Array.from(vehicleCount.entries())
      .map(([vehicle, data]) => ({
        vehicle,
        count: data.count,
        total: data.total,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [filteredFines])

  if (fines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Загрузите штрафы для отображения аналитики
      </div>
    )
  }

  if (filteredFines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Выберите штрафы в таблице для отображения аналитики по выбранным элементам
      </div>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-white">Аналитика и графики</CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Визуализация данных по штрафам
              {selectedFines.size > 0 && (
                <span className="ml-2 text-blue-400 font-medium">
                  (выбрано: {selectedFines.size})
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="transition-all duration-300"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Свернуть
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Развернуть
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <StatusDistributionChart statusData={statusData} />
          <TopViolationsChart topArticles={topArticles} />
          <VehicleStatsChart vehicleData={vehicleData} />

          {timelineData.length > 1 && (
            <>
              <FinancialStatsCard
                totalAmount={financialStats.totalAmount}
                paidAmount={financialStats.paidAmount}
                partialAmount={financialStats.partialAmount}
                unpaidAmount={financialStats.unpaidAmount}
                averageAmount={financialStats.averageAmount}
              />
              <TimelineChart timelineData={timelineData} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
