import WordSeparate from "./WordSeparate";

const HomeTitle = () => {
  return (
    <div className="flex  w-full  flex-col justify-center items-center gap-2 mt-32 mb-2">
      <WordSeparate
        text="Aurélien, 20 years old"
        className="physical text-6xl w-fit h-fit  font-bold text-primary"
      />
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
