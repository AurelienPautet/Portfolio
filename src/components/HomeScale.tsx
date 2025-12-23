import Triangle from "./Triangle";

const HomeScale = () => {
  return (
    <>
      <div className="my-20 w-full flex flex-col items-center justify-center">
        <div className="w-1/2 h-4 flex justify-between items-center mb-2">
          <div className="physical nonconstrained h-10 w-10  bg-white"></div>
          <div className="physical nonconstrained h-10 w-10  bg-white"></div>
          <div className="physical nonconstrained h-10 w-10  bg-white"></div>{" "}
          <div className="physical nonconstrained h-10 w-10  bg-white"></div>{" "}
          <div className="physical nonconstrained h-10 w-10  bg-white"></div>{" "}
          <div className="physical nonconstrained h-10 w-10  bg-white"></div>
        </div>
        <div className="physical rotation w-1/2 h-4 bg-white"></div>
        <Triangle className="physical static triangle  mt-2 h-10 fill-white" />
      </div>
    </>
  );
};

export default HomeScale;
