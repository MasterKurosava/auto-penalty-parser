export interface PsapAuthResponse {
  uuid: string
  token: string
  refreshToken?: string
  id?: string
  iin?: string
}

export interface PsapCase {
  id: string
  rid: string
  caseNumber: string
  commitDate: string
  paid: number
  lastAp: {
    id: string
    totalAmount: string
    halfAmount: string | null
    decision: {
      id: number
      code: string
      nameRu: string
      nameKk: string
      nameQq: string
    }
    penaltyMeasure: any
  }
  av1f: {
    id: string
    lastName: string
    firstName: string
    middleName: string
    docNumber: string
    docIssueDate: string
    iin: string
    person: {
      id: string
      iin: string
      lastName: string
      firstName: string
      middleName: string
      birthDate: string
    }
  }
  av1j: any
  av1o: {
    grnz: string
    srtsNumber: string
  }
  article: {
    id: number
    code: string
    nameRu: string
    nameKk: string
    nameQq: string
  }
  penaltyMeasure: {
    id: number
    code: string
    nameRu: string
    nameKk: string
    nameQq: string
  } | null
}

export interface FinesFilter {
  dateFrom?: string
  dateTo?: string
  limit: number
}

