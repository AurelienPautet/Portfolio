import Navbar from "./components/Navbar";
import HomeTitle from "./components/HomeTitle";
import HomeSkills from "./components/HomeSkills";
import HomeProjects from "./components/HomeProjects";
import HomeSocial from "./components/HomeSocial";
import { MoreBelow } from "./components/MoreBelow";
import MagneticEffect from "./components/MagneticEffect";
import PhysicsControlButton from "./components/PhysicsControlButton";

function App() {
  return (
    <>
      <MagneticEffect />
      <Navbar />
      <div className="flex items-center flex-col h-screen">
        <HomeTitle />
        <HomeSocial />
      </div>
      <HomeSkills />
      <HomeProjects />
      <div className="mt-20 w-full flex justify-center bg-base-500"></div>
      <MoreBelow />
    </>
  );
}

export default App;
