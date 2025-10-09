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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface TimelineData {
  date: string
  count: number
  amount: number
}

interface TimelineChartProps {
  timelineData: TimelineData[]
}

export const TimelineChart = React.memo(function TimelineChart({
  timelineData
}: TimelineChartProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Динамика нарушений</CardTitle>
        <CardDescription className="text-xs">
          Количество штрафов по датам (последние 30 дней)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              interval={Math.floor(timelineData.length / 8)}
            />
            <YAxis />
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium">{payload[0].payload.date}</p>
                      <p className="text-sm">Штрафов: <span className="font-semibold">{payload[0].value}</span></p>
                      <p className="text-sm">
                        Сумма: <span className="font-semibold">{payload[0].payload.amount.toLocaleString('ru-KZ')} ₸</span>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563eb"
              strokeWidth={2}
              name="Количество штрафов"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})
