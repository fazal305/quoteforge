// Generates a URL-safe random token for public quote links. Uses the
// Web Crypto API (available in all modern browsers) rather than Math.random,
// which is not cryptographically secure and must never be used for anything
// that guards access to data.
export function generateSecureToken(byteLength = 24) {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
