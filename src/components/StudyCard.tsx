import WordSeparate from "./WordSeparate";

interface StudyCardProps {
  className?: string;
  ecole: string;
  date: string;
  description: string;
}

const StudyCard = ({
  className = "",
  ecole,
  date,
  description,
}: StudyCardProps) => {
  return (
    <div
      className={`physical chain card card-border bg-base-100 w-96 ${className}`}
    >
      <div className="card-body">
        <div className="flex justify-start items-center gap-4">
          <WordSeparate
            htmlTag="h2"
            text={ecole}
            className="physical w-fit card-title"
            parentClassName="card-title"
          />
          <div className="physical badge badge-secondary">{date}</div>
        </div>
        <WordSeparate htmlTag="h1" text={description} className="physical" />
      </div>
    </div>
  );
};

export default StudyCard;
