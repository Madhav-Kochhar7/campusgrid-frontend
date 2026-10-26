/**
 * Frontend-Only Authentication Service
 * =====================================
 * Generates client-side JWT mock tokens and identities without 
 * requiring an external auth server.
 */

/**
 * Creates a client-side simulated JWT-compliant authentication payload.
 * Generates standard 3-segment base64 token with expiration metadata.
 * 
 * @param {string} email - User identifier
 * @param {string} role - 'submitter' (Researcher) or 'contributor' (Worker)
 */
export const mockLogin = async (email, role = 'submitter') => {
  // Brief delay to allow button animation and spinner feedback
  await new Promise((resolve) => setTimeout(resolve, 250))

  const cleanRole = role || 'submitter'
  const cleanEmail = email || (cleanRole === 'submitter' ? 'student@campus.edu' : 'node@campus.edu')
  const userId = cleanRole === 'submitter' ? 'usr-student-6a72' : 'usr-node-8f53'

  // Standard 3-part JWT structure: header.payload.signature
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days valid
  const payload = btoa(JSON.stringify({
    sub: userId,
    email: cleanEmail,
    role: cleanRole,
    type: 'user',
    exp,
  }))
  const signature = btoa('campusgrid_mock_secret_signature')
  const access_token = `${header}.${payload}.${signature}`

  const user = {
    id: userId,
    email: cleanEmail,
    role: cleanRole,
    name: cleanRole === 'submitter' ? 'Grid Researcher' : 'Hardware Contributor',
  }

  return {
    access_token,
    token_type: 'bearer',
    user,
  }
}
