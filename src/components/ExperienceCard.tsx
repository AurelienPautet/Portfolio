import { FaExternalLinkAlt } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import WordSeparate from "./WordSeparate";
import { getImageDimensions } from "../imageDimensions";

interface ExperienceCardProps {
  className?: string;
  company: string;
  role: string;
  date: string;
  location: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  achievements?: string[];
  tech?: string[];
}

const ExperienceCard = ({
  className = "",
  company,
  role,
  date,
  location,
  description,
  logoUrl,
  websiteUrl = "",
  achievements = [],
  tech = [],
}: ExperienceCardProps) => {
  const logo = getImageDimensions(logoUrl);
  return (
    <div
      className={`relative flex flex-col lg:flex-row items-center bg-crosshatch bg-blueprint-bg blueprint-element blueprint-box p-6 rounded-none w-2/3 max-w-4xl h-fit gap-6 ${className}`}
    >
      <div className="absolute -left-10 top-1/2 hidden lg:block">
        <div className="w-4 h-4 physical circle rounded-full border-2 border-white bg-blueprint-bg" />
      </div>

      <div className="flex flex-col w-full gap-6">
        <WordSeparate
          text={role}
          parentClassName="text-xl lg:text-2xl font-bold font-mono tracking-wide text-white"
          className="physical h-fit px-1"
          wordGap={1}
        />

        <div className="flex flex-col lg:flex-row items-center w-full gap-6">
          {logoUrl && (
            <figure className="m-0 w-20 h-20 lg:w-28 lg:h-28 flex items-center justify-center p-2 shrink-0">
              <img
                src={logoUrl}
                alt={company + " logo"}
                draggable={false}
                width={logo?.width}
                height={logo?.height}
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-full object-contain physical blueprint-element"
              />
            </figure>
          )}

          <div className="flex flex-col items-center lg:items-start w-full gap-3">
            <span className="physical px-2 py-1 text-base font-semibold font-mono text-white">
              {company}
            </span>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-mono text-white opacity-80">
              <span className="physical px-2 py-1 italic">{date}</span>
              <span className="physical px-2 py-1 flex items-center gap-1">
                <IoLocationSharp className="w-4 h-4" />
                {location}
              </span>
            </div>

            <p className="physical p-2 text-sm font-mono text-center lg:text-left text-white">
              {description}
            </p>

            {achievements.length > 0 && (
              <ul className="flex flex-col gap-2 w-full">
                {achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="physical px-2 text-sm font-mono text-left text-white flex gap-2"
                  >
                    <span className="shrink-0">▹</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            )}

            {tech.length > 0 && (
              <ul className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {tech.map((item, index) => (
                  <li
                    key={index}
                    className="physical blueprint-element px-3 py-1 text-xs font-mono border border-white text-white"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {websiteUrl && (
              <div className="flex justify-end w-full mt-2">
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="physical blueprint-element flex items-center gap-2 px-4 py-2 font-bold hover:bg-blueprint-primary hover:text-black transition-colors"
                  draggable={false}
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                  VISIT
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
