import { VERIFIER_URL } from '../config/config'
import { Challenge, ProofWithContext } from './types'

const verifier = VERIFIER_URL
/**
 * Fetch a challenge from the backend
 */
export async function getChallenge(accountAddress: string) {
  const response = await fetch(
    `${verifier}/challenge?address=` + accountAddress,
    { method: 'get' }
  )
  const body = await response.json()
  return body.challenge
}

/**
 * Fetch the statement to prove from the backend
 */
export async function getStatement() {
  const response = await fetch(`${verifier}/statement`, { method: 'get' })
  // console.log("inside getstatement- res", response)
  const body = await response.json()
  const bodyString = JSON.stringify(body)
  // console.log("bodystr", bodyString)
  return JSON.parse(bodyString)
}

/**
 *  Authorize with the backend, and get a auth token.
 */
export async function authorize(challenge: Challenge, proof: ProofWithContext) {
  const response = await fetch(`${verifier}/prove`, {
    method: 'post',
    headers: new Headers({ 'content-type': 'application/json' }),
    body: JSON.stringify({ challenge, proof }),
  })
  if (!response.ok) {
    throw new Error('Unable to authorize')
  }
  const body = await response.json()
  if (body) {
    return body
  }
  throw new Error('Unable to authorize')
}
