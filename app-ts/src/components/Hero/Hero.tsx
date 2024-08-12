import { useState } from "react";
import GrinningFace from "../../assets/grinning_face.png";
import FaceWithPeekingEyePng from "../../assets/face_with_peeking_eye.png";


const Hero = () => {
    const [imageSrc, setImageSrc] = useState(GrinningFace);
    const [verificationFailed, setVerificationFailed] = useState(false);

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
                            onMouseLeave={() => setImageSrc(GrinningFace)}
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
