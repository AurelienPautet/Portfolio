import WordSeparate from "./WordSeparate";
import StudyCard from "./StudyCard";
const HomeStudies = () => {
  return (
    <>
      <WordSeparate
        htmlTag="h2"
        text="My Studies"
        className="physical text-2xl font-bold mb-4"
      />
      <div className=" chain-container mt-10 w-full flex-col justify-center items-center flex gap-12">
        <StudyCard
          className=""
          ecole="IMT Atlantique"
          date="2024 - Now"
          description="A leading engineering school in France."
        />
        <StudyCard
          className="nonconstrained"
          ecole="MIT"
          date="2020 - 2024"
          description="One of the most prestigious universities in the world."
        />
        <StudyCard
          className="nonconstrained"
          ecole="Stanford University"
          date="2019 - 2023"
          description="Known for its academic strength and proximity to Silicon Valley."
        />
      </div>
    </>
  );
};

export default HomeStudies;
