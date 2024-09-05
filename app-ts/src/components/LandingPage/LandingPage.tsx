import Navbar from '../Navbar/Navbar'
import Home from '../Home/Home'
import FormPage from '../FormPage/FormPage'
import Proposals from '../Proposals/Proposals'
import AllProposals from '../AllProposals/AllProposals'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../App'
import { ProposalArray } from '../../types'
import { getAllMembers, getAllProposals } from '../../utils/wallet'

const LandingPage = () => {
  const ctx = useContext(UserContext)
  const [proposals, setProposals] = useState<ProposalArray>([])
  const [power, setPower] = useState<bigint>()

  useEffect(() => {
    getAllProposals(ctx.client!).then(setProposals).catch(console.error)
    getAllMembers(ctx.client!)
      .then((members: [string, bigint][]) => {
        let memberMap = new Map(members)
        setPower(memberMap.get(ctx.user))
      })
      .catch(console.error)
  }, [proposals, power])

  return (
    <>
      <Navbar />
      <Home />
      <FormPage />
      <Proposals proposals={proposals} power={power} />
      <AllProposals proposals={proposals} />
    </>
  )
}

export default LandingPage
