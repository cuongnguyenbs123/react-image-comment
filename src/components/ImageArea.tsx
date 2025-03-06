import React, { useRef, useEffect } from "react";
import { Comment } from "../types";
import DraggableComponent from "../utils/Dragable";
import { useCommentContext } from "../context/CommentContext";
import { ResizeDirection } from "../types/index";
const ImageArea = ({ imageSrc }: { imageSrc: string }) => {
  const {
    comments,
    interactionState,
    updateInteractionState,
  } = useCommentContext();

  const {
    tempComment,
    activeCommentId,
    isSelecting,
    isDragging,
    isResizing,
    resizeDirection,
  } = interactionState;
  const draggableRefs = useRef<{ [key: number]: DraggableComponent }>({});
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateInteractionState({
      isDragging: false,
      isSelecting: true,
      activeCommentId: null,
      tempComment: { x, y, type: "selection", text: "" },
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (!isSelecting && !isResizing) ||
      !tempComment ||
      !imageWrapperRef.current ||
      tempComment.type !== "selection"
    )
      return;
    const rect = imageWrapperRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (isSelecting && tempComment?.type === "selection") {
      const width = Math.abs(currentX - tempComment.x);
      const height = Math.abs(currentY - tempComment.y);
      updateInteractionState({
        tempComment: {
          ...tempComment,
          width: currentX - tempComment.x,
          height: currentY - tempComment.y,
        },
        isDragging: width > 5 || height > 5 ? true : false,
      });
    } else if (isResizing) {
      if (activeCommentId) {
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id !== activeCommentId) return comment;
            let newX = comment.x;
            let newY = comment.y;
            let newWidth = comment.width!;
            let newHeight = comment.height!;
            switch (resizeDirection) {
              case "top-left":
                newX = currentX;
                newY = currentY;
                newWidth = comment.x + comment.width! - currentX;
                newHeight = comment.y + comment.height! - currentY;
                break;
              case "top-right":
                newY = currentY;
                newWidth = currentX - comment.x;
                newHeight = comment.y + comment.height! - currentY;
                break;
              case "bottom-left":
                newX = currentX;
                newWidth = comment.x + comment.width! - currentX;
                newHeight = currentY - comment.y;
                break;
              case "bottom-right":
                newWidth = currentX - comment.x;
                newHeight = currentY - comment.y;
                break;
              case "left":
                newX = currentX;
                newWidth = comment.x + comment.width! - currentX;
                break;
              case "right":
                newWidth = currentX - comment.x;
                break;
              case "top":
                newY = currentY;
                newHeight = comment.y + comment.height! - currentY;
                break;
              case "bottom":
                newHeight = currentY - comment.y;
                break;
            }

            return {
              ...comment,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
            };
          })
        );
      } else {
        // Xử lý resize cho temp
        let newX = tempComment.x;
        let newY = tempComment.y;
        let newWidth = tempComment.width!;
        let newHeight = tempComment.height!;
        switch (resizeDirection) {
          case "top-left":
            newX = currentX;
            newY = currentY;
            newWidth = tempComment.x + tempComment.width! - currentX;
            newHeight = tempComment.y + tempComment.height! - currentY;
            break;
          case "top-right":
            newY = currentY;
            newWidth = currentX - tempComment.x;
            newHeight = tempComment.y + tempComment.height! - currentY;
            break;
          case "bottom-left":
            newX = currentX;
            newWidth = tempComment.x + tempComment.width! - currentX;
            newHeight = currentY - tempComment.y;
            break;
          case "bottom-right":
            newWidth = currentX - tempComment.x;
            newHeight = currentY - tempComment.y;
            break;
          case "left":
            newX = currentX;
            newWidth = tempComment.x + tempComment.width! - currentX;
            break;
          case "right":
            newWidth = currentX - tempComment.x;
            break;
          case "top":
            newY = currentY;
            newHeight = tempComment.y + tempComment.height! - currentY;
            break;
          case "bottom":
            newHeight = currentY - tempComment.y;
            break;
        }
        updateInteractionState({
          tempComment: {
            ...tempComment,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          },
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (!tempComment) return;
    updateInteractionState({
      isResizing: false,
      isSelecting: false,
    });
  };

  // Khi người dùng click vào ảnh, tạo một pin tạm nếu không phải đang chọn vùng
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    if (!imageWrapperRef.current || isSelecting) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    updateInteractionState({
      tempComment: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        width: 0,
        height: 0,
        type: "pin",
        text: "",
      },
    });
  };

  const handleResizeStart =
  (direction: ResizeDirection, commentId?: number) =>
  (e: React.MouseEvent) => {
    e.stopPropagation();
    updateInteractionState({
      isResizing: true,
      resizeDirection: direction,
      activeCommentId: commentId ? commentId : activeCommentId,
    });
  };
// Khi bấm vào pin
const handlePinClick = (id: number) => {
  updateInteractionState({
    activeCommentId: id,
  });
};

  useEffect(() => {
    comments.forEach((c: Comment) => {
      if (c.type === "selection" && !draggableRefs.current[c.id]) {
        const el = document.getElementById(`selection-${c.id}`);
        if (el) {
          draggableRefs.current[c.id] = new DraggableComponent(el.id);
        }
      }
    });
  }, [comments]);
  return (
    <div
      className="image-wrapper"
      ref={imageWrapperRef} // Truyền ref từ cha xuống
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div onClick={handleImageClick}>
        <img src={imageSrc} alt="Example" className="main-image" />

        {/* Hiển thị các vùng chọn */}
        {comments.map((c) =>
          c.type === "selection" && c.width && c.height ? (
            <div
              key={c.id}
              className="selection-box"
              id={`selection-${c.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCommentId(c.id);
              }}
              style={{
                left: `${
                  ((c.width >= 0 ? c.x : c.x + c.width) /
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
                      ?.clientWidth ?? 1)) *
                  100
                }%`,
                top: `${
                  ((c.height >= 0 ? c.y : c.y + c.height) /
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
                      ?.clientHeight ?? 1)) *
                  100
                }%`,
                width: `${
                  (Math.abs(c.width) /
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
                      ?.clientWidth ?? 1)) *
                  100
                }%`,
                height: `${
                  (Math.abs(c.height) /
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
                      ?.clientHeight ?? 1)) *
                  100
                }%`,
              }}
              title={c.text}
            >
              {activeCommentId === c.id && (
                <>
                  <div
                    className="crosshair"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      draggableRefs.current[c.id] = new DraggableComponent(
                        `selection-${c.id}`
                      );
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      draggableRefs.current[c.id].destroy();
                    }}
                  />
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
              className={`pin ${activeCommentId === c.id ? "pin-active" : ""}`}
              style={{
                left: `${
                  (c.x /
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
                      ?.clientWidth ?? 1)) *
                  100
                }%`,
                top: `${
                  (c.y /
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
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
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
                      ?.clientWidth ?? 1)) *
                  100
                }%`,
                top: `${
                  ((tempComment.height >= 0
                    ? tempComment.y
                    : tempComment.y + tempComment.height) /
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
                      ?.clientHeight ?? 1)) *
                  100
                }%`,
                width: `${
                  (Math.abs(tempComment.width) /
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
                      ?.clientWidth ?? 1)) *
                  100
                }%`,
                height: `${
                  (Math.abs(tempComment.height) /
                    ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
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
                  ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
                    ?.clientWidth ?? 1)) *
                100
              }%`,
              top: `${
                (tempComment.y /
                  ((imageWrapperRef as React.RefObject<HTMLDivElement>)?.current
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
};
export default ImageArea;
