import { changeGravity } from "../matter/dynamicSettings.js";
import { useState } from "react";

const HomeScale = () => {
  const [gravity, setGravity] = useState(1);

  const handleGravityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setGravity(value);
      changeGravity(value);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-blueprint-bg blueprint-box w-62 bg-dotted p-10 flex flex-col items-center justify-center">
        <label className="physical" htmlFor=" gravity">
          Gravity : {gravity}
        </label>
        <input
          type="range"
          id="gravity"
          value={gravity}
          onChange={handleGravityChange}
          step="0.1"
          min="-2"
          max="2"
          className="physical accent-white w-full cursor-grab active:cursor-grabbing"
        />
      </div>
    </div>
  );
};

export default HomeScale;
