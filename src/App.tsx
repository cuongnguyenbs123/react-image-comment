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
  const [tempComment, setTempComment] = useState<Omit<
    Comment,
    "id" | "text"
  > | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [isResizing, setIsResizing] = useState(false);
  // const [isEditing, setIsEditing] = useState<EditType | null>(null);
  // Khi người dùng click vào ảnh, tạo một pin tạm nếu không phải đang chọn vùng
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    if (!imageWrapperRef.current || isSelecting) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTempComment({ x, y, width: 0, height: 0, type: "pin" });
    setCommentText("");
  };

  // Khi bắt đầu chọn vùng
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTempComment({ x, y, type: "selection" });

    setIsSelecting(true);
    setIsDragging(false);
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

      if (width > 5 || height > 5) {
        setIsDragging(true);
      }
      setTempComment({
        ...tempComment,
        width: currentX - tempComment.x,
        height: currentY - tempComment.y,
      });
    } else if (isResizing && tempComment?.type === "selection") {
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
      } else if (tempComment?.type === "selection") {
        // Xử lý resize cho temp
        const rect = imageWrapperRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
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
        setTempComment({
          ...tempComment,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      }
    }
  };
  const handleMouseUp = () => {
    setIsSelecting(false);
    setIsResizing(false);
  };

  const handleResizeStart =
    (direction: ResizeDirection, commentId?: number) =>
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setResizeDirection(direction);
      setIsResizing(true);
      if (commentId !== undefined) {
        setActiveCommentId(commentId);
      }
    };

  // Khi bấm vào pin
  const handlePinClick = (id: number) => {
    setActiveCommentId(id);
  };

  // Lưu comment mới
  const handleAddComment = () => {
    if (!tempComment || !commentText.trim()) return;

    const normalizeSelection = (comment: Omit<Comment, "id" | "text">) => {
      if (comment.type === "selection") {
        const x = Math.min(comment.x, comment.x + comment.width!);
        const y = Math.min(comment.y, comment.y + comment.height!);
        const width = Math.abs(comment.width!);
        const height = Math.abs(comment.height!);
        return { ...comment, x, y, width, height };
      }
      return comment;
    };

    const newComment: Comment = {
      id: Date.now(),
      ...normalizeSelection(tempComment),
      text: commentText,
    };

    setComments([...comments, newComment]);
    setTempComment(null);
    setCommentText("");
  };

  // Xoá comment
  const handleDeleteComment = (id: number) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const handleAdjustComment = (id: number, newText: string) => {
    setComments(
      comments.map((c) => (c.id === id ? { ...c, text: newText } : c))
    );
    setCommentText("");
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
        setActiveCommentId={setActiveCommentId}
      />

      {/* Panel danh sách comment */}
      <div className="comment-panel">
        <CommentList
          comments={comments}
          activeCommentId={activeCommentId}
          onPinClick={handlePinClick}
          onDeleteComment={handleDeleteComment}
          onAdjustComment={handleAdjustComment}
          setActiveCommentId={setActiveCommentId}
        />
        {/* Form nhập comment nếu có pin/vùng chọn tạm thời */}
        {tempComment && (
          <CommentForm
            commentText={commentText}
            setCommentText={setCommentText}
            onAddComment={handleAddComment}
          />
        )}
      </div>
    </div>
  );
};

export default App;
