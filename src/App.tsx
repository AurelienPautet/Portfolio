import Navbar from "./components/Navbar";
import HomeTitle from "./components/HomeTitle";
import HomeSkills from "./components/HomeSkills";
import HomeScale from "./components/HomeScale";

function App() {
  return (
    <>
      <Navbar />
      <HomeTitle />
      <HomeSkills />
      <HomeScale />
      <div className=" w-full flex justify-center bg-base-500"></div>
    </>
  );
}

export default App;
