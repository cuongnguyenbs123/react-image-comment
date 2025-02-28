// Pin.tsx
import React from "react";

export interface PinProps {
  x: number;
  y: number;
  isActive: boolean;
  onClick: () => void;
}

const Pin: React.FC<PinProps> = ({ x, y, isActive, onClick }) => {
  return (
    <div
      className={`pin ${isActive ? "pin-active" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span>📍</span>
    </div>
  );
};

export default Pin;
