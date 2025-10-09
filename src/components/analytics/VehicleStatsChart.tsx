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

interface VehicleData {
  vehicle: string
  count: number
  total: number
}

interface VehicleStatsChartProps {
  vehicleData: VehicleData[]
}

export const VehicleStatsChart = React.memo(function VehicleStatsChart({
  vehicleData
}: VehicleStatsChartProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Штрафы по номерам</CardTitle>
        <CardDescription className="text-xs">Количество штрафов по автомобилям</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={vehicleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vehicle" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium mb-1">Номер: {item.vehicle}</p>
                      <p className="text-sm font-semibold">Штрафов: {item.count} шт.</p>
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
