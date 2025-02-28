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
  const [tempComment, setTempComment] = useState<Omit<Comment, "id" | "text"> | null>(null);
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

    setTempComment({ x, y, type: "pin" });
    setCommentText("");
  };

  // Khi bắt đầu chọn vùng
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTempComment({ x, y, width: 0, height: 0, type: "selection" });
    setIsSelecting(true);
    setIsDragging(false);
  };

  // Khi kéo chuột để mở rộng vùng chọn
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if ( !isSelecting || !tempComment || !imageWrapperRef.current || tempComment.type !== "selection") return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const width = e.clientX - rect.left - tempComment.x;
    const height = e.clientY - rect.top - tempComment.y;

    if (Math.abs(width) > 5 || Math.abs(height) > 5) {
      setIsDragging(true); // Xác định người dùng đang kéo
    }

    setTempComment((prev) => (prev ? { ...prev, width, height } : null));
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

    const newComment: Comment = {
      id: Date.now(),
      ...tempComment,
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
                handlePinClick(c.id);
              }}
            >
              <span>📍</span>
            </div>
          )
        )}

        {/* Hiển thị vùng chọn tạm thời */}
        {tempComment?.type === "selection" && (
          <div
            className="selection-box temp"
            style={{
              left: `${(tempComment.x / (imageWrapperRef.current?.clientWidth ?? 1)) * 100}%`,
              top: `${(tempComment.y / (imageWrapperRef.current?.clientHeight ?? 1)) * 100}%`,
              width: `${(tempComment.width! / (imageWrapperRef.current?.clientWidth ?? 1)) * 100}%`,
              height: `${(tempComment.height! / (imageWrapperRef.current?.clientHeight ?? 1)) * 100}%`,
            }}
          />
        )}

        {/* Hiển thị pin tạm thời */}
        {tempComment?.type === "pin" && (
          <div
            className="pin pin-temp"
            style={{
              left: `${(tempComment.x / (imageWrapperRef.current?.clientWidth ?? 1)) * 100}%`,
              top: `${(tempComment.y / (imageWrapperRef.current?.clientHeight ?? 1)) * 100}%`,
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
                <strong>Loại:</strong> {c.type === "pin" ? "📍 Pin" : "🖼 Vùng chọn"}
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


// import React, { useState } from "react";
// import ImageCanvas from "./components/ImageCanvas";
// import CommentBox from "./components/CommentBox";
// import "./App.css";
// interface Comment {
//   id: number;
//   x: number;
//   y: number;
//   width?: number;
//   height?: number;
//   text: string;
//   type: "pin" | "selection";
// }

// const App: React.FC = () => {
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [tempComment, setTempComment] = useState<Omit<Comment, "id" | "text"> | null>(null);
//   const [commentText, setCommentText] = useState<string>("");
//   const [activeCommentId, setActiveCommentId] = useState<number | null>(null);

//   // Hàm thêm comment (cho cả pin và vùng chọn)
//   const handleAddComment = () => {
//     if (!tempComment || !commentText.trim()) return;

//     const newComment: Comment = {
//       id: Date.now(),
//       ...tempComment,
//       text: commentText,
//     };

//     setComments([...comments, newComment]);
//     setTempComment(null);
//     setCommentText("");
//   };

//   // Hàm xoá comment
//   const handleDeleteComment = (id: number) => {
//     setComments(comments.filter((c) => c.id !== id));
//   };

//   // Hàm thêm comment từ ImageCanvas (pin hoặc vùng chọn)
//   const handleAddCommentFromCanvas = (type: "pin" | "selection", x: number, y: number, width?: number, height?: number) => {
//     setTempComment({ x, y, width, height, type });
//     setCommentText("");
//   };

//   return (
//     <div className="app-container">
//       {/* Khu vực hiển thị ảnh */}
//       <ImageCanvas
//         comments={comments}
//         tempComment={tempComment}
//         setTempComment={setTempComment}
//         onAddComment={handleAddCommentFromCanvas}
//         activeCommentId={activeCommentId}
//         setActiveCommentId={setActiveCommentId}
//       />

//       {/* Bảng danh sách comment */}
//       <CommentBox
//         comments={comments}
//         tempComment={tempComment}
//         commentText={commentText}
//         setCommentText={setCommentText}
//         onAddComment={handleAddComment}
//         onDeleteComment={handleDeleteComment}
//         activeCommentId={activeCommentId}
//         setActiveCommentId={setActiveCommentId}
//       />
//     </div>
//   );
// };

// export default App;
