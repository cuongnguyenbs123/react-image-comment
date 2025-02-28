import React, { useRef } from "react";
import Pin from "./Pin";
import SelectionBox from "./SelectionBox";



export type TempComment = Omit<Comment, "id" | "text"> | null;

interface ImageCanvasProps {
  comments: TempComment[];
  tempComment: TempComment;
  setTempComment: (value: TempComment) => void;
  onAddComment: (type: "pin" | "selection", x: number, y: number, width?: number, height?: number) => void;
  activeCommentId: number | null;
  setActiveCommentId: (id: number | null) => void;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({
  comments,
  tempComment,
  setTempComment,
  onAddComment,
  activeCommentId,
  setActiveCommentId,
}) => {
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || isSelecting || !imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempComment({ x, y, type: "pin" });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempComment({ x, y, width: 0, height: 0, type: "selection" });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !tempComment || !imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const width = ((e.clientX - rect.left) / rect.width) * 100 - tempComment.x;
    const height = ((e.clientY - rect.top) / rect.height) * 100 - tempComment.y;

    if (Math.abs(width) > 5 || Math.abs(height) > 5) {
      setIsDragging(true);
    }

    setTempComment((prev: TempComment) => (prev ? { ...prev, width, height } : null));
  };

  const handleMouseUp = () => {
    setIsSelecting(false);

    if (isDragging && tempComment?.type === "selection" && tempComment.width && tempComment.height) {
      onAddComment("selection", tempComment.x, tempComment.y, tempComment.width, tempComment.height);
      setTempComment(null);
    }
  };

  return (
    <div
      className="image-wrapper"
      ref={imageWrapperRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleImageClick}
    >
      <img src="https://picsum.photos/600/400" alt="Example" className="main-image" />

      {comments.map((c) =>
        c.type === "selection" ? (
          <SelectionBox key={c.id} x={c.x} y={c.y} width={c.width!} height={c.height!} text={c.text} />
        ) : (
          <Pin key={c.id} x={c.x} y={c.y} isActive={activeCommentId === c.id} onClick={() => setActiveCommentId(c.id)} />
        )
      )}

      {tempComment?.type === "pin" && <Pin x={tempComment.x} y={tempComment.y} isActive={false} onClick={() => {}} />}
    </div>
  );
};

export default ImageCanvas;
