'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TopViolationsData {
  code: string
  name: string
  count: number
  total: number
}

interface TopViolationsChartProps {
  topArticles: TopViolationsData[]
}

export const TopViolationsChart = React.memo(function TopViolationsChart({
  topArticles
}: TopViolationsChartProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Топ нарушений</CardTitle>
        <CardDescription className="text-xs">Наиболее частые статьи</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={topArticles}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg max-w-xs">
                      <p className="text-sm font-medium mb-1">Статья: {item.code}</p>
                      <p className="text-xs text-muted-foreground mb-2">{item.name}</p>
                      <p className="text-xs font-semibold">Количество: {item.count} шт.</p>
                      <p className="text-xs">Сумма: {item.total.toLocaleString('ru-KZ')} ₸</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})
