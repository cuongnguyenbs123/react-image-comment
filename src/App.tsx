import React, { useState, useRef } from "react";
import "./App.css";
import ImageArea from "./components/ImageArea";
import CommentList from "./components/CommentList";
import CommentForm from "./components/CommentForm";

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

  // Khi người dùng click vào ảnh, tạo một pin tạm nếu không phải đang chọn vùng
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    if (!imageWrapperRef.current || isSelecting) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log(isDragging);
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
      !isSelecting ||
      !tempComment ||
      !imageWrapperRef.current ||
      tempComment.type !== "selection"
    )
      return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = Math.abs(currentX - tempComment.x);
    const height = Math.abs(currentY - tempComment.y);

    if (width > 5 || height > 5) {
      setIsDragging(true);
    }

    setTempComment({
      ...tempComment,
      width: currentX - tempComment.x, // Cho phép giá trị âm
      height: currentY - tempComment.y, // Cho phép giá trị âm
    });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
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
      />

      {/* Panel danh sách comment */}
      <div className="comment-panel">
        <CommentList
        comments={comments}
        activeCommentId={activeCommentId}
        onPinClick={handlePinClick}
        onDeleteComment={handleDeleteComment} 
        />
        {/* Form nhập comment nếu có pin/vùng chọn tạm thời */}
        <CommentForm
          commentText={commentText}
          setCommentText={setCommentText}
          onAddComment={handleAddComment}
        />
      </div>
    </div>
  );
};

export default App;
