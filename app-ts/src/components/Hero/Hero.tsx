import { useState, useCallback, useEffect } from 'react'
import ConfusedFacePng from '../../assets/confused_face.png'
import FaceWithPeekingEyePng from '../../assets/face_with_peeking_eye.png'
import { useNavigate } from 'react-router-dom'
import {
  detectConcordiumProvider,
  WalletApi,
} from '@concordium/browser-wallet-api-helpers'
import { authorize, getChallenge, getStatement } from '../../utils/verifier'

interface Props {
  user: string | undefined
  setUser: React.Dispatch<React.SetStateAction<string | undefined>>
  setClient: React.Dispatch<React.SetStateAction<WalletApi | undefined>>
}

const Hero: React.FC<Props> = ({ user, setUser, setClient }) => {
  const [imageSrc, setImageSrc] = useState(ConfusedFacePng)
  const [verificationFailed, setVerificationFailed] = useState(false)
  const [authToken, setAuthToken] = useState()
  const navigate = useNavigate()

  const handleConnect = useCallback(
    () =>
      detectConcordiumProvider()
        .then((provider) => {
          setClient(provider)
          provider.requestAccounts()
        })
        .then(() => {
          setUser
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleAuthorize = useCallback(async () => {
    if (!user) {
      setVerificationFailed(true)
      throw new Error('Unreachable')
    }

    const provider = await detectConcordiumProvider()
    // console.log("provider",provider)
    const challenge = await getChallenge(user)
    // console.log('challenge',challenge)
    const statement = await getStatement()
    // console.log("statement",statement)
    const proof = await provider.requestIdProof(user, statement, challenge)
    // console.log("proof",proof)
    const newAuthToken = await authorize(challenge, proof)
    // console.log("token",newAuthToken)

    setAuthToken(newAuthToken)
    navigate('/dashboard')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    detectConcordiumProvider()
      .then((provider) => {
        // Listen for relevant events from the wallet.
        provider.on('accountChanged', setUser)
        provider.on(
          'accountDisconnected',
          () => void provider.getMostRecentlySelectedAccount().then(setUser)
        )
        // Check if you are already connected
        provider
          .getMostRecentlySelectedAccount()
          .then(setUser)
          .catch(console.error)
        setClient(provider)
      })
      .catch(() => setUser(undefined))
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

            {user && (
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
            )}
            {!user && (
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
