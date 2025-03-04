export interface Comment {
    id: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
    text: string;
    type: "pin" | "selection";
  }
  
export type ResizeDirection = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left" | "right" | "top" | "bottom" | null;
  