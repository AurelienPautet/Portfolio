import { useState } from "react";
import { FaLock } from "react-icons/fa6";
import { FaLockOpen } from "react-icons/fa6";
interface PhysicsControlButtonProps {
  className?: string;
}

export const PhysicsControlButton = ({
  className = "",
}: PhysicsControlButtonProps) => {
  const [isConstrained, setIsConstrained] = useState(true);

  const handleToggleConstraints = () => {
    const physicalDomObjects = window.physicalDomObjects;

    if (!physicalDomObjects || physicalDomObjects.length === 0) {
      return;
    }

    if (isConstrained) {
      for (const physicalDomObject of physicalDomObjects) {
        physicalDomObject.removeConstraint();
      }
    } else {
      for (const physicalDomObject of physicalDomObjects) {
        physicalDomObject.addConstraint();
      }
    }

    setIsConstrained(!isConstrained);
  };

  return (
    <button
      onClick={handleToggleConstraints}
      className={`px-4 py-2 border border-blueprint-line text-blueprint-line font-mono uppercase text-sm bg-[var(--color-blueprint-bg)] hover:text-black transition-colors ${className}`}
    >
      {isConstrained ? (
        <FaLockOpen className="inline w-4 h-4 mr-2" />
      ) : (
        <FaLock className="inline w-4 h-4 mr-2" />
      )}

      {isConstrained ? "Release Objects" : "Lock Objects"}
    </button>
  );
};

export default PhysicsControlButton;
