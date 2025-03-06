import React, { useState, useRef } from "react";
import "./App.css";
import ImageArea from "./components/ImageArea";
import CommentList from "./components/CommentList";
import CommentForm from "./components/CommentForm";
import { ResizeDirection } from "./types";

interface Comment {
  id: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
  type: "pin" | "selection";
}
const App: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);

  const [interactionState, setInteractionState] = useState({
    tempComment: null as Omit<Comment, "id"> | null,
    activeCommentId: null as number | null,
    isSelecting: false,
    isDragging: false,
    isResizing: false,
    isMoving: false,
    resizeDirection: null as ResizeDirection | null,
  });
  const {
    tempComment,
    activeCommentId,
    isSelecting,
    isDragging,
    isResizing,
    resizeDirection,
  } = interactionState;
  const updateInteractionState = (
    updates: Partial<typeof interactionState>
  ) => {
    setInteractionState((prev) => ({ ...prev, ...updates }));
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
        text: ""
      },
    });
  };

  // Khi bắt đầu chọn vùng
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
    setInteractionState((prev) => ({ ...prev, activeCommentId: id }));
    updateInteractionState({
      activeCommentId: id,
    });
  };

  const normalizeSelection = (comment: Omit<Comment, "id">) => {
    if (comment.type === "selection") {
      const x = Math.min(comment.x, comment.x + comment.width!);
      const y = Math.min(comment.y, comment.y + comment.height!);
      const width = Math.abs(comment.width!);
      const height = Math.abs(comment.height!);
      return { ...comment, x, y, width, height };
    }
    return comment;
  };

  // Lưu comment mới
  const handleAddComment = () => {
    if (!tempComment || tempComment.text.trim() === "") return;
    const newComment: Comment = {
      id: Date.now(),
      ...normalizeSelection(tempComment),
    };

    setComments([...comments, newComment]);
    updateInteractionState({
      tempComment: null,
    });
  };

  // Xoá comment
  const handleDeleteComment = (id: number) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const handleAdjustComment = (id: number, newText: string) => {
    setComments(
      comments.map((c) => (c.id === id ? { ...c, text: newText } : c))
    );
  };
  return (
    <div className="app-container">
      <ImageArea
        ref={imageWrapperRef}
        comments={comments}
        tempComment={tempComment}
        imageSrc={"https://picsum.photos/600/400"}
        onImageClick={handleImageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onPinClick={handlePinClick}
        activeCommentId={activeCommentId}
        handleResizeStart={handleResizeStart}
        setActiveCommentId={(id: number | null) =>
          updateInteractionState({ activeCommentId: id })
        }
      />

      {/* Panel danh sách comment */}
      <div className="comment-panel">
        <CommentList
          comments={comments}
          activeCommentId={activeCommentId}
          onPinClick={handlePinClick}
          onDeleteComment={handleDeleteComment}
          onAdjustComment={handleAdjustComment}
          setActiveCommentId={(id: number | null) =>
            updateInteractionState({ activeCommentId: id })
          }
        />
        {/* Form nhập comment nếu có pin/vùng chọn tạm thời */}
        {tempComment && (
          <CommentForm
            commentText={tempComment.text}
            setCommentText={(text: string)=> updateInteractionState({ tempComment: { ...tempComment, text } })}
            onAddComment={handleAddComment}
          />
        )}
      </div>
    </div>
  );
};

export default App;
