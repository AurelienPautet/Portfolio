import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { MdMail } from "react-icons/md";

import { SocialButton } from "./SocialButton";

const HomeSocial = () => {
  return (
    <div className="mt-10 flex flex-col lg:flex-row justify-center items-center gap-6">
      <SocialButton
        Icon={FaGithub}
        url="https://github.com/AurelienPautet"
        label="GitHub"
        className="hover:text-primary transition-colors"
      />
      <SocialButton
        Icon={FaLinkedin}
        url="https://www.linkedin.com/in/aur%C3%A9lien-pautet-05550132b/"
        label="LinkedIn"
        className="hover:text-primary transition-colors"
      />
      <SocialButton
        Icon={MdMail}
        url="mailto:aurelien@pautet.net"
        label="aurelien@pautet.net"
        className="hover:text-primary transition-colors"
      />
    </div>
  );
};

export default HomeSocial;
