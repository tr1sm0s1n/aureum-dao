import { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { MdClose } from 'react-icons/md'
import { UserContext } from '../../App'
import { renounceVotes, voteForProposal, withdrawFunds } from '../../utils/wallet'
import TransactionAlert from '../popup/popup'


const Modal = ({ showModal, setShowModal, data, power }) => {
  const { user, client } = useContext(UserContext)
  const [voteNumber, setVoteNumber] = useState(0)
  const [voteError, setVoteError] = useState('')
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: '-100%',
      scale: 1.5,
    },
    visible: {
      opacity: 1,
      y: '0',
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: '-100%',
      scale: 1.5,
      transition: {
        duration: 0.3,
      },
    },
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false)
    }
  }

  

  const handleVote = async () => {
    if (voteNumber > parseInt(power)) {
      setVoteError('Please enter a valid number.')
    } else {
      setVoteError('')
      console.log(voteNumber)
      let res = await voteForProposal(client!, data[0], voteNumber, user)
      setTxHash(res)
      console.log(res)
      alert('Vote submitted successfully!')
      // Handle vote submission logic here
    }
  }

  const handleRenounce = async (renounce) => {
    console.log(renounce)
    let res = await renounceVotes(client!, data[0], renounce, user)
    setTxHash(res);  // Set the transaction hash state here
    console.log(res);
  }

  const handleInputChange = (e) => {
    setVoteNumber(e.target.value)
    if (e.target.value) {
      setVoteError('')
    }
  }

  const withdraw = async () => {
    let res = await withdrawFunds(client!, data[0], user)
    setTxHash(res);  // Set the transaction hash state here
    console.log(res);
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const totalPages = Math.ceil(data[1].contributers.length / itemsPerPage)
  const paginatedData = data[1].contributers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return // Prevent going out of bounds
    setCurrentPage(page)
  }

  return (
    <>
      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="bg-white rounded-lg shadow-lg p-6 mx-4 md:mx-8 lg:mx-12 max-w-full sm:max-w-xl md:max-w-lg lg:max-w-4xl"
          >
            
            {/* <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center pr-3 text-lg font-bold">
                <span
                  className={`${Object.keys(data[1].status)[0] === 'Active' ? 'text-green-500' : 'text-red-500'}`}
                >
                  {data[1].proposer.substring(0, 6)}
                </span>
              </div>
              <div className="flex items-center pl-3 text-lg font-bold text-indigo-400">
                <h2 className="text-2xl font-semibold font-cursive">
                  {data.id}
                </h2>
              </div>
            </div> */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center pr-3 text-lg font-bold">
                <span className="text-2xl font-bold"> {data[1].proposer.substring(0, 6)}</span>
              </div>
              <div className="flex items-center pl-3 text-lg font-bold text-indigo-400">
                <h2 className="text-2xl font-semibold font-cursive">
                {data[0].toString()}
                </h2>
              </div>
            </div>
            <div className="w-full p-3">{data[1].description}</div>
            <div className="px-4 py-3 border-b flex items-center justify-between divide-x-2 divide-gray-400">
              <div className="flex items-center pr-3 text-lg font-bold">
                <span
                  className={`${Object.keys(data[1].status)[0] === 'Active' ? 'text-green-500' : 'text-red-500'}`}
                >
                  {Object.keys(data[1].status)[0]}
                </span>
              </div>
              <div className="flex items-center pl-3 text-lg font-bold text-indigo-400">
                Amount:{' '}
                <span className="text-indigo-600">{data[1].amount}</span>
              </div>

              {user == data[1].proposer &&
                Object.keys(data[1].status)[0] === 'Approved' && (
                  <button
                    onClick={withdraw}
                    className="ml-auto bg-primary border-primary hover:scale-105 duration-200 text-white px-4 py-2 rounded-full"
                  >
                    Withdraw
                    <TransactionAlert txHash={txHash} client={client} />
                  </button>
                )}
            </div>
            {Object.keys(data[1].status)[0] === 'Active' && (
              <div className="w-full p-3 px-4 py-3 border-b border-gray-200 text-center">
                <span className="text-orange-400 font-semibold text-xl">
                  You can Vote Here
                </span>
                <div className="mt-4 flex items-center justify-center space-x-4">
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Votes to give:
                    </label>
                    <input
                      type="number"
                      value={voteNumber}
                      max={parseInt(power)}
                      onChange={handleInputChange}
                      className="mt-1 block w-48 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {voteError && (
                      <p className="text-red-500 text-sm mt-1">{voteError}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Votes to spare:
                    </label>
                    <input
                      type="number"
                      value={parseInt(power)}
                      disabled
                      className="mt-1 block w-48 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleVote}
                      className="mt-6 bg-primary border-2 border-primary hover:scale-105 duration-200 text-white px-4 py-2 rounded-full "
                    >
                      Vote
                    </button>
                    <TransactionAlert txHash={txHash} client={client} />
                  </div>
                </div>
              </div>
            )}

            <div className="relative overflow-x-auto pt-3 shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Address
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {item[0]}
                      </th>
                      <td className="px-6 py-4">{item[1].toString()}</td>
                      {user == item[0] &&
                        Object.keys(data[1].status)[0] === 'Active' && (
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleRenounce(item[1])}
                              className="bg-primary border-2 border-primary hover:scale-105 duration-200 text-white py-2 px-4 rounded-full"
                            >
                              Renounce
                            </button>
                            <TransactionAlert txHash={txHash} client={client} />
                          </td>
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center py-3 px-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="w-full pt-3">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  )
}

export default Modal
