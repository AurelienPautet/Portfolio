const HomeGameChamboule = () => {
  return (
    <>
      <div className="mt-40 w-full flex justify-between items-center px-10 md:px-80">
        <div className="flex items-center justify-center">
          <div className="physical nonconstrained circle rounded-full h-16 w-16 bg-blueprint-bg bg-dotted border border-white cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-white"></div>
        </div>

        <div className="flex flex-col items-center gap-1">
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {Array.from({ length: rowIndex + 1 }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="physical nonconstrained h-8 w-8 bg-blueprint-bg bg-dashed  border border-white hover:bg-white/30 transition-colors"
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeGameChamboule;
