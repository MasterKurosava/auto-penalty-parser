declare module 'ncalayer-js-client' {
  export class NCALayerClient {
    constructor(url?: string, allowKmdHttpApi?: boolean)
    connect(): Promise<string>
    getActiveTokens(): Promise<string[]>
    getKeyInfo(storageAlias: string): Promise<any>
    signXml(
      storageType: string,
      xmlToSign: string,
      signatureType: string,
      signatureXPath?: string
    ): Promise<string>
    basicsSignXML(
      allowedStorages: string[] | null,
      data: string,
      signingParams: any,
      signerParams: any,
      locale?: string
    ): Promise<string>
    static basicsSignerTestAny: any
  }
}

