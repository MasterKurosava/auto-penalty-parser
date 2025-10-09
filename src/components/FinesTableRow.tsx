'use client'

import React from 'react'
import {
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { HelpCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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

interface FinesTableRowProps {
  fine: Fine
  isSelected: boolean
  onSelect: (fineId: string, checked: boolean) => void
  getStatusBadge: (status: string) => React.ReactNode
}

export const FinesTableRow = React.memo(function FinesTableRow({
  fine,
  isSelected,
  onSelect,
  getStatusBadge
}: FinesTableRowProps) {
  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(fine.id, checked as boolean)}
        />
      </TableCell>
      <TableCell>{getStatusBadge(fine.status)}</TableCell>
      <TableCell>
        {fine.commitDate ? (
          <div className="flex flex-col">
            <span>{format(new Date(fine.commitDate), 'dd.MM.yyyy')}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(fine.commitDate), 'HH:mm')}</span>
          </div>
        ) : '—'}
      </TableCell>
      <TableCell>
        {fine.decisionDate
          ? format(new Date(fine.decisionDate), 'dd.MM.yyyy')
          : '—'}
      </TableCell>
      <TableCell className="font-medium">
        <div className="text-sm">
          {fine.fullName}
        </div>
      </TableCell>
      <TableCell className="font-semibold">
        <div>{fine.vehicleNumber}</div>
        {fine.serialNumber && (
          <div className="text-xs text-muted-foreground font-mono">
            {fine.serialNumber}
          </div>
        )}
      </TableCell>
      <TableCell className="font-mono text-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-center cursor-help flex items-center justify-center gap-1">
                {fine.articleCode}
                <HelpCircle className="h-3 w-3" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{fine.articleName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="font-semibold text-lg">
        {fine.amountTotal ? `${parseFloat(fine.amountTotal).toLocaleString('ru-KZ')} ₸` : '—'}
      </TableCell>
      <TableCell className="text-center">
        {fine.pdfUrl ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600 font-medium px-3 py-1 rounded-lg transition-all duration-200"
                  onClick={() => window.open(fine.pdfUrl!, '_blank')}
                >
                  📄
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Скачать постановление</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
})
