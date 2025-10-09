declare module 'ncalayer-js-client' {
  export class NCALayerClient {
    static basicsSignerTestAny: any
    connect(): Promise<void>
    basicsSignXML(
      storageType: any,
      xml: string,
      options: { tbsElementXPath: string; signatureElementXPath: string },
      signerType: any
    ): Promise<string | string[]>
  }
}

