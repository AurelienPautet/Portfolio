import WordSeparate from "./WordSeparate";

const HomeTitle = () => {

  const age = Date.now() - new Date("2005-06-29").getTime();
  const ageInYears = Math.floor(age / (1000 * 60 * 60 * 24 * 365));
  return (
      <div className="flex  w-full  flex-col justify-center items-center gap-2 mt-32 mb-2">
        <div className="flex flex-row justify-center items-center gap-2 flex-wrap ">
          <div className="relative">
          <h1 className="physical text-9xl w-fit h-fit text-center font-bold tracking-wider font-blueprint text-white uppercase ">
            Aurelien
        
          </h1>
              <div className="hidden lg:flex absolute left-full top-1/4 h-fit  ml-2 justify-center items-center gap-2 text-white/80 animate-pulse">
              <span className="text-2xl font-mono whitespace-nowrap tracking-wide">← DRAG ME</span>
            </div>
          </div>

        <WordSeparate
          text={`${ageInYears} years old`}
          wordGap={1}
          className="physical  text-5xl w-fit h-fit font-mono font-bold text-white"
        />
      </div>
      <WordSeparate
        text="Passionate developer from France, working on personnal projects to improve my skills."
        wordGap={1}
        className="physical text-xl w-fit h-fit font-mono text-white"
        parentClassName="mt-2"
        parentWidth="w-3/4 md:w-1/3"
      />
    </div>
  );
};

export default HomeTitle;
