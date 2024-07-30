import React, { useState, useCallback, useEffect } from 'react'
import ConfusedFacePng from '../../assets/confused_face.png'
import FaceWithPeekingEyePng from '../../assets/face_with_peeking_eye.png'
import { useNavigate } from 'react-router-dom'

import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers'
import { getStatement, getChallenge, authorize } from '../util'

const Hero = () => {
  const [imageSrc, setImageSrc] = useState(ConfusedFacePng)
  const [verificationFailed, setVerificationFailed] = useState(false)
  const [account, setAccount] = useState()
  const [authToken, setAuthToken] = useState()
  const navigate = useNavigate()

  const VERIFIER_URL = 'http://127.0.0.1:4800'

  const handleConnect = useCallback(
    () =>
      detectConcordiumProvider()
        .then((provider) => provider.requestAccounts())
        .then(setAccount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const handleAuthorize = useCallback(async () => {
    if (!account) {
      setVerificationFailed(true)
      throw new Error('Unreachable')
    }
    // defined bu vtk
    const verifier = VERIFIER_URL
    const provider = await detectConcordiumProvider()
    // console.log("provider",provider)
    const challenge = await getChallenge(verifier, account)
    // console.log('challenge',challenge)
    const statement = await getStatement(verifier)
    // console.log("statement",statement)
    const proof = await provider.requestIdProof(account, statement, challenge)
    // console.log("proof",proof)
    const newAuthToken = await authorize(verifier, challenge, proof)
    // console.log("token",newAuthToken)

    setAuthToken(newAuthToken)
    navigate('/dashboard')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

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

  const handleErrorOnLoad = useCallback(() => {
    setAuthToken(undefined)
    setTimeout(() => alert('Authorization is no longer valid'), 100)
  }, [])

  return (
    <div className="h-screen bg-indigo-400 flex justify-center items-center text-white">
      {/* <ToastContainer /> */}
      <div className="flex flex-col bg-slate-50 md:w-1/2 justify-center px-6 py-12 lg:px-8 box-shadow-top-bottom rounded-2xl">
        {verificationFailed ? (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-red-600">
              Verification was not completed. You are not allowed to access the
              DAO DApp!
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

            {account && (
              <>
                {/* <p className="link text-black">Connected to{' '}</p>

                <button
                  className="link text-black"
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
                </button> */}
                <div>
                  {!authToken && (
                    <>
                      <h2 className="mt-10 text-center text-xl font-bold text-indigo-600">
                        Click to verify your age & nationality
                      </h2>
                      <button
                        className="flex flex-col items-center mt-10 mx-auto md:w-1/2 rounded-md bg-indigo-400 px-3 py-2.5 text-lg text-center font-medium tracking-wide text-white shadow-sm hover:bg-indigo-600"
                        onMouseEnter={() => setImageSrc(FaceWithPeekingEyePng)}
                        onMouseLeave={() => setImageSrc(ConfusedFacePng)}
                        type="button"
                        onClick={() =>
                          handleAuthorize().catch((e) => alert(e.message))
                        }
                      >
                        Verify
                      </button>
                    </>
                  )}
                  {authToken && <p>Authorized</p>}
                </div>
              </>
            )}
            {!account && (
              <>
                <h2 className="mt-10 text-center text-xl font-bold text-indigo-600">
                  Click connect your wallet
                </h2>
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

export default Hero
