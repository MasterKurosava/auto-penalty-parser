'use client'

import { NCALayerClient } from 'ncalayer-js-client'

export async function getGuid(): Promise<string> {
  const response = await fetch('/api/psap/access-uuid')
  if (!response.ok) throw new Error('Failed to get access UUID')
  const data = await response.json()
  return data.guid
}

export function buildRequestXml(guid: string): string {
  return `<auth><guid>${guid}</guid></auth>`
}

export async function signXmlWithNCALayer(xml: string): Promise<string> {
  const client = new NCALayerClient()
  await client.connect()

  let signedXml = await client.basicsSignXML(
    null,
    xml,
    { tbsElementXPath: '/', signatureElementXPath: '/' },
    NCALayerClient.basicsSignerTestAny
  )

  if (Array.isArray(signedXml)) {
    signedXml = signedXml[0]
  }

  return signedXml
}

export async function authenticateWithEds(): Promise<{
  uuid: string
  token: string
  iin?: string
  id?: string
}> {
  const guid = await getGuid()
  const xml = buildRequestXml(guid)
  const signedXml = await signXmlWithNCALayer(xml)

  const response = await fetch('/api/psap/auth-by-uuid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: signedXml,
  })

  if (!response.ok) {
    throw new Error('Authentication failed')
  }

  return response.json()
}
