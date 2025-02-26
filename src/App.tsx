import React, { useState, useEffect } from "react";
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

  const [imgSize, setImgSize] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const img = document.querySelector(".main-image") as HTMLImageElement;
    if (img.complete) {
      setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
    } else {
      img.onload = () => {
        setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
    }
  }, []);
  
  // Khi người dùng click vào ảnh, tạo một pin tạm
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();

    // Lấy tỷ lệ thực tế của ảnh
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setTempPin({ x, y });
    setCommentText(""); // Reset nội dung comment cũ
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
      <div className="image-container">
        <img
          src="https://picsum.photos/600/400"
          alt="Example"
          onClick={handleImageClick}
          className="main-image"
        />

        {comments.map((c) => (
          <div
            key={c.id}
            className="pin"
            style={{
              left: `${(c.x / imgSize.width) * 100}%`,
              top: `${(c.y / imgSize.height) * 100}%`,
            }}
            title={c.text}
          >
            <span>CN</span>
          </div>
        ))}

        {tempPin && (
          <div
            className="pin pin-temp"
            style={{
              left: `${(tempPin.x / imgSize.width) * 100}%`,
              top: `${(tempPin.y / imgSize.height) * 100}%`,
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
            <li key={c.id}>
              <p>
                <strong>Vị trí:</strong> x={Math.round(c.x)}, y=
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
