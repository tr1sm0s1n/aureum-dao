// import { IdStatement, IdProofOutput } from '@concordium/web-sdk';

/**
 * Fetch the item names from the backend
 */
export async function getNames(verifier) {
  const response = await fetch(`${verifier}/names`, { method: 'get' })
  const body = await response.json()
  return JSON.parse(body)
}

/**
 * Fetch a challenge from the backend
 */
export async function getChallenge(verifier, accountAddress) {
  const response = await fetch(
    `${verifier}/challenge?address=` + accountAddress,
    { method: 'get' },
  )
  const body = await response.json()
  return body.challenge
}

/**
 * Fetch the statement to prove from the backend
 */
export async function getStatement(verifier) {
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
export async function authorize(verifier, challenge, proof) {
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
