import Navbar from "./components/Navbar";
import HomeTitle from "./components/HomeTitle";
import HomeSkills from "./components/HomeSkills";
import HomeScale from "./components/HomeScale";
import HomeStudies from "./components/HomeStudies";

function App() {
  return (
    <>
      <Navbar />
      <HomeTitle />
      <HomeSkills />
      <HomeScale />
      <HomeStudies />
      <div className="mt-20 w-full flex justify-center bg-base-500"></div>
    </>
  );
}

export default App;
