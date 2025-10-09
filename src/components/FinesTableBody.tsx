'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowUpDown } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { FinesTableRow } from './FinesTableRow'

interface Fine {
  id: string
  externalId: string
  status: string
  commitDate: string | null
  decisionDate: string | null
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

interface FinesTableBodyProps {
  displayedFines: Fine[]
  filteredFines: Fine[]
  selectedFines: Set<string>
  hasMore: boolean
  onLoadMore: () => void
  onSelectAll: (checked: boolean) => void
  onSelectFine: (fineId: string, checked: boolean) => void
  onSort: (field: SortField) => void
  getStatusBadge: (status: string) => React.ReactNode
}

export const FinesTableBody = React.memo(function FinesTableBody({
  displayedFines,
  filteredFines,
  selectedFines,
  hasMore,
  onLoadMore,
  onSelectAll,
  onSelectFine,
  onSort,
  getStatusBadge
}: FinesTableBodyProps) {
  if (displayedFines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Штрафы не найдены. Попробуйте синхронизировать или изменить фильтры.
      </div>
    )
  }

  return (
    <InfiniteScroll
      dataLength={displayedFines.length}
      next={onLoadMore}
      hasMore={hasMore}
      loader={<div className="h-2" />}
      endMessage={
        displayedFines.length > 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Показаны все {filteredFines.length} штрафов
          </div>
        ) : null
      }
      scrollThreshold={0.95}
      height={600}
      style={{ overflow: 'auto' }}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow className="border-b-2">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedFines.size === displayedFines.length && displayedFines.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort('status')}>
                  Статус
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort('commitDate')}>
                  Совершение
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort('decisionDate')}>
                  Предписание
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort('fullName')}>
                  ФИО/Компания
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort('vehicleNumber')}>
                  Госномер
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort('articleCode')}>
                  Статья
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => onSort('amountTotal')}>
                  Сумма
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedFines.map((fine) => (
              <FinesTableRow
                key={fine.id}
                fine={fine}
                isSelected={selectedFines.has(fine.id)}
                onSelect={onSelectFine}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </InfiniteScroll>
  )
})
