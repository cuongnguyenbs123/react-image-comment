import React, { createContext, useState, ReactNode } from "react";
import { ResizeDirection } from "../types";

interface Comment {
  id: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
  type: "pin" | "selection";
}

interface InteractionState {
  tempComment: Omit<Comment, "id"> | null;
  activeCommentId: number | null;
  isSelecting: boolean;
  isDragging: boolean;
  isResizing: boolean;
  resizeDirection: ResizeDirection | null;
}

interface CommentContextType {
  comments: Comment[];
  interactionState: InteractionState;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  updateInteractionState: (updates: Partial<InteractionState>) => void;
  handleAddComment: () => void;
  handleDeleteComment: (id: number) => void;
  handleAdjustComment: (id: number, newText: string) => void;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const CommentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [interactionState, setInteractionState] = useState<InteractionState>({
    tempComment: null,
    activeCommentId: null,
    isSelecting: false,
    isDragging: false,
    isResizing: false,
    resizeDirection: null,
  });

  const updateInteractionState = (updates: Partial<InteractionState>) => {
    setInteractionState((prev) => ({ ...prev, ...updates }));
  };

  const normalizeSelection = (comment: Omit<Comment, "id">) => {
    if (comment.type === "selection") {
      const x = Math.min(comment.x, comment.x + (comment.width || 0));
      const y = Math.min(comment.y, comment.y + (comment.height || 0));
      const width = Math.abs(comment.width || 0);
      const height = Math.abs(comment.height || 0);
      return { ...comment, x, y, width, height };
    }
    return comment;
  };

  const handleAddComment = () => {
    if (!interactionState.tempComment || interactionState.tempComment.text.trim() === "") return;
    const newComment: Comment = {
      id: Date.now(),
      ...normalizeSelection(interactionState.tempComment),
    };

    setComments([...comments, newComment]);
    updateInteractionState({ tempComment: null });
  };

  const handleDeleteComment = (id: number) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const handleAdjustComment = (id: number, newText: string) => {
    setComments(comments.map((c) => (c.id === id ? { ...c, text: newText } : c)));
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        interactionState,
        setComments,
        updateInteractionState,
        handleAddComment,
        handleDeleteComment,
        handleAdjustComment,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = () => {
  const context = React.useContext(CommentContext);
  if (!context) {
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return context;
};
