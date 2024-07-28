import React, { useState } from 'react'
import CharityPng from '../../assets/charity.png'
import Modal from '../Modal/Modal'

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="min-h-[550px] sm:min-h-[600px] bg-brandDark flex justify-center items-center text-white">
        <div className="container pb-8 sm:pb-0">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* text content section */}
            <div className="flex flex-col justify-center gap-6 pt-12 sm:pt-0 text-center sm:text-left order-2 sm:order-1">
              <h1
                data-aos="fade-up"
                data-aos-once="true"
                className="text-5xl sm:text-4xl lg:text-5xl font-bold"
              >
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.{' '}
              </h1>
              <div data-aos="fade-up" data-aos-delay="400">
                <button
                  onClick={handleOpenModal}
                  data-modal-target="default-modal"
                  data-modal-toggle="default-modal"
                  className="bg-gradient-to-r from-primary to-secondary border-2 border-primary hover:scale-105 duration-200 text-white py-2 px-4 rounded-full"
                >
                  Fill the Form
                </button>
              </div>
            </div>
            {/* Image section */}
            <div
              data-aos="zoom-in"
              data-aos-duration="300"
              className="min-h-[450px] flex justify-center items-center relative order-1 sm:order-2 "
            >
              <img
                data-aos-once="true"
                src={CharityPng}
                alt="charity img"
                className="w-[300px] sm:w-[450px] sm:scale-125 mx-auto spin "
              />
              <div
                data-aos="fade-left"
                className="bg-gradient-to-r from-primary to-secondary p-3 rounded-xl absolute top-10 left-10"
              >
                <h1 className="text-white">Charity</h1>
              </div>
              <div
                data-aos="fade-right"
                data-aos-offset="0"
                className="bg-gradient-to-r from-primary to-secondary p-3 rounded-xl absolute bottom-10 right-10"
              >
                <h1 className="text-white">Donate</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <Modal handleCloseModal={handleCloseModal} />}
    </>
  )
}

export default Home
