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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface StatusData {
  name: string
  value: number
  color: string
}

interface StatusDistributionChartProps {
  statusData: StatusData[]
}

export const StatusDistributionChart = React.memo(function StatusDistributionChart({
  statusData
}: StatusDistributionChartProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Распределение по статусам</CardTitle>
        <CardDescription className="text-xs">Соотношение оплаченных штрафов</CardDescription>
      </CardHeader>
      <CardContent className="select-none" style={{ touchAction: 'none' }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="40%"
              labelLine={false}
              label={false}
              outerRadius={50}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name, props) => {
                const total = statusData.reduce((sum, item) => sum + item.value, 0)
                const percent = ((value / total) * 100).toFixed(0)
                return [`${value} шт. (${percent}%)`, 'Количество']
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={60}
              iconType="circle"
              wrapperStyle={{ fontSize: '9px', lineHeight: '1.3' }}
              formatter={(value, entry: any) => {
                const total = statusData.reduce((sum, item) => sum + item.value, 0)
                const percent = ((entry.payload.value / total) * 100).toFixed(0)
                return `${value} (${percent}%)`
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})
