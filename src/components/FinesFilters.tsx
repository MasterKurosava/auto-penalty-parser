'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { DateRangePicker } from '@/components/ui/date-range-picker'

interface FinesFiltersProps {
  search: string
  onSearchChange: (value: string) => void

  dateRange: { from: Date | null; to: Date | null }
  onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void

  status: string
  onStatusChange: (value: string) => void

  ecpAuthId: string
  onEcpAuthChange: (value: string) => void
  ecpAuths: Array<{ id: string; label: string | null; iinBin: string }>
}

export const FinesFilters = React.memo(function FinesFilters({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  status,
  onStatusChange,
  ecpAuthId,
  onEcpAuthChange,
  ecpAuths
}: FinesFiltersProps) {
  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2 lg:col-span-2">
        <Label>Поиск</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по ФИО, компании, номеру дела или госномеру…"
            className="pl-9 transition-all duration-200"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        placeholder="Выберите период"
      />

      <div className="space-y-2">
        <Label>Статус</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="paid">Оплачено</SelectItem>
            <SelectItem value="unpaid">Не оплачено</SelectItem>
            <SelectItem value="partially_paid">Частично оплачено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Подключение</Label>
        <Select value={ecpAuthId} onValueChange={onEcpAuthChange}>
          <SelectTrigger>
            <SelectValue placeholder="Все подключения" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все подключения</SelectItem>
            {ecpAuths.map((auth) => (
              <SelectItem key={auth.id} value={auth.id}>
                {auth.label || `ИИН: ${auth.iinBin}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
})
