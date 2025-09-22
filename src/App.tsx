import { useState } from "react";
import Navbar from "./components/Navbar";
import HomeTitle from "./components/HomeTitle";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Navbar />
      <HomeTitle />
      <div className="flex justify-center items-center w-full">
        <div className="physical h-96  w-fit p-20 bg-base-100 border-2 border-primary">
          <div className="grid grid-cols-3 gap-1">
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical  nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical  nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical  nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical  nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical  nonconstrained w-10 h-10 bg-accent"></div>
            <div className="physical  nonconstrained w-10 h-10 bg-accent"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
