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
  skills: Skill[];
}
const ProjectCard = ({
  className = "",
  title,
  date,
  description,
  imgUrl,
  visitUrl = "",
  skills = [],
}: ProjectCardProps) => {
  return (
    <div
      className={`physical chain card card-border border-primary rounded-lg lg:card-side bg-base-100 w-2/3 h-fit lg:h-80 ${className}`}
    >
      <figure className="flex-shrink-0 rounded-lg m-4 physical ">
        <img src={imgUrl} alt={title + " image"} draggable={false} />
      </figure>

      <div className="card-body">
        <WordSeparate
          text={title}
          parentClassName="card-title"
          className="physical h-fit"
          wordGap={1}
        />
        <div className="   w-full flex items-center justify-center gap-2">
          {skills.map((skill, index) => (
            <img
              key={skill}
              src={`/logos/Logo${skill}.svg`}
              className={`physical  w-8 h-8 user-select-none select-none`}
              alt={`${skill} Logo`}
              draggable={false}
            />
          ))}
        </div>
        <WordSeparate
          text={description}
          parentClassName="card-description"
          className="physical h-fit"
          wordGap={1}
        />

        {visitUrl != "" && (
          <div className="card-actions justify-end">
            <a
              href={visitUrl}
              target="_blank"
              className="physical btn btn-primary"
            >
              Visit
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
