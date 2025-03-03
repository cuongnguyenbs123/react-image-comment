import React, { useState, useRef } from "react";
import "./App.css";

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
      {/* Vùng hiển thị ảnh */}
      <div
        className="image-wrapper"
        ref={imageWrapperRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleImageClick}
      >
        <img
          src="https://picsum.photos/600/400"
          alt="Example"
          className="main-image"
        />

        {/* Hiển thị các vùng chọn */}
        {comments.map((c) =>
          c.type === "selection" ? (
            <div
              key={c.id}
              className="selection-box"
              style={{
                left: `${
                  (c.x / (imageWrapperRef.current?.clientWidth ?? 1)) * 100
                }%`,
                top: `${
                  (c.y / (imageWrapperRef.current?.clientHeight ?? 1)) * 100
                }%`,
                width: `${
                  (c.width! / (imageWrapperRef.current?.clientWidth ?? 1)) * 100
                }%`,
                height: `${
                  (c.height! / (imageWrapperRef.current?.clientHeight ?? 1)) *
                  100
                }%`,
              }}
              title={c.text}
            />
          ) : (
            <div
              key={c.id}
              className={`pin ${activeCommentId === c.id ? "pin-active" : ""}`}
              style={{
                left: `${
                  (c.x / (imageWrapperRef.current?.clientWidth ?? 1)) * 100
                }%`,
                top: `${
                  (c.y / (imageWrapperRef.current?.clientHeight ?? 1)) * 100
                }%`,
              }}
              title={c.text}
              onClick={(e) => {
                e.stopPropagation();
                handlePinClick(c.id);
              }}
            >
              <span>📍</span>
            </div>
          )
        )}

        {/* Hiển thị vùng chọn tạm thời */}
        {tempComment?.type === "selection" && tempComment.width !== undefined && tempComment.height !== undefined && (
          <div
            className="selection-box temp"
            style={{
              left: `${
                ((tempComment.width >= 0
                  ? tempComment.x
                  : tempComment.x + tempComment.width) /
                  (imageWrapperRef.current?.clientWidth ?? 1)) *
                100
              }%`,
              top: `${
                ((tempComment.height >= 0
                  ? tempComment.y
                  : tempComment.y + tempComment.height) /
                  (imageWrapperRef.current?.clientHeight ?? 1)) *
                100
              }%`,
              width: `${
                (Math.abs(tempComment.width) /
                  (imageWrapperRef.current?.clientWidth ?? 1)) *
                100
              }%`,
              height: `${
                (Math.abs(tempComment.height) /
                  (imageWrapperRef.current?.clientHeight ?? 1)) *
                100
              }%`,
            }}
          />
        )}

        {/* Hiển thị pin tạm thời */}
        {tempComment?.type === "pin" && (
          <div
            className="pin pin-temp"
            style={{
              left: `${
                (tempComment.x / (imageWrapperRef.current?.clientWidth ?? 1)) *
                100
              }%`,
              top: `${
                (tempComment.y / (imageWrapperRef.current?.clientHeight ?? 1)) *
                100
              }%`,
            }}
          >
            <span>📍</span>
          </div>
        )}
      </div>

      {/* Panel danh sách comment */}
      <div className="comment-panel">
        <h3>Danh sách Comment</h3>
        <ul>
          {comments.map((c) => (
            <li
              key={c.id}
              className={activeCommentId === c.id ? "active-comment" : ""}
              onClick={() => handlePinClick(c.id)}
            >
              <p>
                <strong>Loại:</strong>{" "}
                {c.type === "pin" ? "📍 Pin" : "🖼 Vùng chọn"}
              </p>
              <p>{c.text}</p>
              <button onClick={() => handleDeleteComment(c.id)}>Xoá</button>
            </li>
          ))}
        </ul>

        {/* Form nhập comment nếu có pin/vùng chọn tạm thời */}
        {tempComment && (
          <div className="new-comment-form">
            <h4>Thêm Comment Mới</h4>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Nhập nội dung comment..."
            />
            <button onClick={handleAddComment}>Lưu</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
