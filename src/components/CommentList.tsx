import React from "react";
import { Comment } from "../types";

interface CommentListProps {
  comments: Comment[];
  activeCommentId: number | null;
  onPinClick: (id: number) => void;
  onDeleteComment: (id: number) => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, activeCommentId, onPinClick, onDeleteComment }) => {
  return (
    <div className="comment-panel">
      <h3>Danh sách Comment</h3>
      <ul>
        {comments.map((c) => (
          <li
            key={c.id}
            className={activeCommentId === c.id ? "active-comment" : ""}
            onClick={() => onPinClick(c.id)}
          >
            <p>
              <strong>Loại:</strong> {c.type === "pin" ? "📍 Pin" : "🖼 Vùng chọn"}
            </p>
            <p>{c.text}</p>
            <button onClick={() => onDeleteComment(c.id)}>Xoá</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentList;
