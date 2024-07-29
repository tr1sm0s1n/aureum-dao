import React from "react";

import Navbar from "../Navbar/Navbar";
import Home from "../Home/Home";
import FormPage from "../FormPage/FormPage";
import Proposals from "../Proposals/Proposals";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Home />
      <FormPage />
      <Proposals />
    </>
  );
};

export default LandingPage;
