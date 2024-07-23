import React, { useState } from "react";
import ConfusedFacePng from "../../assets/confused_face.png";
import FaceWithPeekingEyePng from "../../assets/face_with_peeking_eye.png";
import { useNavigate } from "react-router-dom";
import {
  getPastDate,
  MIN_DATE,
  Web3StatementBuilder,
} from "@concordium/web-sdk";
import { detectConcordiumProvider } from "@concordium/browser-wallet-api-helpers";
import { toast, ToastContainer } from "react-toastify";

const Hero = () => {
  const [imageSrc, setImageSrc] = useState(ConfusedFacePng);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const navigate = useNavigate();

  const ageCheck = async () => {
    const provider = await detectConcordiumProvider();
    try {
      await provider.requestAccounts();

      const statementBuilder =
        new Web3StatementBuilder().addForIdentityCredentials(
          [0, 1, 2, 3, 4, 5],
          (b) => b.addRange("dob", MIN_DATE, getPastDate(18, 1)),
        );
      const statement = statementBuilder.getStatements();
      const challenge =
        "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

      const verified = await provider.requestVerifiablePresentation(
        challenge,
        statement,
      );
      console.log("verified", verified);

      if (verified) {
        // TODO: Verify the proof here if necessary
        navigate("/welcome");
      } else {
        setVerificationFailed(true);
      }
    } catch (error) {
      console.error(error);
      // toast.error("Please Connect", {
      //   position: "top-right",
      //   autoClose: 3000,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      // });
      alert("please connect");
    }
  };

  const handleVerifyClick = () => {
    ageCheck();
  };

  const handleCloseClick = () => {
    setVerificationFailed(false);
  };

  return (
    <div className="h-screen bg-indigo-400 flex justify-center items-center text-white">
      {/* <ToastContainer /> */}
      <div className="flex flex-col bg-slate-50 md:w-1/2 justify-center px-6 py-12 lg:px-8 box-shadow-top-bottom rounded-2xl">
        {verificationFailed ? (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-red-600">
              Age verification was not completed. You are not allowed to access
              the beer store!
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
            <h2 className="mt-10 text-center text-xl font-bold text-indigo-600">
              Click to verify your age
            </h2>
            <button
              type="button"
              className="mt-10 mx-auto md:w-1/2 rounded-md bg-indigo-400 px-3 py-2.5 text-lg text-center font-medium tracking-wide text-white shadow-sm hover:bg-indigo-600"
              onMouseEnter={() => setImageSrc(FaceWithPeekingEyePng)}
              onMouseLeave={() => setImageSrc(ConfusedFacePng)}
              onClick={handleVerifyClick}
            >
              Verify
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Hero;
