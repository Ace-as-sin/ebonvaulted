import { randomBytes } from 'node:crypto'

const encryptionKey = randomBytes(32).toString('hex')
const hmacKey = randomBytes(32).toString('hex')

console.log('Add these to server/.env (never commit this file):\n')
console.log(`EMAIL_ENCRYPTION_KEY=${encryptionKey}`)
console.log(`EMAIL_HMAC_KEY=${hmacKey}`)
