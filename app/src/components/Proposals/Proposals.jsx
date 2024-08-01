import React, { useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Modal from './Modal'

const TestimonialData = [
  {
    id: 1,
    name: 'Dilshad',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio',
    status: 'Inactive',
    amount: 2345,
  },
  {
    id: 2,
    name: 'Sabir ali',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio',
    status: 'Active',
    amount: 34567,
  },
  {
    id: 3,
    name: 'Dipankar kumar',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio',
    status: 'Inactive',
    amount: 8765,
  },
  {
    id: 5,
    name: 'Satya Narayan',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio',
    status: 'Active',
    amount: 0,
  },
]

const Proposals = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedData, setSelectedData] = useState(null)

  const handleCardClick = (data) => {
    setSelectedData(data)
    setShowModal(true)
  }

  var settings = {
    dots: true,
    arrows: false,
    infinite: true,
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
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
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
      <span id='proposals'></span>
      <div className="py-10 mb-10">
        <div className="container">
          {/* header section */}
          <div className="mb-10">
            <h1
              data-aos="fade-up"
              className="text-center text-4xl font-bold font-cursive"
            >
              Proposals
            </h1>
          </div>

          {/* Testimonial cards */}
          <div data-aos="zoom-in">
            <Slider {...settings}>
              {TestimonialData.map((data) => (
                <div className="my-6" key={data.id}>
                  <div
                    onClick={() => handleCardClick(data)}
                    className="flex flex-col gap-4 shadow-lg py-8 px-6 mx-4 rounded-xl bg-primary/10 relative cursor-pointer transition duration-300 hover:bg-primary/30"
                  >

                    <div className="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
                      <div className="pr-3 text-lg font-bold text-indigo-400">
                        <span className="text-indigo-600">{data.id}</span>
                      </div>
                      <div
                        className="pl-3 text-lg font-bold ">
                        <h1 className="text-xl font-bold">{data.name}</h1>
                      </div>
                    </div>
                    {/* content section */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">{data.text}</p>
                      </div>
                    </div>
                    <div className="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
                      <div
                        className={`pr-3 text-lg font-bold ${data.status === 'Active'
                          ? 'text-green-500'
                          : 'text-red-500'
                          }`}
                      >
                        {data.status}
                      </div>
                      <div className="pl-3 text-lg font-bold text-indigo-400">
                        Amount: <span className="text-indigo-600">{data.amount}</span>
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
          />
        )}
      </div>
    </>
  )
}

export default Proposals
