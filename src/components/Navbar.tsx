// import { PhysicsControlButton } from "./PhysicsControlButton.tsx";
// import ThemeController from "./ThemeController.tsx";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // the smooth scrolling is not as easy as normal because of the matter physics engine running in the background and capturing scroll events
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const targetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 800;
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
    // Close menu on mobile after clicking
    setIsMenuOpen(false);
  };

  return (
    <div className="sticky bg-dashed z-50 top-0 w-full border-b border-blueprint-line bg-[rgb(59,111,214)]">
      <div className="flex items-center h-20">
        <div className="flex gap-2 mx-5">
          <h1 className="sticky text-center text-xl font-bold bg-blueprint-bg p-2 font-mono text-white uppercase tracking-widest mr-auto">
            Aurélien
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 mx-5 ml-auto items-center">
          <button
            onClick={() => scrollToSection("home")}
            className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded bg-blueprint-bg"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("skills")}
            className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded bg-blueprint-bg"
          >
            Skills
          </button>
          <button
            onClick={() => scrollToSection("education")}
            className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded bg-blueprint-bg"
          >
            Education
          </button>
          <button
            onClick={() => scrollToSection("projects")}
            className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded bg-blueprint-bg"
          >
            Projects
          </button>
          <button
            onClick={() => scrollToSection("hire-me")}
            className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded bg-blueprint-bg"
          >
            Hire Me
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden ml-auto mx-5 text-white p-2 hover:text-gray-200 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/*       <div className="flex gap-2 mx-5 ml-auto items-center">
        <PhysicsControlButton className="" />
      </div> */}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden absolute top-20 left-0 right-0 border border-blueprint-line bg-dotted bg-[rgb(59,111,214)] pb-4 shadow-lg m-2">
          <div className="flex flex-col gap-2 mx-5 mt-4">
            <button
              onClick={() => scrollToSection("home")}
              className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded lg:bg-blueprint-bg text-left"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("skills")}
              className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded lg:bg-blueprint-bg text-left"
            >
              Skills
            </button>
            <button
              onClick={() => scrollToSection("education")}
              className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded lg:bg-blueprint-bg text-left"
            >
              Education
            </button>
            <button
              onClick={() => scrollToSection("projects")}
              className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded lg:bg-blueprint-bg text-left"
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection("hire-me")}
              className="text-white font-semibold hover:text-gray-200 transition-colors px-3 py-2 rounded lg:bg-blueprint-bg text-left"
            >
              Hire Me
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Navbar;
