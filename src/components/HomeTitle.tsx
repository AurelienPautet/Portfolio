import WordSeparate from "./WordSeparate";

const HomeTitle = () => {
  return (
      <div className="flex  w-full  flex-col justify-center items-center gap-2 mt-32 mb-2">
        <div className="flex flex-row justify-center items-center gap-2 flex-wrap ">
          <div className="relative">
          <h1 className="physical text-7xl w-fit h-fit font-bold font-mono text-white uppercase tracking-tighter">
            Aurélien
        
          </h1>
                      <div className="absolute left-full top-1/4 h-fit flex ml-2 justify-center items-center gap-2 text-white/80 animate-pulse">
              <span className="text-2xl font-mono whitespace-nowrap tracking-wide">← DRAG ME</span>
            </div>
          </div>

        <WordSeparate
          text="20 years old"
          wordGap={1}
          className="physical text-5xl w-fit h-fit font-mono font-bold text-white"
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
