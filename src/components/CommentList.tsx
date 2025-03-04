import React, { useEffect } from "react";
import { Comment } from "../types";

interface CommentListProps {
  comments: Comment[];
  activeCommentId: number | null;
  onPinClick: (id: number) => void;
  onDeleteComment: (id: number) => void;
  onAdjustComment: (id: number, newText: string) => void;
  setActiveCommentId: (id: number | null) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  activeCommentId,
  onPinClick,
  onDeleteComment,
  onAdjustComment,
  setActiveCommentId,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveCommentId(null);
      }
    };
    const handleOutSideClick = () => {
      if (activeCommentId !== null) {
        setActiveCommentId(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleOutSideClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleOutSideClick);
    };
  }, []);
  return (
    <>
      <h3>Danh sách Comment</h3>
      <ul>
        {comments.map((c) => (
          <li
            key={c.id}
            className={activeCommentId === c.id ? "active-comment" : ""}
            onClick={() => onPinClick(c.id)}
          >
            <p>
              <strong>Loại:</strong>{" "}
              {c.type === "pin" ? "📍 Pin" : "🖼 Vùng chọn"}
            </p>
            {activeCommentId === c.id ? (
              <textarea
                className="w-full"
                rows={3}
                value={c.text}
                placeholder="Nhập nội dung comment..."
                onChange={(e) => onAdjustComment(c.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setActiveCommentId(null);
                  }
                }}
              />
            ) : (
              <p>{c.text}</p>
            )}

            <button onClick={() => onDeleteComment(c.id)}>Xoá</button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default CommentList;
