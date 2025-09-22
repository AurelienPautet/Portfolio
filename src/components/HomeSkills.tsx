import WordSeparate from "./WordSeparate";

const HomeSkills = () => {
  return (
    <>
      <div className="flex w-full ">
        <div className="flex justify-center items-center w-full mt-12">
          <div className="physical static h-96  w-fit p-20 bg-base-100 border-2 border-primary">
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
          <div className="w-1/2 h-full flex flex-col justify-start items-center">
            <WordSeparate
              text="My Skills"
              className="physical text-2xl font-bold text-primary mb-4"
              htmlTag="h2"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeSkills;
