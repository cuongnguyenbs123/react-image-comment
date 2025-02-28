import React from "react";

interface CommentBoxProps {
  comments: any[];
  tempComment: any;
  commentText: string;
  setCommentText: (value: string) => void;
  onAddComment: () => void;
  onDeleteComment: (id: number) => void;
  activeCommentId: number | null;
  setActiveCommentId: (id: number | null) => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({
  comments,
  tempComment,
  commentText,
  setCommentText,
  onAddComment,
  onDeleteComment,
  activeCommentId,
  setActiveCommentId,
}) => {
  return (
    <div className="comment-panel">
      <h3>Danh sách Comment</h3>
      <ul>
        {comments.map((c) => (
          <li key={c.id} className={activeCommentId === c.id ? "active-comment" : ""} onClick={() => setActiveCommentId(c.id)}>
            <p>
              <strong>Loại:</strong> {c.type === "pin" ? "📍 Pin" : "🖼 Vùng chọn"}
            </p>
            <p>{c.text}</p>
            <button onClick={() => onDeleteComment(c.id)}>Xoá</button>
          </li>
        ))}
      </ul>

      {tempComment && (
        <div className="new-comment-form">
          <h4>Thêm Comment Mới</h4>
          <textarea rows={3} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Nhập nội dung comment..." />
          <button onClick={onAddComment}>Lưu</button>
        </div>
      )}
    </div>
  );
};

export default CommentBox;
