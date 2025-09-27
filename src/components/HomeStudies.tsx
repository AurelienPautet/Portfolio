import WordSeparate from "./WordSeparate";

const HomeStudies = () => {
  return (
    <>
      <WordSeparate
        htmlTag="h2"
        text="My Studies"
        className="physical text-2xl font-bold mb-4"
      />
      <div className="chain-container  w-full flex-col justify-center items-center flex gap-12">
        <div className="physical chain  bg-base-300 w-1/3 h-52">
          <h1 className="physical w-fit">CACA</h1>
        </div>
        <div className="physical chain nonconstrained bg-base-300 w-1/3 h-52"></div>
        <div className="physical chain nonconstrained bg-base-300 w-1/3 h-52"></div>
      </div>
    </>
  );
};

export default HomeStudies;
