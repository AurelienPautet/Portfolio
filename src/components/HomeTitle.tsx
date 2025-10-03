import WordSeparate from "./WordSeparate";

const HomeTitle = () => {
  return (
    <div className="flex  w-full  flex-col justify-center items-center gap-2 mt-32 mb-2">
      <div className="flex flex-row justify-center items-center gap-2 flex-wrap">
        <h1 className="physical text-7xl w-fit h-fit  font-bold text-primary">
          Aurélien
        </h1>
        <WordSeparate
          text="20 years old"
          className="physical text-5xl w-fit h-fit  font-bold text-primary"
        />
      </div>
      <WordSeparate
        text="Passionate developer from France, working on personnal projects to improve my skills."
        wordGap={1}
        className="physical  text-xl w-fit h-fit   text-secondary"
        parentClassName="mt-2"
        parentWidth="w-3/4 md:w-1/3"
      />
    </div>
  );
};

export default HomeTitle;
