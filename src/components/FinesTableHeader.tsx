'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Download, ChevronUp, ChevronDown } from 'lucide-react'

interface FinesTableHeaderProps {
  totalFines: number
  selectedFines: Set<string>
  selectedFinesTotal: number
  isTableExpanded: boolean
  isLoading: boolean
  onToggleExpanded: () => void
  onExportAll: () => void
  onExportSelected: () => void
}

export const FinesTableHeader = React.memo(function FinesTableHeader({
  totalFines,
  selectedFines,
  selectedFinesTotal,
  isTableExpanded,
  isLoading,
  onToggleExpanded,
  onExportAll,
  onExportSelected
}: FinesTableHeaderProps) {
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-bold text-white">Список штрафов</CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Всего найдено: {totalFines} штрафов
            {selectedFines.size > 0 && (
              <>
                <span className="mx-2">•</span>
                <span className="text-blue-400 font-medium">
                  Выбрано: {selectedFines.size} штрафов на сумму {selectedFinesTotal.toLocaleString('ru-KZ')} ₸
                </span>
              </>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            className="transition-all duration-300"
          >
            {isTableExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Свернуть таблицу
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Развернуть таблицу
              </>
            )}
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={onExportAll}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="border-blue-300 text-blue-400 hover:bg-blue-50 hover:text-blue-600 font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Download className="mr-2 h-4 w-4" />
              Скачать все
            </Button>
            {selectedFines.size > 0 && (
              <Button onClick={onExportSelected} variant="default" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Скачать выделенные ({selectedFines.size})
              </Button>
            )}
          </div>
        </div>
      </div>
    </CardHeader>
  )
})
