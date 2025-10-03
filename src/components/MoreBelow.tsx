import { use } from "react";
import { FaArrowDown } from "react-icons/fa";
import { useEffect, useState } from "react";

export const MoreBelow = () => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`sticky bottom-4 flex flex-col gap-2 justify-center items-center w-full ${
        isVisible ? "opacity-100" : "opacity-0"
      } transition-opacity`}
    >
      <p className="text-sm text-gray-500">More</p>
      <FaArrowDown className="w-4 h-4  text-gray-500 animate-bounce" />
    </div>
  );
};

export default MoreBelow;
