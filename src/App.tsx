import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Waow from "./components/waow";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div
        id="test"
        className="m-10 p-6 max-w-sm mx-auto bg-red-500 rounded-xl shadow-md flex items-center space-x-4"
      >
        CACA
        <button
          id="test2"
          className="h-20 border-10 border-blue-800 hover:border-blue-700 hover:bg-blue-700 bg-blue-500 rounded-xl shadow-md flex items-center"
          onClick={() => setCount((count) => count + 1)}
        >
          VAS Y CLIQUE {count}
          <Waow />
        </button>
      </div>
      <div className="bg-green-500 p-10"></div>
    </>
  );
}

export default App;
