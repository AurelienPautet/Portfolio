import WordSeparate from "./WordSeparate";
import ProjectCard from "./ProjectCard";
const HomeProjects = () => {
  return (
    <>
      <WordSeparate
        htmlTag="h2"
        text="My Projects"
        className="physical text-2xl font-bold mb-4"
        parentClassName="w-full flex justify-center mt-20"
      />
      <div className=" chain-container mt-10 w-full flex-col justify-center items-center flex gap-12">
        <ProjectCard
          className=""
          title="WiiGameBien"
          date="2024 - Now"
          description="A Javascript and html canvas recreation of the Wii Plays tank game, with a custom engine. Features include multiplayer, level editor, player skins and more."
          imgUrl="/projectThumbnails/WiiGameBien.png"
          visitUrl="https://wiitank.pautet.net"
          gitHubUrl="https://github.com/AurelienPautet/WiiGameBien"
          skills={["Html", "Css", "Js"]}
        />
        <ProjectCard
          className="nonconstrained"
          title="Grammar Corrector"
          date="2025"
          description="A little Java application that can correct any selected text in any application (shortcut Ctr+Alt+C), using the gemini API from Google."
          imgUrl="/projectThumbnails/GrammarCorrector.png"
          gitHubUrl="https://github.com/AurelienPautet/AICorrector"
          skills={["Java"]}
        />
        <ProjectCard
          className="nonconstrained"
          title="Fourchettas"
          date="2025"
          description="A full stack web application used in my engineering school to host foods events where students can order meals made by our cooking club."
          imgUrl="/projectThumbnails/Fourchettas.png"
          visitUrl="https://fourchettas-client.vercel.app"
          gitHubUrl="https://github.com/AurelienPautet/FOURCHETTAS"
          skills={["Tailwind", "React", "Node", "Postgres"]}
        />
        <ProjectCard
          className="nonconstrained"
          title="Transat integration of Fourchettas"
          date="2025"
          description="Integration of the Fourchettas ordering page into the student made Transat mobile app."
          imgUrl="/projectThumbnails/TransatFourchettas.png"
          visitUrl="https://fourchettas-client.vercel.app"
          gitHubUrl="https://github.com/PlugImt/transat-app"
          skills={["React", "Tailwind", "Git"]}
        />
      </div>
    </>
  );
};

export default HomeProjects;
