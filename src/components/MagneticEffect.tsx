import { useEffect, useRef, useState } from "react";

export const MagneticEffect = () => {
  // Only toggled on right-button press/release: cheap React commits.
  const [isActive, setIsActive] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const applyPosition = () => {
      rafRef.current = null;
      const el = overlayRef.current;
      if (!el) return;
      el.style.setProperty("--mx", `${posRef.current.x}px`);
      el.style.setProperty("--my", `${posRef.current.y}px`);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 2) return;
      activeRef.current = true;
      setIsActive(true);
      posRef.current = { x: e.clientX, y: e.clientY };
      applyPosition();
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 2) return;
      activeRef.current = false;
      setIsActive(false);
    };

    // Ignore moves while inactive; while active, coalesce to one rAF per frame.
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeRef.current) return;
      posRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(applyPosition);
      }
    };

    // Reset drag state if the window loses focus mid-drag (missed mouseup).
    const handleBlur = () => {
      activeRef.current = false;
      setIsActive(false);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", handleBlur);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      activeRef.current = false;
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 pointer-events-none z-30 transition-opacity duration-300 ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background:
          "radial-gradient(circle at var(--mx, 0px) var(--my, 0px), rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
      }}
    />
  );
};

export default MagneticEffect;
