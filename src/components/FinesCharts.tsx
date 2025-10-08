'use client'

import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PsapCase } from '@/lib/types'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface FinesChartsProps {
  cases: PsapCase[]
}

const COLORS = {
  paid: '#16a34a',
  partial: '#ea580c',
  unpaid: '#dc2626',
}

export function FinesCharts({ cases }: FinesChartsProps) {
  const statusData = useMemo(() => {
    const paid = cases.filter(c => c.paid === 1).length
    const partial = cases.filter(c => c.paid === 3).length
    const unpaid = cases.filter(c => c.paid === 2 || c.paid === 0).length

    return [
      { name: 'Оплачено', value: paid, color: COLORS.paid },
      { name: 'Частично', value: partial, color: COLORS.partial },
      { name: 'Не оплачено', value: unpaid, color: COLORS.unpaid },
    ].filter(item => item.value > 0)
  }, [cases])

  const topArticles = useMemo(() => {
    const articleCount = new Map<string, { count: number; name: string; total: number }>()

    cases.forEach(c => {
      const code = c.article?.code || 'Неизвестно'
      const name = c.article?.nameRu || 'Неизвестно'
      const amount = parseInt(c.lastAp?.totalAmount || '0')

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
      .slice(0, 10)
  }, [cases])

  const timelineData = useMemo(() => {
    const dateCount = new Map<string, { count: number; amount: number }>()

    cases.forEach(c => {
      try {
        const date = format(new Date(c.commitDate), 'dd.MM.yyyy', { locale: ru })
        const amount = parseInt(c.lastAp?.totalAmount || '0')

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
  }, [cases])

  const totalAmount = useMemo(() => {
    return cases.reduce((sum, c) => sum + parseInt(c.lastAp?.totalAmount || '0'), 0)
  }, [cases])

  const unpaidAmount = useMemo(() => {
    return cases
      .filter(c => c.paid === 0 || c.paid === 2)
      .reduce((sum, c) => sum + parseInt(c.lastAp?.totalAmount || '0'), 0)
  }, [cases])

  const partialAmount = useMemo(() => {
    return cases
      .filter(c => c.paid === 3)
      .reduce((sum, c) => sum + parseInt(c.lastAp?.totalAmount || '0'), 0)
  }, [cases])

  if (cases.length === 0) {
    return null
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Распределение по статусам</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Соотношение оплаченных штрафов</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} шт.`, 'Количество']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Топ нарушений</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Наиболее частые статьи</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topArticles.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="code" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
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
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Финансовая статистика</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Общие суммы штрафов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Всего штрафов:</span>
              <span className="text-lg font-bold">{totalAmount.toLocaleString('ru-KZ')} ₸</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Оплачено:</span>
              <span className="text-base font-semibold text-green-600">
                {(totalAmount - unpaidAmount - partialAmount).toLocaleString('ru-KZ')} ₸
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Частично:</span>
              <span className="text-base font-semibold text-orange-600">
                {partialAmount.toLocaleString('ru-KZ')} ₸
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Не оплачено:</span>
              <span className="text-base font-semibold text-red-600">{unpaidAmount.toLocaleString('ru-KZ')} ₸</span>
            </div>
          </div>
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Средний штраф:</span>
              <span className="text-base font-semibold">
                {Math.round(totalAmount / cases.length).toLocaleString('ru-KZ')} ₸
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {timelineData.length > 1 && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">Динамика нарушений</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Количество штрафов по датам (последние 30 дней)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={Math.floor(timelineData.length / 10)}
                />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
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
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Количество штрафов"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

