import { useEffect, useState } from "react";

export const MagneticEffect = () => {
  const [isActive, setIsActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        setIsActive(true);
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        setIsActive(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-30 transition-opacity duration-300 ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.15) 0%, transparent 80%)`,
      }}
    />
  );
};

export default MagneticEffect;
