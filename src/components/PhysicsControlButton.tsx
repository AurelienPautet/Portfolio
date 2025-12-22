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
      className={`px-4 py-2 border border-[var(--color-blueprint-line)] text-[var(--color-blueprint-line)] font-mono uppercase text-sm hover:bg-[var(--color-blueprint-primary)] hover:text-black transition-colors ${
        !isConstrained ? "bg-[rgba(56,189,248,0.1)]" : "bg-transparent"
      } ${className}`}
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
