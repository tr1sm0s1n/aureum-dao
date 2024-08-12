import Navbar from "../Navbar/Navbar";
import FormPage from "../FormPage/FormPage";
import Proposals from "../Proposals/Proposals";
import Home from "../Home/Home";
import AllProposals from "../AllProposals/AllProposals";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Home />
      <FormPage />
      <Proposals />
      <AllProposals />
    </>
  );
};

export default LandingPage;
