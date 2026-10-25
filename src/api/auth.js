/**
 * Authentication API Service
 * ===========================
 * Handles user identity and session induction.
 */

import api from './axios'

/**
 * Simulates a JWT-based authentication flow.
 * In a production environment, this would exchange credentials for a token.
 * @param {string} email - The unique identifier for the user or node.
 * @param {string} role - The access level (submitter vs contributor).
 */
export const mockLogin = (email, role) =>
  api.post('/auth/mock-login', { email, role }).then((r) => r.data)
