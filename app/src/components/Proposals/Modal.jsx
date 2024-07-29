import React from "react";
import { motion } from "framer-motion";
import { MdClose } from "react-icons/md";

const Modal = ({ showModal, setShowModal, data }) => {
  const modalVariants = {
    hidden: {
      opacity: 0,
      y: "-100%",
      scale: 1.5,
    },
    visible: {
      opacity: 1,
      y: "0",
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: "-100%",
      scale: 1.5,
      transition: {
        duration: 0.3,
      },
    },
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

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
            className="bg-white rounded-lg shadow-lg p-6 w-lg mx-auto h-auto"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-2xl w-10 h-10 rounded-full focus:outline-none text-white"
            >
              <MdClose className="m-auto" />
            </button>

            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-2xl font-semibold font-cursive">
                {data.name}
              </h2>
            </div>
            <div className="w-full p-3">{data.text}</div>
            <div className="w-full p-3">{data.status}</div>
            <div className="w-full p-3">{data.amount}</div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </motion.div>
        </div>
      ) : null}
    </>
  );
};

export default Modal;
