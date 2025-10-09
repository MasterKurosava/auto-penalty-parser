"use client"

import React, { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface DateRange {
  from: Date | null
  to: Date | null
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  placeholder?: string
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Выберите период",
  className
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder

    if (range.to) {
      return `${format(range.from, 'dd.MM.yyyy', { locale: ru })} - ${format(range.to, 'dd.MM.yyyy', { locale: ru })}`
    }

    return `${format(range.from, 'dd.MM.yyyy', { locale: ru })} - ...`
  }

  const handleDateClick = (date: Date) => {
    if (!value?.from || (value.from && value.to)) {
      onChange?.({ from: date, to: null })
    } else {
      if (date < value.from) {
        onChange?.({ from: date, to: value.from })
      } else {
        onChange?.({ from: value.from, to: date })
      }
      setIsOpen(false)
    }
  }

  const clearRange = () => {
    onChange?.({ from: null, to: null })
  }

  const isDateSelected = (date: Date) => {
    if (!value?.from) return false
    if (!value.to) return date.getTime() === value.from.getTime()
    return date >= value.from && date <= value.to
  }

  const isDateInRange = (date: Date) => {
    if (!value?.from || !value?.to) return false
    return date > value.from && date < value.to
  }

  const isStartDate = (date: Date) => {
    return value?.from && date.getTime() === value.from.getTime()
  }

  const isEndDate = (date: Date) => {
    return value?.to && date.getTime() === value.to.getTime()
  }

  const generateCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const days = generateCalendar()
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="space-y-2">
      <Label>Период</Label>
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !value?.from && "text-muted-foreground",
                className
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {formatDateRange(value)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-sm relative",
                    day.getMonth() !== currentMonth.getMonth() && "text-muted-foreground",
                    isStartDate(day) && "bg-primary text-primary-foreground rounded-l-md",
                    isEndDate(day) && "bg-primary text-primary-foreground rounded-r-md",
                    isDateInRange(day) && "bg-primary/20",
                    isDateSelected(day) && !isStartDate(day) && !isEndDate(day) && "bg-primary text-primary-foreground",
                    "hover:bg-primary/10"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  {day.getDate()}
                </Button>
              ))}
            </div>

          </div>
          </PopoverContent>
        </Popover>
        {(value?.from || value?.to) && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearRange}
            className="px-2"
            title="Очистить период"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
