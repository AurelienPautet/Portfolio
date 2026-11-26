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
          title="StayLuma"
          date="2026"
          description="An AI photo enhancement web app for short-term rental hosts on Airbnb and Booking. Hosts upload their listing photos and get them back brighter, truer and booking-ready in two minutes, with an AI-generated summary of every change made. Built with a React frontend and a FastAPI backend orchestrated with LangGraph, using Gemini for image enhancement and Claude for the review generation."
          imgUrl="/projectThumbnails/StayLuma.svg"
          visitUrl="https://stayluma.net/"
          gitHubUrl="https://github.com/AurelienPautet/stayluma"
          skills={["React", "Ts", "Python", "Postgres", "LangGraph"]}
        />
        <ProjectCard
          className=""
          title="MindCap"
          date="2026"
          description="A privacy-first Chrome extension built with React and TypeScript that uses AI to categorize pages in real time and block distractions. It includes deep focus intentions, custom categories with daily limits, local-first inference (LM Studio or BYOK), and usage stats with backup/restore."
          imgUrl="/projectThumbnails/MindCap.webp"
          visitUrl="https://aurelien.pautet.net/MindCap/"
          skills={["React", "Ts"]}
        />
        <ProjectCard
          className=""
          title="RustTracer"
          date="2026"
          description="A CPU ray tracer written in Rust, following the ray tracing in one weekend book. It features a custom scene, multiple materials, BVH acceleration structure and more."
          imgUrl="/projectThumbnails/RustTracer.webp"
          gitHubUrl="https://github.com/AurelienPautet/RustTracer"
          skills={["Rust"]}
        />
        <ProjectCard
          className=""
          title="Text Foundry"
          date="2025"
          description="My first vibe coded app using Antigravity. Text Foundry is a native macOS application that allows users to quickly apply prompts to selected text in any application using shortcuts. It supports custom prompts, history and more. It's the swift port of my Grammar Corrector Java application."
          imgUrl="/projectThumbnails/TextFoundry.webp"
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
          imgUrl="/projectThumbnails/LaFineEquipe.webp"
          visitUrl="https://la-fine-equipe.vercel.app"
          gitHubUrl="https://github.com/AurelienPautet/La-Fine-Equipe"
          skills={["React", "Tailwind", "Node", "Postgres", "Ts"]}
        />
        <ProjectCard
          className=""
          title="WiiGameBien"
          date="2024 - Now"
          description="A Javascript and html canvas recreation of the Wii Play tank game, with a custom game and physics engine. Features include multiplayer, level editor, player skins and more."
          imgUrl="/projectThumbnails/WiiGameBien.webp"
          visitUrl="https://wiitank.pautet.net"
          gitHubUrl="https://github.com/AurelienPautet/WiiGameBien"
          skills={["Html", "Css", "Js"]}
          isNotFinished={true}
        />
        <ProjectCard
          className=" "
          title="Fourchettas"
          date="2025"
          description="A full stack web application used in my engineering school to host foods events where students can order meals made by our cooking club. It includes an admin panel to manage the events and orders, and I later integrated the ordering page into Transat, the student-made mobile app."
          imgUrl="/projectThumbnails/Fourchettas.webp"
          visitUrl="https://fourchettas-client.vercel.app"
          gitHubUrl="https://github.com/AurelienPautet/FOURCHETTAS"
          skills={["Tailwind", "React", "Node", "Postgres"]}
        />

        <ProjectCard
          className=" "
          title="My Early Projects"
          date="2019 - 2021"
          description="A collection of my earliest projects: mostly small JS games, plus a Python GUI to download YouTube videos from their URL."
          imgUrl="/projectThumbnails/SiteGallery.webp"
          visitUrl="https://aurelien.pautet.net/SiteGallery/"
          skills={["Css", "Html", "Js", "Python"]}
        />
      </div>
    </div>
  );
};

export default HomeProjects;
