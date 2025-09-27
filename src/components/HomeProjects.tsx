import WordSeparate from "./WordSeparate";
import ProjectCard from "./ProjectCard";
const HomeProjects = () => {
  return (
    <>
      <WordSeparate
        htmlTag="h2"
        text="My Projects"
        className="physical text-2xl font-bold mb-4"
      />
      <div className=" chain-container mt-10 w-full flex-col justify-center items-center flex gap-12">
        <ProjectCard
          className=""
          title="WiiGameBien"
          date="2024 - Now"
          description="A Javascript and html canvas recreation of the Wii Plays tank game, with a custom engine. Features include multiplayer, level editor, player skins and more."
          imgUrl="/projectThumbnails/WiiGameBien.png"
          visitUrl="https://wiitank.pautet.net"
          skills={["Html", "Css", "Js"]}
        />
        <ProjectCard
          className="nonconstrained"
          title="MIT"
          date="2020 - 2024"
          description="One of the most prestigious universities in the world."
          imgUrl="/projectThumbnails/MIT.png"
          visitUrl="https://web.mit.edu"
          skills={["Html", "Css", "Js", "React", "Node", "Postgres", "Git"]}
        />
        <ProjectCard
          className="nonconstrained"
          title="Stanford University"
          date="2019 - 2023"
          description="Known for its academic strength and proximity to Silicon Valley."
          imgUrl="/projectThumbnails/Stanford.png"
          visitUrl="https://www.stanford.edu"
          skills={["Html", "Css", "Js", "React", "Node", "Postgres", "Git"]}
        />
      </div>
    </>
  );
};

export default HomeProjects;
