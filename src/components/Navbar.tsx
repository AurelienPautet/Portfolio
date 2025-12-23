import { PhysicsControlButton } from "./PhysicsControlButton.tsx";
// import ThemeController from "./ThemeController.tsx";

const Navbar = () => {
  return (
    <div className="sticky bg-dashed z-50 top-0 w-full flex items-center h-20 border-b border-blueprint-line bg-[rgb(59,111,214)] ">
      <div className="flex gap-2 mx-5">
        <h1 className="sticky text-center text-xl font-bold bg-[var(--color-blueprint-bg)] p-2 font-mono text-white uppercase tracking-widest mr-auto">
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
