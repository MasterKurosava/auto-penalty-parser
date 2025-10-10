import pdf from 'pdf-parse'
import axios from 'axios'
import https from 'https'

export async function extractDecisionDateFromPdf(
  pdfUrl: string,
  authToken: string
): Promise<Date | null> {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    })

    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      httpsAgent: agent,
      timeout: 2000,
    })

    const buffer = Buffer.from(response.data)
    const data = await pdf(buffer)
    const text = data.text

    const datePatterns = [
      /(?:дата\s+предписания|предписание)\s*:?\s*(\d{1,2}\.\d{1,2}\.\d{4})/i,
      /(?:предписан[ио]|вынесен[ои]|составлен[ои])[^\d]*(\d{1,2}\.\d{1,2}\.\d{4})/i,
      /предписани[еия][^\d]{0,50}(\d{1,2}\.\d{1,2}\.\d{4})/i,
    ]

    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const dateString = match[1]
        const date = parseKazakhDate(dateString)
        if (date && isValidDate(date)) {
          return date
        }
      }
    }

    const allDatesPattern = /\b(\d{1,2}\.\d{1,2}\.\d{4})\b/g
    const matches = Array.from(text.matchAll(allDatesPattern))
    const validDates: Date[] = []

    for (const match of matches) {
      const dateString = match[1]
      const date = parseKazakhDate(dateString)
      if (date && isValidDate(date)) {
        const now = new Date()
        const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
        const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

        if (date >= fiveYearsAgo && date <= oneYearFromNow) {
          validDates.push(date)
        }
      }
    }

    if (validDates.length > 0) {
      return validDates[0]
    }

    return null
  } catch (error: any) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return null
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return null
    }
    return null
  }
}

function parseKazakhDate(dateString: string): Date | null {
  try {
    const parts = dateString.split('.')
    if (parts.length !== 3) return null

    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null
    if (day < 1 || day > 31) return null
    if (month < 1 || month > 12) return null
    if (year < 2000 || year > 2100) return null

    const date = new Date(year, month - 1, day)
    return date
  } catch {
    return null
  }
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

export async function batchExtractDecisionDates(
  pdfRequests: Array<{ pdfUrl: string; authToken: string }>,
  concurrencyLimit: number = 5
): Promise<Array<Date | null>> {
  const results: Array<Date | null> = []

  for (let i = 0; i < pdfRequests.length; i += concurrencyLimit) {
    const batch = pdfRequests.slice(i, i + concurrencyLimit)
    const batchResults = await Promise.all(
      batch.map(req => extractDecisionDateFromPdf(req.pdfUrl, req.authToken))
    )
    results.push(...batchResults)
  }

  return results
}
