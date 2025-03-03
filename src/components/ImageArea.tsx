import React, { useRef } from "react";
import { Comment } from "../types";

interface ImageAreaProps {
  comments: Comment[];
  tempComment: Omit<Comment, "id" | "text"> | null;
  imageSrc: string;
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onPinClick: (id: number) => void;
  activeCommentId: number | null;
}

const ImageArea: React.FC<ImageAreaProps> = ({
  comments,
  tempComment,
  imageSrc,
  onImageClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onPinClick,
  activeCommentId,
}) => {
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className="image-wrapper"
      ref={imageWrapperRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onClick={onImageClick}
    >
      <img src={imageSrc} alt="Example" className="main-image" />

      {comments.map((c) =>
        c.type === "selection" ? (
          <div
            key={c.id}
            className="selection-box"
            style={{
              left: `${(c.x / (imageWrapperRef.current?.clientWidth ?? 1)) * 100}%`,
              top: `${(c.y / (imageWrapperRef.current?.clientHeight ?? 1)) * 100}%`,
              width: `${(c.width! / (imageWrapperRef.current?.clientWidth ?? 1)) * 100}%`,
              height: `${(c.height! / (imageWrapperRef.current?.clientHeight ?? 1)) * 100}%`,
            }}
            title={c.text}
          />
        ) : (
          <div
            key={c.id}
            className={`pin ${activeCommentId === c.id ? "pin-active" : ""}`}
            style={{
              left: `${(c.x / (imageWrapperRef.current?.clientWidth ?? 1)) * 100}%`,
              top: `${(c.y / (imageWrapperRef.current?.clientHeight ?? 1)) * 100}%`,
            }}
            title={c.text}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(c.id);
            }}
          >
            <span>📍</span>
          </div>
        )
      )}
    </div>
  );
};

export default ImageArea;
