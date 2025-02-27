import React, { useState, useRef } from "react";
import "./App.css";

interface Comment {
  id: number;
  x: number;
  y: number;
  text: string;
}

interface Pin {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [tempPin, setTempPin] = useState<Pin | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [selection, setSelection] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Khi người dùng click vào ảnh, tạo một pin tạm
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Đảm bảo `pin` không bị vượt quá vùng ảnh
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

    setTempPin({ x, y });
    setCommentText(""); // Reset nội dung comment cũ
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelection({ x, y, width: 0, height: 0 });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selection || !imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const width = e.clientX - rect.left - selection.x;
    const height = e.clientY - rect.top - selection.y;

    setSelection((prev) => (prev ? { ...prev, width, height } : null));
  };

  const handlePinClick = (id: number) => {
    setActiveCommentId(id);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Khi người dùng bấm "Lưu" comment
  const handleAddComment = () => {
    if (!tempPin || !commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(), // Dùng timestamp làm id
      x: tempPin.x,
      y: tempPin.y,
      text: commentText,
    };

    setComments([...comments, newComment]);
    setTempPin(null); // Xóa pin tạm
    setCommentText(""); // Reset input
  };

  // Xóa comment
  const handleDeleteComment = (id: number) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  return (
    <div className="app-container">
      {/* Vùng hiển thị ảnh để click */}
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
        {selection && (
          <div
            className="selection-box"
            style={{
              left: `${
                (selection.x / imageWrapperRef.current!.clientWidth) * 100
              }%`,
              top: `${
                (selection.y / imageWrapperRef.current!.clientHeight) * 100
              }%`,
              width: `${
                (selection.width / imageWrapperRef.current!.clientWidth) * 100
              }%`,
              height: `${
                (selection.height / imageWrapperRef.current!.clientHeight) * 100
              }%`,
            }}
          />
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className={`pin ${activeCommentId === c.id ? "pin-active" : ""}`}
            style={{
              left: `${(c.x / imageWrapperRef.current!.clientWidth) * 100}%`,
              top: `${(c.y / imageWrapperRef.current!.clientHeight) * 100}%`,
            }}
            title={c.text}
            onClick={(e) => {
              e.stopPropagation();
              handlePinClick(c.id);
            }}
          >
            <span>CN</span>
          </div>
        ))}

        {tempPin && (
          <div
            className="pin pin-temp"
            style={{
              left: `${
                (tempPin.x / imageWrapperRef.current!.clientWidth) * 100
              }%`,
              top: `${
                (tempPin.y / imageWrapperRef.current!.clientHeight) * 100
              }%`,
            }}
          >
            <span>New</span>
          </div>
        )}
      </div>

      {/* Khung bên phải hiển thị form và danh sách comment */}
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
                <strong>Vị trí:</strong> x={Math.round(c.x)},
                {Math.round(c.y)}
              </p>
              <p>{c.text}</p>
              <button onClick={() => handleDeleteComment(c.id)}>Xoá</button>
            </li>
          ))}
        </ul>
        {/* Form nhập comment nếu đang có pin tạm */}
        {tempPin && (
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


// import React, { useState, useRef } from "react";
// import "./App.css";

// interface Selection {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }

// const ImageSelection: React.FC = () => {
//   const [selection, setSelection] = useState<Selection | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [resizeCorner, setResizeCorner] = useState<"top-left" | "bottom-right" | null>(null);
//   const imageRef = useRef<HTMLDivElement | null>(null);

//   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!imageRef.current) return;

//     const rect = imageRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     setSelection({ x, y, width: 0, height: 0 });
//     setIsDragging(true);
//   };

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!isDragging || !selection || !imageRef.current) return;

//     const rect = imageRef.current.getBoundingClientRect();
//     const width = e.clientX - rect.left - selection.x;
//     const height = e.clientY - rect.top - selection.y;

//     setSelection((prev) => (prev ? { ...prev, width, height } : null));
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   // Xử lý kéo resize từ các góc
//   const handleResizeMouseDown = (corner: "top-left" | "bottom-right", e: React.MouseEvent<HTMLDivElement>) => {
//     e.stopPropagation();
//     setResizeCorner(corner);
//   };

//   const handleResizeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!resizeCorner || !selection || !imageRef.current) return;

//     const rect = imageRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     if (resizeCorner === "top-left") {
//       setSelection({
//         x: x,
//         y: y,
//         width: selection.width + (selection.x - x),
//         height: selection.height + (selection.y - y),
//       });
//     } else if (resizeCorner === "bottom-right") {
//       setSelection({ ...selection, width: x - selection.x, height: y - selection.y });
//     }
//   };

//   const handleResizeMouseUp = () => {
//     setResizeCorner(null);
//   };

//   return (
//     <div
//       className="image-container"
//       ref={imageRef}
//       onMouseDown={handleMouseDown}
//       onMouseMove={resizeCorner ? handleResizeMouseMove : handleMouseMove}
//       onMouseUp={resizeCorner ? handleResizeMouseUp : handleMouseUp}
//     >
//       <img src="https://picsum.photos/800/500" alt="Example" className="image" />
//       {selection && (
//         <div
//           className="selection-box"
//           style={{
//             left: `${selection.x}px`,
//             top: `${selection.y}px`,
//             width: `${selection.width}px`,
//             height: `${selection.height}px`,
//           }}
//         >
//           {/* Điểm kéo trên góc trái */}
//           <div
//             className="resize-handle top-left"
//             onMouseDown={(e) => handleResizeMouseDown("top-left", e)}
//           />
//           {/* Điểm kéo dưới góc phải */}
//           <div
//             className="resize-handle bottom-right"
//             onMouseDown={(e) => handleResizeMouseDown("bottom-right", e)}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImageSelection;
