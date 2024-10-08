import Navbar from '../Navbar/Navbar'
import Home from '../Home/Home'
import FormPage from '../FormPage/FormPage'
import Proposals from '../Proposals/Proposals'
import AllProposals from '../AllProposals/AllProposals'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../App'
import { MemberArray, ProposalArray } from '../../types'
import { getAllMembers, getAllProposals } from '../../utils/wallet'

const LandingPage = () => {
  const ctx = useContext(UserContext)
  const [proposals, setProposals] = useState<ProposalArray>([])
  const [power, setPower] = useState<bigint>()
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  useEffect(() => {
    getAllProposals(ctx.client!).then(setProposals).catch(console.error)
    getAllMembers(ctx.client!)
      .then((members: MemberArray) => {
        let memberMap = new Map(members)
        setPower(memberMap.get(ctx.user!))
      })
      .catch(console.error)
  }, [txHash])

  return (
    <>
      <Navbar />
      <Home />
      <FormPage setTxHash={setTxHash} />
      <Proposals
        proposals={proposals.filter((p) => {
          return 'Active' in p[1].status && p[1].status.Active.length === 0
        })}
        power={power}
        setTxHash={setTxHash}
      />
      <AllProposals proposals={proposals} power={power} setTxHash={setTxHash} />
    </>
  )
}

export default LandingPage
