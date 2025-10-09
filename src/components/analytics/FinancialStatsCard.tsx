'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface FinancialStatsCardProps {
  totalAmount: number
  paidAmount: number
  partialAmount: number
  unpaidAmount: number
  averageAmount: number
}

export const FinancialStatsCard = React.memo(function FinancialStatsCard({
  totalAmount,
  paidAmount,
  partialAmount,
  unpaidAmount,
  averageAmount
}: FinancialStatsCardProps) {
  return (
    <Card className="md:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Финансовая статистика</CardTitle>
        <CardDescription className="text-xs">Общие суммы штрафов</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Всего штрафов:</span>
            <span className="text-base font-bold">{totalAmount.toLocaleString('ru-KZ')} ₸</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Оплачено:</span>
            <span className="text-sm font-semibold text-green-600">
              {paidAmount.toLocaleString('ru-KZ')} ₸
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Частично:</span>
            <span className="text-sm font-semibold text-orange-600">
              {partialAmount.toLocaleString('ru-KZ')} ₸
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Не оплачено:</span>
            <span className="text-sm font-semibold text-red-600">
              {unpaidAmount.toLocaleString('ru-KZ')} ₸
            </span>
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Средний штраф:</span>
            <span className="text-sm font-semibold">
              {Math.round(averageAmount).toLocaleString('ru-KZ')} ₸
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
