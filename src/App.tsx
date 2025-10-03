import Navbar from "./components/Navbar";
import HomeTitle from "./components/HomeTitle";
import HomeSkills from "./components/HomeSkills";
import HomeProjects from "./components/HomeProjects";
import HomeSocial from "./components/HomeSocial";

function App() {
  return (
    <>
      <Navbar />
      <HomeTitle />
      <HomeSocial />
      <HomeSkills />
      {/* <HomeScale /> */}
      <HomeProjects />
      <div className="mt-20 w-full flex justify-center bg-base-500"></div>
    </>
  );
}

export default App;
