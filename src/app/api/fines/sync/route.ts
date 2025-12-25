import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decryptToken } from '@/lib/crypto'
import { extractDecisionDateFromPdf } from '@/lib/pdf-parser'
import axios from 'axios'
import https from 'https'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const ecpAuths = await prisma.ecpAuth.findMany({
      where: {
        userId: user.userId,
        isActive: true,
        isValid: true,
      },
    })

    if (ecpAuths.length === 0) {
      return NextResponse.json(
        { error: 'Нет активных подключений для синхронизации' },
        { status: 400 }
      )
    }

    let totalSynced = 0
    const results: Array<{
      ecpAuthId: string
      iinBin: string
      success: boolean
      count?: number
      error?: string
      invalidated?: boolean
    }> = []

    const agent = new https.Agent({
      rejectUnauthorized: false,
    })

    for (const ecpAuth of ecpAuths) {
      try {
        const authToken = await decryptToken(ecpAuth.authTokenEnc)
        const refreshToken = ecpAuth.refreshTokenEnc
          ? await decryptToken(ecpAuth.refreshTokenEnc)
          : null
        const uuid = await decryptToken(ecpAuth.uuidEnc)

        const cookies = [
          `psap-uuid=${uuid}`,
          `psap-token=${authToken}`,
          `psap-token-created-at=${encodeURIComponent(new Date().toISOString())}`,
          refreshToken ? `psap-refresh-token=${refreshToken}` : '',
        ].filter(Boolean).join('; ')

        let allCases: any[] = []
        let pageNum = 1
        const pageLimit = 10

        while (true) {
          const url = `https://erap-public.kgp.kz/psap/api/cases/load/?pageNum=${pageNum}&limit=${pageLimit}&orderBy=desc`
          
          try {
            const response = await axios.get(url, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Cookie': cookies,
              },
              httpsAgent: agent,
              timeout: 60000,
            })

            const pageCases = Array.isArray(response.data) ? response.data : (response.data?.data || [])
            allCases = allCases.concat(pageCases)

            if (pageCases.length === 0 || pageCases.length < pageLimit) {
              break
            }
            pageNum++
          } catch (apiError: any) {
            if (allCases.length > 0) {
              break
            }
            
            if (apiError.response?.status === 500) {
              const errorMessage = apiError.response?.data?.message || apiError.message
              throw new Error(`Ошибка API штрафов (500): ${errorMessage}`)
            }
            
            throw apiError
          }
        }

        const cases = allCases

        const existingFines = await prisma.fine.findMany({
          where: { ecpAuthId: ecpAuth.id },
          select: { externalId: true }
        })
        const existingExternalIds = new Set(existingFines.map(f => f.externalId))

        const finesToCreate: Array<{
          ecpAuthId: string
          externalId: string
          status: string
          commitDate: Date | null
          decisionDate: Date | null
          caseNumber: string | null
          fullName: string
          vehicleNumber: string
          serialNumber: string | null
          articleCode: string
          articleName: string
          amountTotal: number
          pdfUrl: string | null
          updatedAt: Date
        }> = []

        const finesToUpdate: Array<{
          where: {
            ecpAuthId_externalId: {
              ecpAuthId: string
              externalId: string
            }
          }
          data: {
            status: string
            commitDate: Date | null
            decisionDate: Date | null
            caseNumber: string | null
            fullName: string
            vehicleNumber: string
            serialNumber: string | null
            articleCode: string
            articleName: string
            amountTotal: number
            pdfUrl: string | null
            updatedAt: Date
          }
        }> = []

        const pdfExtractionTasks: Array<{
          index: number
          pdfUrl: string
        }> = []

        for (const caseItem of cases) {
            if (!caseItem || typeof caseItem !== 'object') {
              continue
            }

            const caseNumber = caseItem.caseNumber || caseItem.case_number || null
            const externalId = caseNumber || caseItem.rid || caseItem.id

            if (!externalId) {
              continue
            }

            let status = 'unpaid'
            if (caseItem.paid === 1) {
              status = 'paid'
            } else if (caseItem.paid === 3) {
              status = 'partially_paid'
            }

            const vehicleNumber = caseItem.av1o?.grnz || ''

            const pdfUrl = caseItem.rid
              ? `https://erap-public.kgp.kz/psap/api/pdf/showpdf/av/${caseItem.rid}`
              : null

            let fullName = ''
            if (caseItem.av1f) {
              fullName = `${caseItem.av1f.lastName || ''} ${caseItem.av1f.firstName || ''} ${caseItem.av1f.middleName || ''}`.trim()
            } else if (caseItem.av1j) {
              fullName = caseItem.av1j.name || ''
            }

            const serialNumber = caseItem.av1o?.srtsNumber || null

            const articleCode = caseItem.article?.code || ''
            const articleName = caseItem.article?.nameRu || ''

            let apiDecisionDate: Date | null = null
            try {
              if (caseItem.decisionDate) {
                apiDecisionDate = new Date(caseItem.decisionDate)
              } else if (caseItem.decision_date) {
                apiDecisionDate = new Date(caseItem.decision_date)
              } else if (caseItem.lastAp?.decisionDate) {
                apiDecisionDate = new Date(caseItem.lastAp.decisionDate)
              } else if (caseItem.lastAp?.decision_date) {
                apiDecisionDate = new Date(caseItem.lastAp.decision_date)
              }
              
              if (apiDecisionDate && isNaN(apiDecisionDate.getTime())) {
                apiDecisionDate = null
              }
            } catch (dateError) {
              apiDecisionDate = null
            }

            let amountTotal = 0
            if (caseItem.lastAp && caseItem.lastAp.totalAmount != null) {
              const parsed = parseFloat(caseItem.lastAp.totalAmount)
              if (!isNaN(parsed)) {
                amountTotal = parsed
              }
            }

            let commitDate: Date | null = null
            try {
              if (caseItem.commitDate) {
                commitDate = new Date(caseItem.commitDate)
                if (isNaN(commitDate.getTime())) {
                  commitDate = null
                }
              }
            } catch (dateError) {
              commitDate = null
            }

            const fineData = {
              status: status,
              commitDate: commitDate,
              decisionDate: apiDecisionDate,
              caseNumber: caseNumber,
              fullName: fullName,
              vehicleNumber: vehicleNumber,
              serialNumber: serialNumber,
              articleCode: articleCode,
              articleName: articleName,
              amountTotal: amountTotal,
              pdfUrl: pdfUrl,
              updatedAt: new Date(),
            }

            const currentIndex = finesToCreate.length + finesToUpdate.length

            if (existingExternalIds.has(externalId)) {
              finesToUpdate.push({
                where: {
                  ecpAuthId_externalId: {
                    ecpAuthId: ecpAuth.id,
                    externalId: externalId,
                  }
                },
                data: fineData
              })

              if (pdfUrl) {
                pdfExtractionTasks.push({
                  index: currentIndex,
                  pdfUrl: pdfUrl,
                })
              }
            } else {
              finesToCreate.push({
                ecpAuthId: ecpAuth.id,
                externalId: externalId,
                ...fineData
              })

              if (pdfUrl) {
                pdfExtractionTasks.push({
                  index: currentIndex,
                  pdfUrl: pdfUrl,
                })
              }
            }
          }

        if (pdfExtractionTasks.length > 0) {
          const PDF_BATCH_SIZE = 20
          const totalCreates = finesToCreate.length

          for (let i = 0; i < pdfExtractionTasks.length; i += PDF_BATCH_SIZE) {
            const batch = pdfExtractionTasks.slice(i, i + PDF_BATCH_SIZE)

            await Promise.allSettled(
              batch.map(async (task) => {
                const decisionDate = await extractDecisionDateFromPdf(
                  task.pdfUrl,
                  authToken
                )

                if (decisionDate) {
                  if (task.index < totalCreates) {
                    finesToCreate[task.index].decisionDate = decisionDate
                  } else {
                    const updateIndex = task.index - totalCreates
                    finesToUpdate[updateIndex].data.decisionDate = decisionDate
                  }
                }
              })
            )
          }
        }

        const BATCH_SIZE = 100

        if (finesToCreate.length > 0) {
          for (let i = 0; i < finesToCreate.length; i += BATCH_SIZE) {
            const batch = finesToCreate.slice(i, i + BATCH_SIZE)
            await prisma.fine.createMany({
              data: batch,
              skipDuplicates: true
            })
          }
        }

        if (finesToUpdate.length > 0) {
          for (let i = 0; i < finesToUpdate.length; i += BATCH_SIZE) {
            const batch = finesToUpdate.slice(i, i + BATCH_SIZE)
            await Promise.all(
              batch.map(updateData => prisma.fine.update(updateData))
            )
          }
        }

        const savedCount = cases.length

        await prisma.ecpAuth.update({
          where: { id: ecpAuth.id },
          data: { lastCheckedAt: new Date() },
        })

        totalSynced += savedCount
        results.push({
          ecpAuthId: ecpAuth.id,
          iinBin: ecpAuth.iinBin,
          success: true,
          count: savedCount,
        })
      } catch (error: any) {
        let invalidated = false

        if (error.response?.status === 401 || error.response?.status === 403) {
          await prisma.ecpAuth.update({
            where: { id: ecpAuth.id },
            data: { isValid: false },
          })
          invalidated = true
        }

        let errorMessage = error.message || 'Неизвестная ошибка'
        if (error.response?.status === 500) {
          const apiErrorMsg = error.response?.data?.message
          if (apiErrorMsg) {
            errorMessage = `Ошибка сервера штрафов: ${apiErrorMsg}`
          } else {
            errorMessage = 'Ошибка сервера штрафов (500). Возможно, проблема на стороне API.'
          }
        }

        results.push({
          ecpAuthId: ecpAuth.id,
          iinBin: ecpAuth.iinBin,
          success: false,
          error: errorMessage,
          invalidated: invalidated,
        })
      }
    }

    return NextResponse.json({
      message: 'Синхронизация завершена',
      totalSynced,
      results,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера', details: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      { status: 500 }
    )
  }
}
