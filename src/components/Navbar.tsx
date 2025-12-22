import { PhysicsControlButton } from "./PhysicsControlButton.tsx";
// import ThemeController from "./ThemeController.tsx";

const Navbar = () => {
  return (
    <div className="sticky z-50 top-0 w-full flex items-center h-20 border-b border-[var(--color-blueprint-line)] bg-[rgba(59,111,214,0.9)] backdrop-blur-md">
      <div className="flex gap-2 mx-5">
        <h1 className="sticky text-center text-xl font-bold font-mono text-white uppercase tracking-widest mr-auto">
          Aurélien
        </h1>
      </div>
      <div className="flex gap-2 mx-5 ml-auto items-center">
        <PhysicsControlButton className="fixedz-50" />
      </div>
    </div>
  );
};

export default Navbar;
