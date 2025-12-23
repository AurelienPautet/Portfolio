import Navbar from "./components/Navbar";
import HomeTitle from "./components/HomeTitle";
import HomeSkills from "./components/HomeSkills";
import HomeProjects from "./components/HomeProjects";
import HomeSocial from "./components/HomeSocial";
import { MoreBelow } from "./components/MoreBelow";
import MagneticEffect from "./components/MagneticEffect";

import HomeHireMe from "./components/HomeHireMe";
import HomeGameChamboule from "./components/HomeGameChamboule";

import { useEffect } from "react";

function App() {
  useEffect(() => {
    const scrollPosition = sessionStorage.getItem("scrollPosition");
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition));
      sessionStorage.removeItem("scrollPosition");
    }
  }, []);

  return (
    <>
      <MagneticEffect />
      <Navbar />
      <div className="flex items-center flex-col min-h-screen md:min-h-fit">
        <HomeTitle />
        <HomeSocial />
      </div>

      <HomeSkills />
      <HomeProjects />
      <div className="mt-20 w-full flex justify-center bg-base-500"></div>
      <HomeHireMe />
      <HomeGameChamboule />
      <MoreBelow />
    </>
  );
}

export default App;
