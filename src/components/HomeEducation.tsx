import WordSeparate from "./WordSeparate";
import EducationCard from "./EducationCard";

const HomeEducation = () => {
  return (
    <div id="education">
      <WordSeparate
        htmlTag="h2"
        text="My Education"
        className="physical text-4xl font-bold mb-4"
        parentClassName="w-full flex justify-center mt-20"
      />

      <div className="relative mt-10 w-full flex flex-col justify-center items-center gap-14">
        <EducationCard
          institution="Georgia Institute of Technology"
          degree="Master of Science in Computer Science - ML & AI"
          date="Sept 2026 - Dec 2027"
          location="Atlanta, USA"
          description="Double degree between IMT Atlantique and Georgia Tech, one of the leading research universities in the United States. Specialization in machine learning and artificial intelligence, with graduate coursework in deep learning, NLP, and large-scale ML systems."
          logoUrl="/logos/education/GeorgiaTech.png"
          websiteUrl="https://www.gatech.edu"
          highlights={[
            "Machine Learning",
            "Deep Learning",
            "Artificial Intelligence",
          ]}
        />

        <EducationCard
          institution="Ingeniering School, IMT Atlantique"
          degree="Engineering Diploma"
          date="2024 - 2027"
          location="Nantes, France"
          description="Elite French engineering school (Grande École). Pursuing a specialization in software development, cloud computing, and distributed systems. Strong focus on mathematics, algorithms, and systems architecture."
          logoUrl="/logos/education/IMT.svg"
          websiteUrl="https://www.imt-atlantique.fr"
          highlights={[
            "Software Engineering",
            "Networks",
            "AI & Machine Learning",
          ]}
        />

        <EducationCard
          institution="Preparatory Classes (CPGE), Lycée Berthollet"
          degree="Intensive Program"
          date="2022 - 2024"
          location="Annecy, France"
          description="Highly competitive two-year intensive program preparing for national entrance exams to top French engineering schools. Focus on advanced mathematics, physics, and computer science fundamentals."
          logoUrl="/logos/education/Berthollet.png"
          highlights={["Advanced Mathematics", "Algorithms", "Physics"]}
        />

        <EducationCard
          institution="Scientific Baccalauréat, Lycée de la cotière "
          degree="High School Diploma"
          date="2019 - 2022"
          location="La Boisse, France"
          description="French high school diploma with highest honors (Mention Très Bien). Specialized in mathematics and physics with additional focus on computer science."
          logoUrl="/logos/education/Cotiere.png"
          highlights={["Mathematics", "Physics", "Computer Science"]}
        />
      </div>
    </div>
  );
};

export default HomeEducation;
