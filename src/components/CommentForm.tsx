import React from "react";

interface CommentFormProps {
  commentText: string;
  setCommentText: (text: string) => void;
  onAddComment: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ commentText, setCommentText, onAddComment }) => {
  return (
    <div className="new-comment-form">
      <h4>Thêm Comment Mới</h4>
      <textarea
        rows={3}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Nhập nội dung comment..."
      />
      <button onClick={onAddComment}>Lưu</button>
    </div>
  );
};

export default CommentForm;
