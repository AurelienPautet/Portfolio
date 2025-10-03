import ThemeController from "./ThemeController.tsx";

const Navbar = () => {
  return (
    <div className="navbar sticky z-50 top-0 w-full flex items-center h-20  shadow-sm backdrop-blur-2xl">
      <div className=" flex gap-2 mx-5">
        <h1 className=" sticky text-center text-xl font-bold text-primary mr-auto">
          Aurélien
        </h1>
      </div>
      <div className="flex gap-2 mx-5 ml-auto items-center">
        <ThemeController />
      </div>
    </div>
  );
};

export default Navbar;
