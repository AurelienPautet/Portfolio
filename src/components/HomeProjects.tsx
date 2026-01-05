import WordSeparate from "./WordSeparate";
import ProjectCard from "./ProjectCard";
const HomeProjects = () => {
  return (
    <div id="projects">
      <WordSeparate
        htmlTag="h2"
        text="My Projects"
        className="physical text-4xl font-bold mb-4"
        parentClassName="w-full flex justify-center mt-20"
      />
      <div className=" mt-10 w-full flex-col justify-center items-center flex gap-14">
        <ProjectCard
          className=""
          title="Text Founrdry"
          date="2025"
          description="My first vibe coded app using Antigravity. Text Foundry is a native macOs application that allows users to quickly apply prompts to selected text in any application using shortcuts. It supports custom prompts, history and more. It's the swift port of my Grammar Corrector Java application."
          imgUrl="/projectThumbnails/TextFoundry.png"
          visitUrl="https://aurelien.pautet.net/TextFoundry/"
          gitHubUrl="https://github.com/AurelienPautet/TextFoundry"
          skills={["Swift"]}
          isVibeCoded={true}
        />
        <ProjectCard
          className=""
          title="La Fine Equipe"
          date="2025"
          description="A full stack mono repo web application for my brother's univ association to manage their events, post articles and more. It includes a custom chatbot with a RAG system to answer questions about the association."
          imgUrl="/projectThumbnails/LaFineEquipe.png"
          visitUrl="https://la-fine-equipe.vercel.app"
          gitHubUrl="https://github.com/AurelienPautet/La-Fine-Equipe"
          skills={["React", "Tailwind", "Node", "Postgres", "Ts"]}
        />
        <ProjectCard
          className=""
          title="WiiGameBien"
          date="2024 - Now"
          description="A Javascript and html canvas recreation of the Wii Plays tank game, with a custom game and physics engine. Features include multiplayer, level editor, player skins and more."
          imgUrl="/projectThumbnails/WiiGameBien.png"
          visitUrl="https://wiitank.pautet.net"
          gitHubUrl="https://github.com/AurelienPautet/WiiGameBien"
          skills={["Html", "Css", "Js"]}
          isNotFinished={true}
        />
        <ProjectCard
          className=" "
          title="Transat integration of Fourchettas"
          date="2025"
          description="Integration of the Fourchettas ordering page into the student made Transat mobile app. See the Fourchettas project below for more details."
          imgUrl="/projectThumbnails/TransatFourchettas.png"
          gitHubUrl="https://github.com/PlugImt/transat-app"
          skills={["React", "Tailwind", "Git"]}
        />
        <ProjectCard
          className=" "
          title="Fourchettas"
          date="2025"
          description="A full stack web application used in my engineering school to host foods events where students can order meals made by our cooking club. It includes an admin panel to manage the events and orders."
          imgUrl="/projectThumbnails/Fourchettas.png"
          visitUrl="https://fourchettas-client.vercel.app"
          gitHubUrl="https://github.com/AurelienPautet/FOURCHETTAS"
          skills={["Tailwind", "React", "Node", "Postgres"]}
        />

        <ProjectCard
          className=""
          title="Grammar Corrector"
          date="2025"
          description="A little Java application that can correct any selected text in any application (shortcut Ctr+Alt+C), using the gemini API from Google. I recently ported it to Swift for macOs."
          imgUrl="/projectThumbnails/GrammarCorrector.png"
          gitHubUrl="https://github.com/AurelienPautet/AICorrector"
          skills={["Java"]}
        />
        <ProjectCard
          className=" "
          title="YouTube Downloader"
          date="2021"
          description="One of my earliest projects, a simple GUI to download YouTube videos from its url."
          imgUrl="/projectThumbnails/YoutubeDownloader.png"
          visitUrl="https://aurelien.pautet.net/software/"
          skills={["Python"]}
        />
        <ProjectCard
          className=" "
          title="My Early Projects"
          date="2019 - 2021"
          description="A collection of my earlies projects, mostly small jsGames"
          imgUrl="/projectThumbnails/SiteGallery.png"
          visitUrl="https://aurelien.pautet.net/SiteGallery/"
          skills={["Css", "Html", "Js"]}
        />
      </div>
    </div>
  );
};

export default HomeProjects;
