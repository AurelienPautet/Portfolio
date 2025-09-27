import Navbar from "./components/Navbar";
import HomeTitle from "./components/HomeTitle";
import HomeSkills from "./components/HomeSkills";
import HomeScale from "./components/HomeScale";
import HomeProjects from "./components/HomeProjects";

function App() {
  return (
    <>
      <Navbar />
      <HomeTitle />
      <HomeSkills />
      <HomeScale />
      <HomeProjects />
      <div className="mt-20 w-full flex justify-center bg-base-500"></div>
    </>
  );
}

export default App;
