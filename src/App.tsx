import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-none">
          <button className="physical btn btn-square  ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>{" "}
            </svg>
          </button>
        </div>
        <div className=" flex-1 flex gap-2">
          <a
            className="physical btn w-36  text-xl"
            onClick={() => setCount((count) => count + 1)}
          >
            Aurélien {count}
          </a>
          <a className="physical btn   text-xl">Pautet</a>
        </div>
        <div className="flex-none">
          <button className="physical btn btn-square  ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              ></path>{" "}
            </svg>
          </button>
        </div>
      </div>
      <div className=" card m-5">
        <div className="physical bg-accent-content card-body">
          <h2 className="physical card-title w-fit">Hello World!</h2>
          <p className="physical w-fit">Welcome to my portfolio website.</p>
          <div className=" card-actions justify-end">
            <button className="physical btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center w-full">
        <div className="physical static w-fit p-20 bg-base-100">
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
