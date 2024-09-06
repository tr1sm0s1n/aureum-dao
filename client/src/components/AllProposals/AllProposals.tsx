import React, { useState } from 'react'
import BgImg from '../../assets/website/white-bg.jpg'
import { ProposalArray, ProposalData } from '../../types'
import Modal from '../Modal/Modal'

// Background image style
const bgImage: React.CSSProperties = {
  backgroundImage: `url(${BgImg})`,
  backgroundColor: '#6366FF',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  height: '100%',
  width: '100%',
}

interface Props {
  proposals: ProposalArray
  power: bigint | undefined
  setTxHash: React.Dispatch<React.SetStateAction<string | undefined>>
}

const AllProposals: React.FC<Props> = ({ proposals, power, setTxHash }) => {
  const [selectedStatus, setSelectedStatus] = useState<
    'Active' | 'Approved' | 'Collected' | 'All'
  >('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [showModal, setShowModal] = useState(false)
  const [selectedData, setSelectedData] = useState<[bigint, ProposalData]>()

  const proposalsPerPage = 5
  const indexOfLastTestimonial = currentPage * proposalsPerPage
  const indexOfFirstTestimonial = indexOfLastTestimonial - proposalsPerPage

  // Filter proposals based on selected status and search query
  const filteredProposals = proposals.filter((item) => {
    const matchesStatus =
      selectedStatus === 'All' ||
      Object.keys(item[1].status)[0] === selectedStatus
    const matchesSearch = item[1].description
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const currentProposals = filteredProposals.slice(
    indexOfFirstTestimonial,
    indexOfLastTestimonial
  )
  const totalPages = Math.ceil(
    filteredProposals.length / proposalsPerPage
  )

  const handleCardClick = (data: [bigint, ProposalData]) => {
    setSelectedData(data)
    setShowModal(true)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  return (
    <>
      <span id="allproposals"></span>
      <div style={bgImage}>
        <div className="py-10">
          <div className="container">
            {/* Heading section */}
            <div className="text-center mb-20">
              <h1 className="text-4xl font-bold font-cursive text-gray-800">
                All Proposals
              </h1>
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900 p-4">
                <div>
                  {/* Dropdown for selecting status */}
                  <select
                    id="dropdownActionButton"
                    className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(
                        e.target.value as
                          | 'Active'
                          | 'Approved'
                          | 'Collected'
                          | 'All'
                      )
                    }
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Approved">Approved</option>
                    <option value="Collected">Collected</option>
                  </select>
                </div>
                <label className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="table-search-users"
                    className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Id
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Proposer
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentProposals.map((item, index) => (
                    <tr
                      key={index}
                      onClick={() => handleCardClick(item)}
                      className="bg-white border-b cursor-pointer dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {item[0].toString()}
                      </th>
                      <td className="px-6 py-4">{item[1].proposer}</td>
                      <td className="px-6 py-4">{item[1].description}</td>
                      <td
                        className={`${
                          Object.keys(item[1].status)[0] === 'Active'
                            ? 'text-green-500'
                            : Object.keys(item[1].status)[0] === 'Approved'
                              ? 'text-blue-500'
                              : 'text-orange-500'
                        } px-6 py-4`}
                      >
                        {Object.keys(item[1].status)[0]}
                      </td>
                      <td className="px-6 py-4">{item[1].amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination controls */}
              <div className="flex justify-between p-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-primary hover:bg-brandDark text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-primary hover:bg-brandDark text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        {selectedData && (
          <Modal
            showModal={showModal}
            setShowModal={setShowModal}
            data={selectedData}
            power={power}
            setTxHash={setTxHash}
          />
        )}
      </div>
    </>
  )
}

export default AllProposals
