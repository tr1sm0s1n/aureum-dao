import React from "react";
import Hero from "./components/Hero/Hero";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage/LandingPage";


const App = () => {
  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 700,
      easing: "ease-in",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 overflow-x-hidden">
      <Router>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/welcome" element={<LandingPage />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
