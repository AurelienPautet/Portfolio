import WordSeparate from "./WordSeparate";

const HomeSkills = () => {
  return (
    <>
      <div className="flex w-screen ">
        <div className="flex justify-center items-center w-full mt-12">
          <div
            className="physical blueprint-box blueprint-element static h-full w-fit p-10 
  rounded-none shadow-none"
          >
            <div className="w-full h-fit flex flex-col justify-start items-center">
              <WordSeparate
                text="My Skills"
                className="physical text-4xl font-bold mb-4 font-mono text-white"
                htmlTag="h2"
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              <img
                src="/logos/LogoReact.svg"
                className="physical circle blueprint-element rounded-full nonconstrained w-20 h-20 user-select-none select-none p-2"
                alt="React Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoHtml.svg"
                className="physical blueprint-element nonconstrained w-16 h-20 user-select-none select-none p-2"
                alt="HTML Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoCss.svg"
                className="physical blueprint-element nonconstrained w-16 h-20 user-select-none select-none p-2"
                alt="CSS Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoJs.svg"
                className="physical blueprint-element nonconstrained w-16 h-20 user-select-none select-none p-2"
                alt="JavaScript Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoTailwind.svg"
                className="physical circle blueprint-element rounded-full nonconstrained w-15 h-10 user-select-none select-none p-2"
                alt="Tailwind CSS Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoPostgres.svg"
                className="physical blueprint-element nonconstrained w-16 h-20 user-select-none select-none p-2"
                alt="PostgreSQL Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoNode.svg"
                className="physical blueprint-element nonconstrained w-fit h-10 user-select-none select-none p-2"
                alt="Node.js Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoGit.svg"
                className="physical circle blueprint-element rounded-full nonconstrained w-15 h-15 user-select-none select-none p-2"
                alt="Git Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoPython.svg"
                className="physical circle blueprint-element rounded-full nonconstrained w-15 h-15 user-select-none select-none p-2"
                alt="Python Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoJava.svg"
                className="physical circle blueprint-element rounded-full nonconstrained w-15 h-15 user-select-none select-none p-2"
                alt="Java Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoTs.svg"
                className="physical blueprint-element nonconstrained w-15 h-15 user-select-none select-none p-2"
                alt="TypeScript Logo"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeSkills;
