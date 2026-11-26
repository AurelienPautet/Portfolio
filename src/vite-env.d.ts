/// <reference types="vite/client" />

interface PhysicalDomObjectHandle {
  removeConstraint(): void;
  addConstraint(): void;
}

interface Window {
  physicalDomObjects?: PhysicalDomObjectHandle[] | null;
  physics?: {
    stats(): { awake: number; dynamic: number; dragging: boolean; stepTimes: number[] };
    wake(): void;
    releaseAll(): void;
    lockAll(): void;
    setDebug(enabled?: boolean): void;
    dispose(): void;
  } | null;
}
