'use client'

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import * as XLSX from 'xlsx-js-style'
import { FinesAnalytics } from '@/components/FinesAnalytics'
import { FinesTableSkeleton } from './FinesTableSkeleton'
import { FinesFilters } from './FinesFilters'
import { FinesTableHeader } from './FinesTableHeader'
import { FinesTableBody } from './FinesTableBody'

interface Fine {
  id: string
  externalId: string
  status: string
  commitDate: string | null
  decisionDate: string | null
  caseNumber: string | null
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

type SortField = 'commitDate' | 'decisionDate' | 'amountTotal' | 'status' | 'fullName' | 'vehicleNumber' | 'articleCode'
type SortDirection = 'asc' | 'desc'

export const FinesTable = React.memo(function FinesTable() {
  const [allFines, setAllFines] = useState<Fine[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [ecpAuths, setEcpAuths] = useState<Array<{ id: string; label: string | null; iinBin: string }>>([])
  const [selectedFines, setSelectedFines] = useState<Set<string>>(new Set())
  const [isTableExpanded, setIsTableExpanded] = useState(true)
  const [displayCount, setDisplayCount] = useState(20)

  const [ecpAuthId, setEcpAuthId] = useState('all')
  const [status, setStatus] = useState('all')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleNumberDebounced, setVehicleNumberDebounced] = useState('')
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })
  const [sortField, setSortField] = useState<SortField>('commitDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      setVehicleNumberDebounced(vehicleNumber)
    }, 500)
    return () => clearTimeout(timer)
  }, [vehicleNumber])

  useEffect(() => {
    let mounted = true
    const loadEcpAuths = async () => {
      try {
        const response = await fetch('/api/ecp/list')
        if (response.ok && mounted) {
          const data = await response.json()
          setEcpAuths(data.ecpAuths || [])
        }
      } catch (error) {
      }
    }
    loadEcpAuths()
    return () => { mounted = false }
  }, [])

  const loadAllFines = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '10000',
        offset: '0',
        sortField,
        sortDirection,
      })

      const response = await fetch(`/api/fines/list?${params}`)
      if (!response.ok) {
        throw new Error('Failed to load fines')
      }

      const data = await response.json()
      setAllFines(data.fines)
      setTotal(data.total)
      setDisplayCount(20)
    } catch (error) {
      toast.error('Ошибка загрузки штрафов')
    } finally {
      setIsLoading(false)
    }
  }, [sortField, sortDirection])

  const filteredFines = useMemo(() => {
    let filtered = [...allFines]

    if (ecpAuthId && ecpAuthId !== 'all') {
      filtered = filtered.filter(f => f.ecpAuth.id === ecpAuthId)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(f => f.status === status)
    }

    if (vehicleNumberDebounced.trim()) {
      filtered = filtered.filter(f =>
        f.vehicleNumber.toLowerCase().includes(vehicleNumberDebounced.toLowerCase())
      )
    }

    if (searchDebounced.trim()) {
      const searchLower = searchDebounced.toLowerCase()
      filtered = filtered.filter(f =>
        f.externalId.toLowerCase().includes(searchLower) ||
        f.fullName.toLowerCase().includes(searchLower) ||
        f.vehicleNumber.toLowerCase().includes(searchLower) ||
        (f.serialNumber && f.serialNumber.toLowerCase().includes(searchLower)) ||
        (f.caseNumber && f.caseNumber.toLowerCase().includes(searchLower)) ||
        f.articleCode.toLowerCase().includes(searchLower) ||
        f.articleName.toLowerCase().includes(searchLower) ||
        f.ecpAuth.iinBin.toLowerCase().includes(searchLower)
      )
    }

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(f => {
        if (!f.commitDate) return false
        const commitDate = new Date(f.commitDate)

        if (dateRange.from && commitDate < dateRange.from) return false
        if (dateRange.to && commitDate > dateRange.to) return false

        return true
      })
    }

    return filtered
  }, [allFines, ecpAuthId, status, vehicleNumberDebounced, searchDebounced, dateRange])

  useEffect(() => {
    setDisplayCount(20)
  }, [ecpAuthId, status, vehicleNumberDebounced, searchDebounced, dateRange])

  const displayedFines = useMemo(() => {
    return filteredFines.slice(0, displayCount)
  }, [filteredFines, displayCount])

  const hasMore = displayCount < filteredFines.length

  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount(prev => Math.min(prev + 20, filteredFines.length))
    }
  }, [hasMore, filteredFines.length])

  useEffect(() => {
    loadAllFines()
    setSelectedFines(new Set())
  }, [loadAllFines])

  useEffect(() => {
    const handleSync = () => loadAllFines()
    window.addEventListener('fines-synced', handleSync)
    return () => window.removeEventListener('fines-synced', handleSync)
  }, [loadAllFines])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }, [sortField])

  const getStatusBadge = useCallback((status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
        return <Badge variant="default" className="bg-emerald-500 text-white font-medium whitespace-nowrap">
          Оплачено
        </Badge>
      case 'unpaid':
        return <Badge variant="destructive" className="bg-red-500/85 text-white font-medium whitespace-nowrap">
          Не оплачено
        </Badge>
      case 'partially_paid':
        return <Badge variant="secondary" className="bg-amber-500 text-white font-medium whitespace-nowrap">
          Частично оплачено
        </Badge>
        default:
        return <Badge variant="secondary">{status || 'Неизвестно'}</Badge>
    }
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedFines(new Set(displayedFines.map(f => f.id)))
    } else {
      setSelectedFines(new Set())
    }
  }, [displayedFines])

  const handleSelectFine = useCallback((fineId: string, checked: boolean) => {
    setSelectedFines(prev => {
      const newSelected = new Set(prev)
      if (checked) {
        newSelected.add(fineId)
      } else {
        newSelected.delete(fineId)
      }
      return newSelected
    })
  }, [])

  const exportToExcel = useCallback((data: Fine[], filename: string) => {
    if (data.length === 0) {
      toast.error('Нет данных для экспорта')
      return
    }

    const exportData = data.map(fine => ({
      'Статус': fine.status === 'paid' ? 'Оплачено' : fine.status === 'partially_paid' ? 'Частично оплачено' : 'Не оплачено',
      'Совершено': fine.commitDate ? format(new Date(fine.commitDate), 'dd.MM.yyyy HH:mm') : '',
      'Предписание': fine.decisionDate ? format(new Date(fine.decisionDate), 'dd.MM.yyyy') : '',
      'Номер дела': fine.caseNumber || '',
      'ФИО/Компания': fine.fullName,
      'Госномер': fine.vehicleNumber,
      'Серийный номер': fine.serialNumber || '',
      'Статья': fine.articleCode,
      'Описание статьи': fine.articleName,
      'Сумма': fine.amountTotal ? `${fine.amountTotal} ₸` : '',
      'ИИН/БИН': fine.ecpAuth.iinBin,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')

    const columnHeaders = Object.keys(exportData[0] || {})
    const colWidths = columnHeaders.map((header, colIndex) => {
      let maxWidth = header.length

      exportData.forEach(row => {
        const cellValue = String(row[header as keyof typeof row] || '')
        maxWidth = Math.max(maxWidth, cellValue.length)
      })

      return { wch: Math.min(Math.max(maxWidth + 3, 10), 50) }
    })

    ws['!cols'] = colWidths

    const headerStyle = {
      font: {
        bold: true,
        sz: 12,
        color: { rgb: "FFFFFF" },
        name: "Arial"
      },
      fill: {
        fgColor: { rgb: "4F46E5" }
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true
      },
      border: {
        top: { style: "thin", color: { rgb: "FFFFFF" } },
        bottom: { style: "thin", color: { rgb: "FFFFFF" } },
        left: { style: "thin", color: { rgb: "FFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFF" } }
      }
    }

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
      if (ws[cellAddress]) {
        ws[cellAddress].s = headerStyle
      }
    }

    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cellAddress]) continue

        const isStatusColumn = C === 0
        const isAmountColumn = C === 9
        const isEvenRow = R % 2 === 0

        let bgColor = isEvenRow ? { rgb: "F9FAFB" } : { rgb: "FFFFFF" }

        if (isStatusColumn) {
          const statusValue = ws[cellAddress].v
          if (statusValue === 'Оплачено') {
            bgColor = { rgb: "D1FAE5" }
          } else if (statusValue === 'Не оплачено') {
            bgColor = { rgb: "FEE2E2" }
          } else if (statusValue === 'Частично оплачено') {
            bgColor = { rgb: "FEF3C7" }
          }
        }

        ws[cellAddress].s = {
          font: {
            sz: 11,
            name: "Arial"
          },
          fill: {
            fgColor: bgColor
          },
          alignment: {
            horizontal: isAmountColumn ? "right" : (isStatusColumn ? "center" : "left"),
            vertical: "center",
            wrapText: false
          },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } }
          }
        }
      }
    }

    const totalRow = range.e.r + 2
    const totalAmount = data.reduce((sum, fine) => sum + parseFloat(fine.amountTotal || '0'), 0)

    const totalLabelCell = XLSX.utils.encode_cell({ r: totalRow, c: 8 })
    ws[totalLabelCell] = {
      v: 'ИТОГО:',
      t: 's',
      s: {
        font: {
          bold: true,
          sz: 13,
          name: "Arial"
        },
        alignment: {
          horizontal: "right",
          vertical: "center"
        },
        fill: {
          fgColor: { rgb: "F3F4F6" }
        },
        border: {
          top: { style: "medium", color: { rgb: "374151" } },
          bottom: { style: "medium", color: { rgb: "374151" } },
          left: { style: "thin", color: { rgb: "374151" } },
          right: { style: "thin", color: { rgb: "374151" } }
        }
      }
    }

    const totalAmountCell = XLSX.utils.encode_cell({ r: totalRow, c: 9 })
    ws[totalAmountCell] = {
      v: `${totalAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₸`,
      t: 's',
      s: {
        font: {
          bold: true,
          sz: 13,
          color: { rgb: "DC2626" },
          name: "Arial"
        },
        fill: {
          fgColor: { rgb: "FEF3C7" }
        },
        alignment: {
          horizontal: "right",
          vertical: "center"
        },
        border: {
          top: { style: "medium", color: { rgb: "374151" } },
          bottom: { style: "medium", color: { rgb: "374151" } },
          left: { style: "thin", color: { rgb: "374151" } },
          right: { style: "thin", color: { rgb: "374151" } }
        }
      }
    }

    range.e.r = totalRow
    ws['!ref'] = XLSX.utils.encode_range(range)

    ws['!freeze'] = { xSplit: 0, ySplit: 1 }

    ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}${range.e.r - 1}` }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Штрафы')

    XLSX.writeFile(wb, filename)

    toast.success('Файл Excel успешно создан!')
  }, [])

  const handleExportSelected = useCallback(() => {
    if (selectedFines.size === 0) {
      toast.error('Выберите штрафы для экспорта')
      return
    }

    const selectedData = displayedFines.filter(f => selectedFines.has(f.id))
    exportToExcel(selectedData, `Штрафы_выделенные_${format(new Date(), 'dd.MM.yyyy')}.xlsx`)
    toast.success(`Экспортировано выделенных штрафов: ${selectedFines.size}`)
  }, [selectedFines, displayedFines, exportToExcel])

  const handleExportAll = useCallback(() => {
    exportToExcel(filteredFines, `Штрафы_все_${format(new Date(), 'dd.MM.yyyy')}.xlsx`)
    toast.success(`Экспортировано всех штрафов: ${filteredFines.length}`)
  }, [filteredFines, exportToExcel])


  const selectedFinesTotal = useMemo(() => {
    if (selectedFines.size === 0) return 0
    return displayedFines
      .filter(f => selectedFines.has(f.id))
      .reduce((sum, f) => sum + parseFloat(f.amountTotal || '0'), 0)
  }, [selectedFines, displayedFines])


  if (isLoading && allFines.length === 0) {
    return <FinesTableSkeleton />
  }

  return (
    <div className="space-y-8">
      <FinesAnalytics fines={filteredFines} selectedFines={selectedFines} />

        <Card>
          <FinesTableHeader
            totalFines={filteredFines.length}
            selectedFines={selectedFines}
            selectedFinesTotal={selectedFinesTotal}
            isTableExpanded={isTableExpanded}
            isLoading={isLoading}
            onToggleExpanded={() => setIsTableExpanded(!isTableExpanded)}
            onExportAll={handleExportAll}
            onExportSelected={handleExportSelected}
          />
          <CardContent
            className={`transition-all duration-300 overflow-hidden ${
              isTableExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <FinesFilters
              search={search}
              onSearchChange={setSearch}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              status={status}
              onStatusChange={setStatus}
              ecpAuthId={ecpAuthId}
              onEcpAuthChange={setEcpAuthId}
              ecpAuths={ecpAuths}
            />

            <FinesTableBody
              displayedFines={displayedFines}
              filteredFines={filteredFines}
              selectedFines={selectedFines}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onSelectAll={handleSelectAll}
              onSelectFine={handleSelectFine}
              onSort={handleSort}
              getStatusBadge={getStatusBadge}
            />
          </CardContent>
      </Card>
    </div>
  )
})
