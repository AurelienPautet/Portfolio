import Triangle from "./Triangle";

const HomeScale = () => {
  return (
    <>
      <div className="my-20 w-full flex flex-col items-center justify-center">
        <div className="w-1/2 h-4 flex justify-between items-center mb-2">
          <div className="physical nonconstrained h-10 w-10  bg-secondary"></div>
          <div className="physical nonconstrained h-10 w-10  bg-secondary"></div>
        </div>
        <div className="physical rotation w-1/2 h-4 bg-primary"></div>
        <Triangle className="physical static triangle  mt-2 h-10 fill-primary" />
      </div>
    </>
  );
};

export default HomeScale;
