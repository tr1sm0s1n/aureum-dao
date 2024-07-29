import React, { useState } from "react";
import BannerImg from "../../assets/form.png";
import { MdAttachMoney } from "react-icons/md";
import { ImParagraphCenter } from "react-icons/im";
import BgImg from "../../assets/website/bg.jpg";

const bgImage = {
  backgroundImage: `url(${BgImg})`,
  backgroundColor: "#6366FF",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  height: "100%",
  width: "100%",
};

const FormPage = () => {
  const [activeTab, setActiveTab] = useState("form1");
  const [form1Values, setForm1Values] = useState({
    amount: "",
    description: "",
  });
  const [form2Values, setForm2Values] = useState({ amount: "" });
  const [form1Errors, setForm1Errors] = useState({
    amount: "",
    description: "",
  });
  const [form2Errors, setForm2Errors] = useState({ amount: "" });

  const handleForm1Change = (e) => {
    const { name, value } = e.target;
    setForm1Values({ ...form1Values, [name]: value });
  };

  const handleForm2Change = (e) => {
    const { name, value } = e.target;
    setForm2Values({ ...form2Values, [name]: value });
  };

  const validateForm1 = () => {
    const errors = { amount: "", description: "" };
    if (!form1Values.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(form1Values.amount)) {
      errors.amount = "Amount must be a number";
    }
    if (!form1Values.description) {
      errors.description = "Description is required";
    }
    setForm1Errors(errors);
    return Object.values(errors).every((error) => !error);
  };

  const validateForm2 = () => {
    const errors = { amount: "" };
    if (!form2Values.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(form2Values.amount)) {
      errors.amount = "Amount must be a number";
    }
    setForm2Errors(errors);
    return Object.values(errors).every((error) => !error);
  };

  const handleForm1Submit = (e) => {
    e.preventDefault();
    if (validateForm1()) {
      // Handle form submission (e.g., send data to server)
      console.log("Form 1 submitted", form1Values);
    }
  };

  const handleForm2Submit = (e) => {
    e.preventDefault();
    if (validateForm2()) {
      // Handle form submission (e.g., send data to server)
      console.log("Form 2 submitted", form2Values);
    }
  };

  return (
    <>
      <span id="about"></span>
      <div style={bgImage}>
        <div className="min-h-[600px] flex justify-center items-center py-12 sm:py-0">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Image section */}
              <div data-aos="zoom-in">
                <img
                  src={BannerImg}
                  alt="biryani img"
                  className="max-w-[580px] w-full mx-auto drop-shadow-[10px_-10px_12px_#bdbcbc] spin"
                />
              </div>
              {/* Text content section */}
              <div className="flex flex-col justify-center gap-6 sm:pt-0">
                <h1
                  data-aos="fade-up"
                  className="text-3xl sm:text-4xl font-bold font-cursive"
                >
                  Fill the Form
                </h1>
                <div
                  data-aos="fade-up"
                  data-aos-delay="500"
                  className="border-b border-gray-200 dark:border-gray-700 mb-2"
                >
                  <ul
                    className="flex flex-wrap -mb-px"
                    id="myTab"
                    role="tablist"
                  >
                    <li className="mr-2" role="presentation">
                      <button
                        className={`inline-block py-4 px-4 text-md font-medium text-center border-b-2 ${activeTab === "form1" ? "text-gray-600 border-gray-300" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"}`}
                        onClick={() => setActiveTab("form1")}
                        role="tab"
                      >
                        Form 1
                      </button>
                    </li>
                    <li className="mr-2" role="presentation">
                      <button
                        className={`inline-block py-4 px-4 text-md font-medium text-center border-b-2 ${activeTab === "form2" ? "text-gray-600 border-gray-300" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"}`}
                        onClick={() => setActiveTab("form2")}
                        role="tab"
                      >
                        Form 2
                      </button>
                    </li>
                  </ul>
                </div>
                {activeTab === "form1" && (
                  <>
                    <p
                      data-aos="fade-up"
                      className="text-sm text-gray-500 tracking-wide leading-5"
                    >
                      Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                      Eaque reiciendis inventore iste ratione ex alias quis
                      magni at optio
                    </p>
                    <form onSubmit={handleForm1Submit}>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-5">
                          <div
                            data-aos="fade-up"
                            data-aos-delay="500"
                            className="flex items-center gap-3"
                          >
                            <MdAttachMoney className="text-4xl h-10 w-10 shadow-sm p-3 rounded-full bg-red-100" />
                            <div className="relative z-0 w-full mb-5 group">
                              <input
                                type="text"
                                name="amount"
                                value={form1Values.amount}
                                onChange={handleForm1Change}
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                              />
                              <label
                                htmlFor="amount"
                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                              >
                                Amount
                              </label>
                              {form1Errors.amount && (
                                <p className="text-red-500 text-xs mt-1">
                                  {form1Errors.amount}
                                </p>
                              )}
                            </div>
                          </div>
                          <div
                            data-aos="fade-up"
                            data-aos-delay="500"
                            className="flex items-center gap-3"
                          >
                            <ImParagraphCenter className="text-4xl h-10 w-10 shadow-sm p-3 rounded-full bg-yellow-100" />
                            <div className="relative z-0 w-full mb-5 group">
                              <textarea
                                id="description"
                                rows="3"
                                name="description"
                                value={form1Values.description}
                                onChange={handleForm1Change}
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                              />
                              <label
                                htmlFor="description"
                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                              >
                                Description
                              </label>
                              {form1Errors.description && (
                                <p className="text-red-500 text-xs mt-1">
                                  {form1Errors.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div
                            data-aos="fade-up"
                            data-aos-delay="500"
                            className="flex items-center gap-3"
                          >
                            <div className="relative z-0 w-full mb-5 group">
                              <button
                                type="submit"
                                className="bg-brandDark border-2 border-primary hover:scale-105 duration-200 text-white py-2 px-4 rounded-full"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </>
                )}
                {activeTab === "form2" && (
                  <>
                    <p
                      data-aos="fade-up"
                      className="text-sm text-gray-500 tracking-wide leading-5"
                    >
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                    <form onSubmit={handleForm2Submit}>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-5">
                          <div
                            data-aos="fade-up"
                            data-aos-delay="500"
                            className="flex items-center gap-3"
                          >
                            <MdAttachMoney className="text-4xl h-10 w-10 shadow-sm p-3 rounded-full bg-orange-100" />
                            <div className="relative z-0 w-full mb-5 group">
                              <input
                                type="text"
                                name="amount"
                                value={form2Values.amount}
                                onChange={handleForm2Change}
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                              />
                              <label
                                htmlFor="amount"
                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                              >
                                Amount
                              </label>
                              {form2Errors.amount && (
                                <p className="text-red-500 text-xs mt-1">
                                  {form2Errors.amount}
                                </p>
                              )}
                            </div>
                          </div>
                          <div
                            data-aos="fade-up"
                            data-aos-delay="500"
                            className="flex items-center gap-3"
                          >
                            <div className="relative z-0 w-full mb-5 group">
                              <button
                                type="submit"
                                className="bg-brandDark border-2 border-primary hover:scale-105 duration-200 text-white py-2 px-4 rounded-full"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormPage;
