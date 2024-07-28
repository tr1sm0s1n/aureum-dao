// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useCallback } from 'react'
import ConfusedFacePng from '../../assets/confused_face.png'
import FaceWithPeekingEyePng from '../../assets/face_with_peeking_eye.png'
import { useNavigate } from 'react-router-dom'

import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers'
import { getStatement, getChallenge, authorize } from '../util'

/**
 * Component that allows the user to connect with their wallet and authorize with the backend
 */
export default function Connection() {
  const [imageSrc, setImageSrc] = useState(ConfusedFacePng)
  const [verificationFailed, setVerificationFailed] = useState(false)
  const navigate = useNavigate()
  const [account, setAccount] = useState()
  const [authToken, setAuthToken] = useState()

  //   const VERIFIER_URL = '/api'

  const handleConnect = useCallback(
    () =>
      detectConcordiumProvider()
        .then((provider) => provider.connect())
        .then(setAccount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const handleAuthorize = useCallback(async () => {
    if (!account) {
      setVerificationFailed(true)
      throw new Error('Unreachable')
    }
    const provider = await detectConcordiumProvider()
    const challenge = await getChallenge(verifier, account)
    const statement = await getStatement(verifier)
    const proof = await provider.requestIdProof(account, statement, challenge)
    const newAuthToken = await authorize(verifier, challenge, proof)
    setAuthToken(newAuthToken)
    navigate('/welcome')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  //   useEffect(() => {
  //     getNames(VERIFIER_URL)
  //       .then((names) =>
  //         setItems(
  //           names.map((name) => ({
  //             name,
  //             location: `${VERIFIER_URL}/image/` + name,
  //           })),
  //         ),
  //       )
  //       .catch(console.error)
  //   }, [])

  useEffect(() => {
    detectConcordiumProvider()
      .then((provider) => {
        // Listen for relevant events from the wallet.
        provider.on('accountChanged', setAccount)
        provider.on(
          'accountDisconnected',
          () => void provider.getMostRecentlySelectedAccount().then(setAccount),
        )
        // Check if you are already connected
        provider
          .getMostRecentlySelectedAccount()
          .then(setAccount)
          .catch(console.error)
      })
      .catch(() => setAccount(undefined))
  }, [])

  //   const handleErrorOnLoad = useCallback(() => {
  //     setAuthToken(undefined)
  //     setTimeout(() => alert('Authorization is no longer valid'), 100)
  //   }, [])

  return (
    <div className="h-screen bg-indigo-400 flex justify-center items-center text-white">
      {/* <ToastContainer /> */}
      <div className="flex flex-col bg-slate-50 md:w-1/2 justify-center px-6 py-12 lg:px-8 box-shadow-top-bottom rounded-2xl">
        {verificationFailed ? (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-red-600">
              Age verification was not completed. You are not allowed to access
              the beer store!
            </h2>

            <button
              type="button"
              className="mt-4 rounded-md bg-red-400 px-3 py-2.5 text-lg font-medium tracking-wide text-white shadow-sm hover:bg-red-600"
              onClick={handleCloseClick}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="image-radius mx-auto">
              <img
                className="sm:mx-auto"
                src={imageSrc}
                alt="Emoji Face"
                width="100"
                height="100"
              />
            </div>
            <h2 className="mt-10 text-center text-xl font-bold text-indigo-600">
              Click to verify your age
            </h2>

            {account && (
              <>
                Connected to{' '}
                <button
                  className="link"
                  type="button"
                  onClick={() => {
                    window.open(
                      `https://testnet.ccdscan.io/?dcount=1&dentity=account&daddress=${account}`,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }}
                >
                  {account}{' '}
                </button>
                <div>
                  {!authToken && (
                    <button
                      className="mt-10 mx-auto md:w-1/2 rounded-md bg-indigo-400 px-3 py-2.5 text-lg text-center font-medium tracking-wide text-white shadow-sm hover:bg-indigo-600"
                      onMouseEnter={() => setImageSrc(FaceWithPeekingEyePng)}
                      onMouseLeave={() => setImageSrc(ConfusedFacePng)}
                      type="button"
                      onClick={() =>
                        handleAuthorize().catch((e) => alert(e.message))
                      }
                    >
                      Verify
                    </button>
                  )}
                  {authToken && <p>Authorized</p>}
                </div>
              </>
            )}
            {!account && (
              <>
                <p>No wallet connection</p>
                <button
                  className="mt-10 mx-auto md:w-1/2 rounded-md bg-indigo-400 px-3 py-2.5 text-lg text-center font-medium tracking-wide text-white shadow-sm hover:bg-indigo-600"
                  onMouseEnter={() => setImageSrc(FaceWithPeekingEyePng)}
                  onMouseLeave={() => setImageSrc(ConfusedFacePng)}
                  type="button"
                  onClick={handleConnect}
                >
                  Connect
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

{
  /* <div className="connection-banner">
      <h3>Status</h3>
      {account && (
        <>
          Connected to{' '}
          <button
            className="link"
            type="button"
            onClick={() => {
              window.open(
                `https://testnet.ccdscan.io/?dcount=1&dentity=account&daddress=${account}`,
                '_blank',
                'noopener,noreferrer',
              )
            }}
          >
            {account}{' '}
          </button>
          <div>
            {!authToken && (
              <button
                className="connect-button"
                type="button"
                onClick={() => handleAuthorize().catch((e) => alert(e.message))}
              >
                Authorize
              </button>
            )}
            {authToken && <p>Authorized</p>}
          </div>
        </>
      )}
      {!account && (
        <>
          <p>No wallet connection</p>
          <button
            className="connect-button"
            type="button"
            onClick={handleConnect}
          >
            Connect
          </button>
        </>
      )}
    </div> */
}
