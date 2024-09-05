import { useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Modal from './Modal'
import { ProposalArray, ProposalData } from '../../types'

interface Props {
  proposals: ProposalArray
  power: bigint | undefined
}

const Proposals: React.FC<Props> = ({ proposals, power }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedData, setSelectedData] = useState<[bigint, ProposalData]>()

  console.log('ppp', proposals)
  console.log('pow', power)

  const handleCardClick = (data: [bigint, ProposalData]) => {
    setSelectedData(data)
    setShowModal(true)
  }

  const settings = {
    dots: true,
    arrows: false,
    infinite: proposals.length > 3, // Disable infinite scrolling if there are fewer than 3 proposals
    speed: 500,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: 'linear',
    pauseOnHover: true,
    pauseOnFocus: true,
    responsive: [
      {
        breakpoint: 10000,
        settings: {
          slidesToShow: Math.min(3, proposals.length), // Show only the number of proposals available
          slidesToScroll: 1,
          infinite: proposals.length > 3, // Match infinite to proposal length
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, proposals.length), // For medium screens
          slidesToScroll: 1,
          initialSlide: 2,
          infinite: proposals.length > 2, // Adjust infinite accordingly
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  return (
    <>
      <span id="proposals"></span>
      <div className="py-10 mb-10">
        <div className="container">
          <div className="mb-10">
            <h1
              data-aos="fade-up"
              className="text-center text-4xl font-bold font-cursive"
            >
              Proposals
            </h1>
          </div>

          <div data-aos="zoom-in">
            <Slider {...settings}>
              {proposals.map((data) => (
                <div className="my-6" key={data[0]}>
                  <div
                    onClick={() => handleCardClick(data)}
                    className="flex flex-col gap-4 shadow-lg py-8 px-6 mx-4 rounded-xl bg-primary/10 relative cursor-pointer transition duration-300 hover:bg-primary/30"
                  >
                    <div className="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
                      <div className="pr-3 text-lg font-bold text-indigo-400">
                        <span className="text-indigo-600">
                          {data[0].toString()}
                        </span>
                      </div>
                      <div className="pl-3 text-lg font-bold ">
                        <h1 className="text-xl font-bold">
                          {data[1].proposer.slice(0, 6)}
                        </h1>
                      </div>
                    </div>
                    {/* content section */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">
                          {data[1].description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
                      <div
                        className={`pr-3 text-lg font-bold ${
                          Object.keys(data[1].status)[0] === 'Active'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {Object.keys(data[1].status)[0]}
                      </div>
                      <div className="pl-3 text-lg font-bold text-indigo-400">
                        Amount:{' '}
                        <span className="text-indigo-600">
                          {data[1].amount}
                        </span>
                      </div>
                    </div>
                    <p className="text-black/20 text-9xl font-serif absolute top-0 right-0">
                      ,,
                    </p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
        {selectedData && (
          <Modal
            showModal={showModal}
            setShowModal={setShowModal}
            data={selectedData}
            power={power}
          />
        )}
      </div>
    </>
  )
}

export default Proposals
