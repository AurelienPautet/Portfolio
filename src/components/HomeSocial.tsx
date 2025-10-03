import { FaGithub } from "react-icons/fa6";

const HomeSocial = () => {
  return (
    <div className="flex flex-row justify-center items-center gap-6">
      <a
        href="https://github.com/AurelienPautet"
        target="_blank"
        className="physical"
      >
        {" "}
        <FaGithub />
      </a>
    </div>
  );
};

export default HomeSocial;
