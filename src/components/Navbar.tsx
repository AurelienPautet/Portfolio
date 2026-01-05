// import { PhysicsControlButton } from "./PhysicsControlButton.tsx";
// import ThemeController from "./ThemeController.tsx";

const Navbar = () => {
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
  };

  return (
    <div className="sticky bg-dashed z-50 top-0 w-full flex items-center h-20 border-b border-blueprint-line bg-[rgb(59,111,214)] ">
      <div className="flex gap-2 mx-5">
        <h1 className="sticky text-center text-xl font-bold bg-blueprint-bg p-2 font-mono text-white uppercase tracking-widest mr-auto">
          Aurélien
        </h1>
      </div>

      <nav className="flex gap-4 mx-5 ml-auto items-center">
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

      {/*       <div className="flex gap-2 mx-5 ml-auto items-center">
        <PhysicsControlButton className="" />
      </div> */}
    </div>
  );
};

export default Navbar;
