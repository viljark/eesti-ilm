/*
 * Writes android/google-services.json from the GOOGLE_SERVICES env var (EAS secret).
 * The secret is expected to be base64-encoded JSON; raw JSON is also accepted.
 * Skips silently when the secret is not available (eg. local dev on Windows).
 */
const fs = require('node:fs')
const path = require('node:path')

const target = path.join(__dirname, '..', 'google-services.json')
const secret = (process.env.GOOGLE_SERVICES || '').trim()

if (!secret) {
  console.log('writeGoogleServices: GOOGLE_SERVICES is not set, skipping (existing file kept)')
  process.exit(0)
}

const contents = secret.startsWith('{') ? secret : Buffer.from(secret, 'base64').toString('utf8')

if (!contents.trim().startsWith('{')) {
  console.error('writeGoogleServices: GOOGLE_SERVICES does not contain valid JSON (bad base64?)')
  process.exit(1)
}

fs.writeFileSync(target, contents)
console.log('writeGoogleServices: wrote google-services.json')
