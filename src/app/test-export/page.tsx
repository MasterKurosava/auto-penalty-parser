'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NCALayerClient } from 'ncalayer-js-client'
import { toast } from 'sonner'
import { Loader2, Download, Key } from 'lucide-react'
import * as XLSX from 'xlsx-js-style'

export default function TestExportPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [progress, setProgress] = useState('')

  const handleConnectECP = async () => {
    setIsConnecting(true)
    setProgress('Подключение к NCALayer...')

    try {
      const client = new NCALayerClient()
      await client.connect()
      setProgress('Получение UUID...')

      const uuidResponse = await fetch('/api/psap/access-uuid')
      if (!uuidResponse.ok) throw new Error('Ошибка получения UUID')
      const { guid } = await uuidResponse.json()

      setProgress('Подписание XML...')
      const xml = `<auth><guid>${guid}</guid></auth>`
      let signedXml

      try {
        signedXml = await client.basicsSignXML(
          'PKCS12',
          xml,
          { tbsElementXPath: '/', signatureElementXPath: '/' },
          NCALayerClient.basicsSignerTestAny
        )

        if (Array.isArray(signedXml)) {
          signedXml = signedXml[0]
        }
      } catch (signError: any) {
        throw new Error('Ошибка подписания: ' + (signError.message || 'Неизвестная ошибка'))
      }

      setProgress('Аутентификация в ПСАП...')
      const authResponse = await fetch('/api/psap/auth-by-uuid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: signedXml,
      })

      if (!authResponse.ok) {
        const errorText = await authResponse.text()
        throw new Error('Ошибка аутентификации: ' + errorText)
      }

      const authData = await authResponse.json()

      setProgress('Сохранение сессии...')
      const saveResponse = await fetch('/api/ecp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: 'Test Export Session',
          iinBin: authData.iin,
          authToken: authData.token,
          refreshToken: authData.refreshToken,
          uuid: authData.uuid,
          psapId: authData.id,
        }),
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        if (saveResponse.status === 401) {
          toast.error('Сессия истекла. Пожалуйста, войдите снова.')
          window.location.href = '/login'
          return
        }
        throw new Error(error.error || 'Ошибка сохранения аутентификации')
      }

      toast.success('ЭЦП успешно подключена!')
      setIsConnected(true)
      setProgress('')
    } catch (error: any) {
      toast.error(error.message || 'Произошла ошибка при подключении ЭЦП')
      setProgress('')
    } finally {
      setIsConnecting(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPaidStatus = (paid: number) => {
    switch (paid) {
      case 0:
        return 'Не оплачен'
      case 1:
        return 'Частично оплачен'
      case 2:
        return 'Полностью оплачен'
      default:
        return 'Неизвестно'
    }
  }

  const handleExportToExcel = async () => {
    setIsExporting(true)
    setProgress('Загрузка данных штрафов...')

    try {
      const response = await fetch('/api/test/fines-all')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка загрузки данных')
      }

      const result = await response.json()
      const fines = result.data

      if (!fines || fines.length === 0) {
        toast.warning('Нет данных для экспорта')
        setProgress('')
        return
      }

      setProgress(`Подготовка Excel документа (${fines.length} записей)...`)

      // Подготовка данных для Excel
      const excelData = fines.map((fine: any, index: number) => ({
        // Основная информация
        '№': index + 1,
        'ID записи': fine.id || '',
        'RID': fine.rid || '',
        'Номер дела': fine.caseNumber || '',
        'Дата нарушения': formatDate(fine.commitDate),

        // Статья нарушения
        'ID статьи': fine.article?.id || '',
        'Код статьи': fine.article?.code || '',
        'Статья (RU)': fine.article?.nameRu || '',
        'Статья (KK)': fine.article?.nameKk || '',
        'Статья (QQ)': fine.article?.nameQq || '',

        // Административное постановление (lastAp)
        'ID постановления': fine.lastAp?.id || '',
        'Сумма штрафа': fine.lastAp?.totalAmount || '',
        'Сумма со скидкой 50%': fine.lastAp?.halfAmount || '',

        // Решение (lastAp.decision)
        'ID решения': fine.lastAp?.decision?.id || '',
        'Код решения': fine.lastAp?.decision?.code || '',
        'Решение (RU)': fine.lastAp?.decision?.nameRu || '',
        'Решение (KK)': fine.lastAp?.decision?.nameKk || '',
        'Решение (QQ)': fine.lastAp?.decision?.nameQq || '',

        // Мера наказания (lastAp.penaltyMeasure)
        'ID меры наказания (AP)': fine.lastAp?.penaltyMeasure?.id || '',
        'Код меры наказания (AP)': fine.lastAp?.penaltyMeasure?.code || '',
        'Мера наказания AP (RU)': fine.lastAp?.penaltyMeasure?.nameRu || '',
        'Мера наказания AP (KK)': fine.lastAp?.penaltyMeasure?.nameKk || '',
        'Мера наказания AP (QQ)': fine.lastAp?.penaltyMeasure?.nameQq || '',

        // Мера наказания (основная)
        'ID меры наказания': fine.penaltyMeasure?.id || '',
        'Код меры наказания': fine.penaltyMeasure?.code || '',
        'Мера наказания (RU)': fine.penaltyMeasure?.nameRu || '',
        'Мера наказания (KK)': fine.penaltyMeasure?.nameKk || '',
        'Мера наказания (QQ)': fine.penaltyMeasure?.nameQq || '',

        // Статус оплаты
        'Код оплаты': fine.paid,
        'Статус оплаты': getPaidStatus(fine.paid),

        // Физическое лицо (av1f)
        'ID физ. лица': fine.av1f?.id || '',
        'Фамилия': fine.av1f?.lastname || '',
        'Имя': fine.av1f?.firstname || '',
        'Отчество': fine.av1f?.patronymic || '',
        'ФИО полностью': fine.av1f?.lastname
          ? `${fine.av1f.lastname} ${fine.av1f.firstname} ${fine.av1f.patronymic || ''}`.trim()
          : '',
        'ИИН': fine.av1f?.iin || '',

        // Юридическое лицо (av1j)
        'ID юр. лица': fine.av1j?.id || '',
        'Наименование организации': fine.av1j?.name || '',
        'БИН': fine.av1j?.bin || '',
        'Дата перерегистрации': fine.av1j?.reRegistrationDate ? formatDate(fine.av1j.reRegistrationDate) : '',

        // Транспортное средство (av1o)
        'Гос. номер': fine.av1o?.grnz || '',
        'Номер СТС': fine.av1o?.srtsNumber || '',
      }))

      setProgress('Форматирование Excel...')

      // Создание workbook и worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Настройка ширины колонок
      const columnWidths = [
        { wch: 5 },   // №
        { wch: 65 },  // ID записи
        { wch: 65 },  // RID
        { wch: 18 },  // Номер дела
        { wch: 18 },  // Дата нарушения

        { wch: 20 },  // ID статьи
        { wch: 12 },  // Код статьи
        { wch: 50 },  // Статья (RU)
        { wch: 50 },  // Статья (KK)
        { wch: 50 },  // Статья (QQ)

        { wch: 65 },  // ID постановления
        { wch: 15 },  // Сумма штрафа
        { wch: 15 },  // Сумма со скидкой 50%

        { wch: 12 },  // ID решения
        { wch: 12 },  // Код решения
        { wch: 45 },  // Решение (RU)
        { wch: 45 },  // Решение (KK)
        { wch: 45 },  // Решение (QQ)

        { wch: 12 },  // ID меры наказания (AP)
        { wch: 12 },  // Код меры наказания (AP)
        { wch: 50 },  // Мера наказания AP (RU)
        { wch: 50 },  // Мера наказания AP (KK)
        { wch: 50 },  // Мера наказания AP (QQ)

        { wch: 12 },  // ID меры наказания
        { wch: 12 },  // Код меры наказания
        { wch: 50 },  // Мера наказания (RU)
        { wch: 50 },  // Мера наказания (KK)
        { wch: 50 },  // Мера наказания (QQ)

        { wch: 12 },  // Код оплаты
        { wch: 20 },  // Статус оплаты

        { wch: 65 },  // ID физ. лица
        { wch: 20 },  // Фамилия
        { wch: 20 },  // Имя
        { wch: 20 },  // Отчество
        { wch: 35 },  // ФИО полностью
        { wch: 15 },  // ИИН

        { wch: 65 },  // ID юр. лица
        { wch: 50 },  // Наименование организации
        { wch: 15 },  // БИН
        { wch: 18 },  // Дата перерегистрации

        { wch: 12 },  // Гос. номер
        { wch: 15 },  // Номер СТС
      ]
      ws['!cols'] = columnWidths

      // Стилизация заголовков
      const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      }

      // Стилизация данных
      const dataStyle = {
        alignment: { vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
          left: { style: 'thin', color: { rgb: 'D3D3D3' } },
          right: { style: 'thin', color: { rgb: 'D3D3D3' } },
        },
      }

      const numberStyle = {
        ...dataStyle,
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: '#,##0.00',
      }

      // Применение стилей к заголовкам и данным
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')

      // Стилизация заголовков (первая строка)
      const headerCells = []
      for (let C = range.s.c; C <= range.e.c; ++C) {
        headerCells.push(XLSX.utils.encode_cell({ r: 0, c: C }))
      }

      headerCells.forEach(cell => {
        if (ws[cell]) {
          ws[cell].s = headerStyle
        }
      })

      // Применение стилей к данным
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
          if (!ws[cellAddress]) continue

          // Колонки с суммами (L=11, M=12 - "Сумма штрафа" и "Сумма со скидкой 50%")
          if (C === 11 || C === 12) {
            ws[cellAddress].s = numberStyle
          } else {
            ws[cellAddress].s = dataStyle
          }

          // Чередование цветов строк
          if (R % 2 === 0) {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              fill: { fgColor: { rgb: 'F2F2F2' } },
            }
          }
        }
      }

      // Высота строки заголовка
      ws['!rows'] = [{ hpt: 30 }]

      XLSX.utils.book_append_sheet(wb, ws, 'Штрафы')

      setProgress('Сохранение файла...')

      // Генерация и скачивание файла
      const fileName = `Штрафы_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}_${new Date().getTime()}.xlsx`
      XLSX.writeFile(wb, fileName)

      toast.success(`Успешно экспортировано ${fines.length} записей!`)
      setProgress('')
    } catch (error: any) {
      toast.error(error.message || 'Произошла ошибка при экспорте')
      setProgress('')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Тестовая страница экспорта штрафов
        </h1>

        <div className="grid gap-6">
          {/* Карточка подключения ЭЦП */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Шаг 1: Подключение ЭЦП
              </CardTitle>
              <CardDescription>
                Подключите вашу электронную цифровую подпись для доступа к данным ПСАП
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={handleConnectECP}
                  disabled={isConnecting || isConnected}
                  className="w-full"
                  size="lg"
                >
                  {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isConnected ? '✓ ЭЦП подключена' : 'Подключить ЭЦП'}
                </Button>
                {isConnecting && progress && (
                  <p className="text-sm text-muted-foreground text-center">{progress}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Карточка экспорта */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Шаг 2: Экспорт в Excel
              </CardTitle>
              <CardDescription>
                Загрузите все штрафы из ПСАП и экспортируйте их в красиво отформатированный Excel документ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={handleExportToExcel}
                  disabled={!isConnected || isExporting}
                  className="w-full"
                  size="lg"
                  variant={isConnected ? 'default' : 'secondary'}
                >
                  {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Экспортировать все штрафы в Excel
                </Button>
                {isExporting && progress && (
                  <p className="text-sm text-muted-foreground text-center">{progress}</p>
                )}
                {!isConnected && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-500 text-center">
                    Сначала подключите ЭЦП
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Информационная карточка */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Данные загружаются напрямую из ПСАП и НЕ сохраняются в базу данных</p>
              <p>• Excel документ содержит <strong>ВСЕ 44 поля</strong> каждого штрафа (включая все вложенные объекты)</p>
              <p>• Включены все переводы на русский, казахский (кириллица и латиница)</p>
              <p>• Файл автоматически форматируется с цветными заголовками и чередующимися строками</p>
              <p>• Процесс может занять некоторое время в зависимости от количества штрафов</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

