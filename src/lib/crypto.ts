import sodium from 'libsodium-wrappers'

let sodiumReady = false

async function ensureSodiumReady() {
  if (!sodiumReady) {
    await sodium.ready
    sodiumReady = true
  }
}

function getEncryptionKey(): Uint8Array {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY is not set in environment variables')
  }
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  return Buffer.from(key, 'hex')
}

export async function encryptToken(plaintext: string): Promise<Buffer> {
  await ensureSodiumReady()

  const key = getEncryptionKey()
  const nonce = Buffer.from(sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES))
  const message = sodium.from_string(plaintext)

  const ciphertext = Buffer.from(sodium.crypto_secretbox_easy(message, nonce, key))

  const combined = Buffer.allocUnsafe(nonce.length + ciphertext.length)
  nonce.copy(combined, 0)
  ciphertext.copy(combined, nonce.length)

  return combined
}

export async function decryptToken(encrypted: Buffer | Uint8Array): Promise<string> {
  await ensureSodiumReady()

  const key = getEncryptionKey()
  const data = new Uint8Array(encrypted)

  const nonce = data.slice(0, sodium.crypto_secretbox_NONCEBYTES)
  const ciphertext = data.slice(sodium.crypto_secretbox_NONCEBYTES)

  const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key)

  if (!decrypted) {
    throw new Error('Decryption failed - invalid key or corrupted data')
  }

  return sodium.to_string(decrypted)
}

