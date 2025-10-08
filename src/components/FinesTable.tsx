'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import * as Collapsible from '@radix-ui/react-collapsible'
import { FileJson, FileSpreadsheet, CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { PsapCase } from '@/lib/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import { FinesCharts } from './FinesCharts'

interface FinesTableProps {
  cases: PsapCase[]
}

type SortField = 'paid' | 'commitDate' | 'grnz' | 'article' | 'amount'
type SortDirection = 'asc' | 'desc' | null

export function FinesTable({ cases }: FinesTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [isChartsExpanded, setIsChartsExpanded] = useState(true)
  const [isTableExpanded, setIsTableExpanded] = useState(true)
  const exportToJson = () => {
    const dataStr = JSON.stringify(cases, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fines-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    if (cases.length === 0) return

    const exportData = cases.map((c) => ({
      'Статус': c.paid === 1 ? 'Оплачен' : c.paid === 3 ? 'Частично оплачен' : 'Не оплачен',
      'Дата нарушения': formatDate(c.commitDate),
      'Фамилия': c.av1f?.lastName || '',
      'Имя': c.av1f?.firstName || '',
      'Отчество': c.av1f?.middleName || '',
      'ИИН': c.av1f?.iin || '',
      'Госномер': c.av1o?.grnz || '',
      'СРТС': c.av1o?.srtsNumber || '',
      'Код статьи': c.article?.code || '',
      'Описание нарушения': c.article?.nameRu || '',
      'Сумма штрафа': c.lastAp?.totalAmount || '',
      'Льгота 50%': c.lastAp?.halfAmount || '',
      'Номер дела': c.caseNumber || '',
      'ID': c.id || '',
      'RID': c.rid || '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)

    const colWidths = Object.keys(exportData[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map((row) => String(row[key as keyof typeof row] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    ws['!cols'] = colWidths

    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1'
      if (!ws[address]) continue
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E0E0E0' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Штрафы')

    XLSX.writeFile(wb, `штрафы-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy HH:mm', { locale: ru })
    } catch {
      return dateStr
    }
  }

  const formatAmount = (amount: string | null | undefined) => {
    if (!amount) return '-'
    return `${parseInt(amount).toLocaleString('ru-KZ')} ₸`
  }

  const getFio = (c: PsapCase) => {
    if (!c.av1f) return '-'
    return `${c.av1f.lastName} ${c.av1f.firstName} ${c.av1f.middleName}`
  }

  const openPdf = (rid: string) => {
    const pdfUrl = `https://erap-public.kgp.kz/psap/api/pdf/showpdf/av/${rid}`
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedCases = useMemo(() => {
    if (!sortField || !sortDirection) return cases

    return [...cases].sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortField) {
        case 'paid':
          aVal = a.paid
          bVal = b.paid
          break
        case 'commitDate':
          aVal = new Date(a.commitDate).getTime()
          bVal = new Date(b.commitDate).getTime()
          break
        case 'grnz':
          aVal = a.av1o?.grnz || ''
          bVal = b.av1o?.grnz || ''
          break
        case 'article':
          aVal = a.article?.code || ''
          bVal = b.article?.code || ''
          break
        case 'amount':
          aVal = parseInt(a.lastAp?.totalAmount || '0')
          bVal = parseInt(b.lastAp?.totalAmount || '0')
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [cases, sortField, sortDirection])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 ml-1" />
    }
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
  }

  const totalAmount = cases.reduce((sum, c) => sum + (parseInt(c.lastAp?.totalAmount || '0')), 0)

  return (
    <div className="space-y-4">
      <Collapsible.Root open={isChartsExpanded} onOpenChange={setIsChartsExpanded}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">Аналитика и графики</CardTitle>
                <CardDescription className="text-sm">Визуализация данных по штрафам</CardDescription>
              </div>
              <Collapsible.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 w-full sm:w-auto"
                >
                  {isChartsExpanded ? (
                    <>
                      <span>Свернуть</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Развернуть</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </Collapsible.Trigger>
            </div>
          </CardHeader>
          <Collapsible.Content className="CollapsibleContent">
            <CardContent>
              <FinesCharts cases={cases} />
            </CardContent>
          </Collapsible.Content>
        </Card>
      </Collapsible.Root>

      <Collapsible.Root open={isTableExpanded} onOpenChange={setIsTableExpanded}>
        <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl">Список штрафов</CardTitle>
              <CardDescription className="text-sm">
                Общая сумма: {totalAmount.toLocaleString('ru-KZ')} ₸
              </CardDescription>
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="gap-1 flex-1 sm:flex-none"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToJson}
                className="gap-1 flex-1 sm:flex-none"
              >
                <FileJson className="h-4 w-4" />
                <span className="hidden sm:inline">JSON</span>
              </Button>
              <Collapsible.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 w-full sm:w-auto"
                >
                  {isTableExpanded ? (
                    <>
                      <span>Свернуть</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Развернуть</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </Collapsible.Trigger>
            </div>
          </div>
        </CardHeader>
        <Collapsible.Content className="CollapsibleContent">
          <CardContent className="px-0 sm:px-6">
            <div className="rounded-md border overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('paid')}
                      className="h-8 px-2 flex items-center"
                    >
                      Статус
                      <SortIcon field="paid" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('commitDate')}
                      className="h-8 px-2 flex items-center"
                    >
                      Дата
                      <SortIcon field="commitDate" />
                    </Button>
                  </TableHead>
                  <TableHead>ФИО</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('grnz')}
                      className="h-8 px-2 flex items-center"
                    >
                      Госномер
                      <SortIcon field="grnz" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('article')}
                      className="h-8 px-2 flex items-center"
                    >
                      Статья
                      <SortIcon field="article" />
                    </Button>
                  </TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('amount')}
                      className="h-8 px-2 flex items-center ml-auto"
                    >
                      Сумма
                      <SortIcon field="amount" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Льгота 50%</TableHead>
                  <TableHead className="text-center">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground h-32">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCases.map((c, idx) => (
                    <TableRow
                      key={c.id || idx}
                      className={
                        c.paid === 2 || c.paid === 0
                          ? 'bg-red-50/50 dark:bg-red-950/10'
                          : c.paid === 3
                          ? 'bg-orange-50/50 dark:bg-orange-950/10'
                          : ''
                      }
                    >
                      <TableCell>
                        {c.paid === 1 ? (
                          <Badge variant="default" className="gap-1 bg-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Оплачен
                          </Badge>
                        ) : c.paid === 3 ? (
                          <Badge variant="default" className="gap-1 bg-orange-600">
                            <XCircle className="h-3 w-3" />
                            Частично
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Не оплачен
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(c.commitDate)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {getFio(c)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-sm">
                            {c.av1o?.grnz || '-'}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {c.av1o?.srtsNumber || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {c.article?.code || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className="text-sm line-clamp-2 cursor-help hover:text-primary transition-colors">
                              {c.article?.nameRu || '-'}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Полное описание нарушения</h4>
                              <p className="text-sm text-muted-foreground">
                                {c.article?.nameRu || 'Описание отсутствует'}
                              </p>
                              {c.article?.code && (
                                <div className="pt-2 border-t">
                                  <span className="text-xs text-muted-foreground">
                                    Статья: {c.article.code}
                                  </span>
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatAmount(c.lastAp?.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.lastAp?.halfAmount ? (
                          <span className="text-green-600 font-semibold">
                            {formatAmount(c.lastAp.halfAmount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPdf(c.rid)}
                          className="h-8 gap-1"
                          title="Открыть PDF постановления"
                        >
                          <FileText className="h-4 w-4" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Collapsible.Content>
      </Card>
      </Collapsible.Root>
    </div>
  )
}

