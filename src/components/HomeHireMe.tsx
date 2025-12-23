import { changeGravity } from "../matter/dynamicSettings.js";
import { useState } from "react";

const HomeHireMe = () => {
  const [active, setActive] = useState<string | null>(null);

  const releaseObjects = () => {
    // @ts-ignore
    const physicalDomObjects = window.physicalDomObjects;
    if (physicalDomObjects && physicalDomObjects.length > 0) {
      for (const physicalDomObject of physicalDomObjects) {
        physicalDomObject.removeConstraint();
      }
    }
  };

  const handleYes = () => {
    setActive("YES");
    changeGravity(-1);
    releaseObjects();
  };

  const handleNo = () => {
    setActive("NO");
    changeGravity(1);
    releaseObjects();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-20 relative mb-30">
      <div className="absolute inset-0  opacity-30 pointer-events-none"></div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
        {active === "YES" && (
          <div className="animate-bounce">
            <h3 className="text-4xl md:text-5xl font-bold text-white font-mono mb-4">
              THANK YOU <span className="text-white">!</span>
            </h3>
            <p className="text-xl text-white/80 font-mono">
              Let's build something amazing together
            </p>
          </div>
        )}
        {active === "NO" && (
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white font-mono mb-4">
              WRONG CHOICE <span className="text-white">!</span>
            </h3>
            <p className="text-xl text-white/80 font-mono">
              (I'm hearthbroken... )
            </p>
          </div>
        )}
        {active && (
          <button
            onClick={() => {
              sessionStorage.setItem(
                "scrollPosition",
                window.scrollY.toString()
              );
              window.location.reload();
            }}
            className="mt-8 pointer-events-auto px-6 py-2 border border-white/70 hover:bg-white/10 text-white font-mono text-sm transition-colors uppercase tracking-widest"
          >
            [ Reset System ]
          </button>
        )}
      </div>

      <div className="blueprint-box p-12 physical w-fit h-fit bg-dashed bg-blueprint-bg relative z-10 max-w-2xl mx-4">
        <h2 className="physical text-3xl md:text-4xl font-bold text-center mb-12 blueprint-element">
          Will you hire me?
        </h2>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <button
            onClick={handleYes}
            className={`physical bg-blueprint-bg group relative px-12 py-4 border border-white ${
              active === "YES"
                ? "bg-blueprint-bg text-white"
                : "hover:bg-blueprint-bg"
            }`}
          >
            <span className="block text-xl font-bold tracking-wider">YES</span>
            <div
              className={`absolute inset-0 bg-white/20 blur-lg transition-opacity ${
                active === "YES"
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-50"
              }`}
            ></div>
          </button>

          <button
            onClick={handleNo}
            className={`physical bg-blueprint-bg group relative px-12 py-4 border border-white ${
              active === "NO"
                ? "bg-blueprint-bg text-white"
                : "hover:bg-blueprint-bg"
            }`}
          >
            <span className="block text-xl font-bold tracking-wider">NO</span>
            <div
              className={`absolute inset-0 bg-red-500/20 blur-lg transition-opacity ${
                active === "NO"
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-50"
              }`}
            ></div>
          </button>
        </div>

        <div className="physical mt-8 text-center text-sm opacity-60 font-mono">
          CAUTION: Decision may affect website integrity.
        </div>
      </div>
    </div>
  );
};

export default HomeHireMe;
