import React from "react";
import { SelectionBoxProps } from "@/types";


const SelectionBox: React.FC<SelectionBoxProps> = ({ x, y, width, height, text }) => {
  return (
    <div
      className="selection-box"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
      title={text}
    />
  );
};

export default SelectionBox;
