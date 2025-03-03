export interface Comment {
    id: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
    text: string;
    type: "pin" | "selection";
  }
  