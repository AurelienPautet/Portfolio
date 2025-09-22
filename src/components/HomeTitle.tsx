import WordSeparate from "./WordSeparate";

const HomeTitle = () => {
  return (
    <div className="w-full  flex-col justify-center items-center gap-2 mt-10 mb-2">
      <WordSeparate
        text="Welcome to my portfolio"
        className="physical text-4xl w-fit h-fit  font-bold text-primary"
      />
      <WordSeparate
        text="I'm Aurélien, a web developer"
        className="physical text-2xl w-fit h-fit  font-semibold text-secondary"
      />
    </div>
  );
};

export default HomeTitle;
