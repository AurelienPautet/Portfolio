import WordSeparate from "./WordSeparate";

const HomeSkills = () => {
  return (
    <>
      <div className="flex w-screen ">
        <div className="flex justify-center items-center w-full mt-12">
          <div
            className="physical static h-full w-fit p-10 bg-base-100 shadow-[0px_0px_45px_10px_rgba(0,0,255,0.3)]
 border-2 border-primary rounded-md"
          >
            <div className="w-full h-fit flex flex-col justify-start items-center">
              <WordSeparate
                text="My Skills"
                className="physical text-4xl font-bold  mb-4"
                htmlTag="h2"
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
              <img
                src="/logos/LogoReact.svg"
                className="physical circle nonconstrained w-20 h-20 user-select-none select-none"
                alt="React Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoHtml.svg"
                className="physical nonconstrained w-16 h-20 user-select-none select-none"
                alt="HTML Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoCss.svg"
                className="physical nonconstrained w-16 h-20 user-select-none select-none"
                alt="CSS Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoJs.svg"
                className="physical nonconstrained w-16 h-20 user-select-none select-none"
                alt="JavaScript Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoTailwind.svg"
                className="physical circle nonconstrained w-15 h-10 user-select-none select-none"
                alt="Tailwind CSS Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoPostgres.svg"
                className="physical nonconstrained w-16 h-20 user-select-none select-none"
                alt="PostgreSQL Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoNode.svg"
                className="physical nonconstrained w-fit h-10 user-select-none select-none"
                alt="Node.js Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoGit.svg"
                className="physical circle nonconstrained w-15 h-15 user-select-none select-none"
                alt="Git Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoPython.svg"
                className="physical circle nonconstrained w-15 h-15 user-select-none select-none"
                alt="Python Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoJava.svg"
                className="physical circle nonconstrained w-15 h-15 user-select-none select-none"
                alt="Python Logo"
                draggable={false}
              />
              <img
                src="/logos/LogoTs.svg"
                className="physical  nonconstrained w-15 h-15 user-select-none select-none"
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
