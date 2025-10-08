import axios from 'axios'
import axiosRetry from 'axios-retry'
import https from 'https'
import fs from 'fs'

const baseURL = process.env.PSAP_API_BASE_URL || 'https://erap-public.kgp.kz'

let httpsAgent: https.Agent | undefined

if (process.env.NODE_EXTRA_CA_CERTS) {
  try {
    const ca = fs.readFileSync(process.env.NODE_EXTRA_CA_CERTS)
    httpsAgent = new https.Agent({ ca, rejectUnauthorized: true })
  } catch {}
} else {
  // Disable certificate verification for self-signed certificates
  // Note: This is required because erap-public.kgp.kz uses a certificate
  // that cannot be verified by standard CA certificates
  httpsAgent = new https.Agent({ rejectUnauthorized: false })
}

export const serverHttp = axios.create({
  baseURL,
  timeout: 20000,
  httpsAgent,
  validateStatus: (status) => status < 500,
})

axiosRetry(serverHttp, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status !== undefined && error.response.status >= 500)
    )
  },
})

