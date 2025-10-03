import { FaGithub } from "react-icons/fa";
import { IoSchool } from "react-icons/io5";

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
  skills = [],
}: ProjectCardProps) => {
  return (
    <div
      className={`card card-border items-center lg:card-side border-primary rounded-lg  bg-base-100 w-2/3 h-fit ${className}`}
    >
      <figure className="rounded-lg m-4 physical  w-fit h-48 lg:w-1/3  flex items-center justify-center bg-base-200">
        <img
          src={imgUrl}
          alt={title + " image"}
          draggable={false}
          className="max-w-full max-h-full object-contain"
        />
      </figure>

      <div className="card-body items-center">
        <div className="relative w-fit">
          <WordSeparate
            text={title}
            parentClassName="card-title"
            className="physical h-fit"
            wordGap={1}
          />
          {isScolar && (
            <span
              className="absolute -top-2 right-0 tooltip tooltip-bottom"
              title="This project was done in a school context"
            >
              <IoSchool className="w-6 h-6 text-primary absolute" />
            </span>
          )}
        </div>
        <div className="   w-full flex items-center justify-center gap-2">
          {skills.map((skill) => (
            <img
              key={skill}
              src={`/logos/Logo${skill}.svg`}
              className={`physical  w-8 h-8 user-select-none select-none`}
              alt={`${skill} Logo`}
              draggable={false}
            />
          ))}
        </div>
        <span className="physical mx-auto text-sm italic ">{date}</span>
        <span className="physical text-sm ">{description}</span>

        <div className="card-actions justify-end">
          {gitHubUrl != "" && (
            <a href={gitHubUrl} target="_blank" className="w-10 physical">
              <FaGithub className="w-full h-full" />
            </a>
          )}
          {visitUrl != "" && (
            <a
              href={visitUrl}
              target="_blank"
              className="physical btn btn-primary"
            >
              Visit
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
