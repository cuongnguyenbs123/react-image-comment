import React, { forwardRef } from "react";
import { Comment } from "../types";
import { ResizeDirection } from "../types";

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
  handleResizeStart: (
    direction: ResizeDirection
  ) => (e: React.MouseEvent) => void;
  setActiveCommentId: (id: number | null) => void;
}

// Sử dụng forwardRef để component cha có thể truy cập ref của ImageArea
const ImageArea = forwardRef<HTMLDivElement, ImageAreaProps>(
  (
    {
      comments,
      tempComment,
      imageSrc,
      onImageClick,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onPinClick,
      activeCommentId,
      handleResizeStart,
      setActiveCommentId,
    },
    ref
  ) => {
    return (
      <div
        className="image-wrapper"
        ref={ref} // Truyền ref từ cha xuống
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <div onClick={onImageClick}>
          <img src={imageSrc} alt="Example" className="main-image" />

          {/* Hiển thị các vùng chọn */}
          {comments.map((c) =>
            c.type === "selection" ? (
              <div
                key={c.id}
                className="selection-box"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCommentId(c.id);
                }}
                style={{
                  left: `${
                    (c.x /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientWidth ?? 1)) *
                    100
                  }%`,
                  top: `${
                    (c.y /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientHeight ?? 1)) *
                    100
                  }%`,
                  width: `${
                    (c.width! /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientWidth ?? 1)) *
                    100
                  }%`,
                  height: `${
                    (c.height! /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientHeight ?? 1)) *
                    100
                  }%`,
                }}
                title={c.text}
              >
                {activeCommentId === c.id && (
                  <>
                    <div
                      className="resize-handle top-left"
                      onMouseDown={handleResizeStart("top-left")}
                    />
                    <div
                      className="resize-handle top-right"
                      onMouseDown={handleResizeStart("top-right")}
                    />
                    <div
                      className="resize-handle bottom-left"
                      onMouseDown={handleResizeStart("bottom-left")}
                    />
                    <div
                      className="resize-handle bottom-right"
                      onMouseDown={handleResizeStart("bottom-right")}
                    />
                    <div
                      className="resize-handle left"
                      onMouseDown={handleResizeStart("left")}
                    />
                    <div
                      className="resize-handle right"
                      onMouseDown={handleResizeStart("right")}
                    />
                    <div
                      className="resize-handle top"
                      onMouseDown={handleResizeStart("top")}
                    />
                    <div
                      className="resize-handle bottom"
                      onMouseDown={handleResizeStart("bottom")}
                    />
                  </>
                )}
              </div>
            ) : (
              <div
                key={c.id}
                className={`pin ${
                  activeCommentId === c.id ? "pin-active" : ""
                }`}
                style={{
                  left: `${
                    (c.x /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientWidth ?? 1)) *
                    100
                  }%`,
                  top: `${
                    (c.y /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientHeight ?? 1)) *
                    100
                  }%`,
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

          {/* Hiển thị vùng chọn tạm thời */}
          {tempComment?.type === "selection" &&
            tempComment.width !== undefined &&
            tempComment.height !== undefined && (
              <div
                className="selection-box temp"
                style={{
                  left: `${
                    ((tempComment.width >= 0
                      ? tempComment.x
                      : tempComment.x + tempComment.width) /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientWidth ?? 1)) *
                    100
                  }%`,
                  top: `${
                    ((tempComment.height >= 0
                      ? tempComment.y
                      : tempComment.y + tempComment.height) /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientHeight ?? 1)) *
                    100
                  }%`,
                  width: `${
                    (Math.abs(tempComment.width) /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientWidth ?? 1)) *
                    100
                  }%`,
                  height: `${
                    (Math.abs(tempComment.height) /
                      ((ref as React.RefObject<HTMLDivElement>)?.current
                        ?.clientHeight ?? 1)) *
                    100
                  }%`,
                }}
              >
                {/* Các điểm resize */}
                <div
                  className="resize-handle top-left"
                  onMouseDown={handleResizeStart("top-left")}
                />
                <div
                  className="resize-handle top-right"
                  onMouseDown={handleResizeStart("top-right")}
                />
                <div
                  className="resize-handle bottom-left"
                  onMouseDown={handleResizeStart("bottom-left")}
                />
                <div
                  className="resize-handle bottom-right"
                  onMouseDown={handleResizeStart("bottom-right")}
                />
                <div
                  className="resize-handle left"
                  onMouseDown={handleResizeStart("left")}
                />
                <div
                  className="resize-handle right"
                  onMouseDown={handleResizeStart("right")}
                />
                <div
                  className="resize-handle top"
                  onMouseDown={handleResizeStart("top")}
                />
                <div
                  className="resize-handle bottom"
                  onMouseDown={handleResizeStart("bottom")}
                />
              </div>
            )}

          {/* Hiển thị pin tạm thời */}
          {tempComment?.type === "pin" && (
            <div
              className="pin pin-temp"
              style={{
                left: `${
                  (tempComment.x /
                    ((ref as React.RefObject<HTMLDivElement>)?.current
                      ?.clientWidth ?? 1)) *
                  100
                }%`,
                top: `${
                  (tempComment.y /
                    ((ref as React.RefObject<HTMLDivElement>)?.current
                      ?.clientHeight ?? 1)) *
                  100
                }%`,
              }}
            >
              <span>📍</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default ImageArea;
