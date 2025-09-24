import WordSeparate from "./WordSeparate";

const HomeSkills = () => {
  return (
    <>
      <div className="flex w-full ">
        <div className="flex justify-center items-center w-full mt-12">
          <div className=" static h-full w-fit p-20 bg-base-100 border-2 border-primary">
            <div className="w-full h-fit flex flex-col justify-start items-center">
              <WordSeparate
                text="My Skills"
                className="physical text-2xl font-bold  mb-4"
                htmlTag="h2"
              />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <img
                src="./src/assets/LogoReact.svg"
                className="physical circle nonconstrained w-20 h-20 user-select-none select-none"
                alt="React Logo"
                draggable={false}
              />
              <img
                src="./src/assets/LogoHtml.svg"
                className="physical nonconstrained w-fit h-20 user-select-none select-none"
                alt="HTML Logo"
                draggable={false}
              />
              <img
                src="./src/assets/LogoCss.svg"
                className="physical nonconstrained w-fit h-20 user-select-none select-none"
                alt="CSS Logo"
                draggable={false}
              />
              <img
                src="./src/assets/LogoJs.svg"
                className="physical nonconstrained w-fit h-20 user-select-none select-none"
                alt="JavaScript Logo"
                draggable={false}
              />
              <img
                src="./src/assets/LogoTailwind.svg"
                className="physical circle nonconstrained w-15 h-10 user-select-none select-none"
                alt="Tailwind CSS Logo"
                draggable={false}
              />
              <img
                src="./src/assets/LogoPostgres.svg"
                className="physical nonconstrained w-fit h-20 user-select-none select-none"
                alt="PostgreSQL Logo"
                draggable={false}
              />
              <img
                src="./src/assets/LogoNode.svg"
                className="physical nonconstrained w-fit h-10 user-select-none select-none"
                alt="Node.js Logo"
                draggable={false}
              />
              <img
                src="./src/assets/LogoPython.svg"
                className="physical circle nonconstrained w-fit h-15 user-select-none select-none"
                alt="Python Logo"
                draggable={false}
              />
              <img
                src="./src/assets/LogoJava.svg"
                className="physical circle nonconstrained w-fit h-15 user-select-none select-none"
                alt="Python Logo"
                draggable={false}
              />
              <img
                src="./src/assets/LogoTs.svg"
                className="physical  nonconstrained w-fit h-15 user-select-none select-none"
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
