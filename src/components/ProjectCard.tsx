import { FaGithub } from "react-icons/fa";
import { IoSchool } from "react-icons/io5";
import { MdBuild } from "react-icons/md";

import WordSeparate from "./WordSeparate";
type Skill =
  | "Html"
  | "Css"
  | "Js"
  | "Ts"
  | "React"
  | "Node"
  | "Postgres"
  | "Tailwind"
  | "Git"
  | "Python"
  | "Java";

interface ProjectCardProps {
  className?: string;
  title: string;
  date: string;
  description: string;
  imgUrl?: string;
  visitUrl?: string;
  gitHubUrl?: string;
  isScolar?: boolean;
  isNotFinished?: boolean;
  skills: Skill[];
}
const ProjectCard = ({
  className = "",
  title,
  date,
  description,
  imgUrl,
  visitUrl = "",
  gitHubUrl = "",
  isScolar = false,
  isNotFinished = false,
  skills = [],
}: ProjectCardProps) => {
  return (
    <div
      className={`flex flex-col lg:flex-row items-center blueprint-box p-6 rounded-none w-2/3 h-fit gap-6 ${className}`}
    >
      <figure className="m-0  w-fit h-48 lg:w-1/3 flex items-center justify-center p-2">
        <img
          src={imgUrl}
          alt={title + " image"}
          draggable={false}
          className="max-w-full max-h-full object-contain physical blueprint-element"
        />
      </figure>

      <div className="flex flex-col items-center w-full gap-4">
        <div className="relative w-fit">
          <WordSeparate
            text={title}
            parentClassName="text-2xl font-bold font-mono tracking-widest text-white"
            className="physical h-fit px-1"
            wordGap={1}
          />
          {isScolar && (
            <span
              className="absolute -top-4 -right-8"
              title="This project was done in a school context"
            >
              <IoSchool className="physical blueprint-element p-1 w-8 h-8 text-white" />
            </span>
          )}
          {isNotFinished && (
            <span
              className="absolute -top-4 -right-8"
              title="This project is not finished"
            >
              <MdBuild className="physical blueprint-element p-1 w-8 h-8 text-white" />
            </span>
          )}
        </div>
        <div className="w-full flex items-center justify-center gap-2 flex-wrap">
          {skills.map((skill) => (
            <img
              key={skill}
              src={`/logos/Logo${skill}.svg`}
              className={`physical blueprint-element p-1 w-10 h-10 user-select-none select-none rounded-none`}
              alt={`${skill} Logo`}
              draggable={false}
            />
          ))}
        </div>
        <span className="physical px-2 py-1 mx-auto text-sm italic font-mono text-white">
          {date}
        </span>
        <span className="physical p-2 text-sm font-mono text-center text-white">
          {description}
        </span>

        <div className="flex justify-end gap-4 w-full mt-2">
          {gitHubUrl != "" && (
            <a
              href={gitHubUrl}
              target="_blank"
              className="w-10 h-10 physical blueprint-element flex items-center justify-center hover:bg-[var(--color-blueprint-primary)] hover:text-black transition-colors"
              draggable={false}
            >
              <FaGithub className="w-6 h-6" />
            </a>
          )}
          {visitUrl != "" && (
            <a
              href={visitUrl}
              target="_blank"
              className="physical blueprint-element px-4 py-2 font-bold hover:bg-[var(--color-blueprint-primary)] hover:text-black transition-colors"
              draggable={false}
            >
              VISIT
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
