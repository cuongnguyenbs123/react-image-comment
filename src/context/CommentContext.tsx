import React, { createContext, useState, useContext } from "react";
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
  tempComment: Omit<Comment, "id" | "text"> | null;
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
  addComment: (text: string) => void;
  deleteComment: (id: number) => void;
  adjustComment: (id: number, newText: string) => void;
}

const CommentContext = createContext<CommentContextType | undefined>(
  undefined
);

export const CommentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  const addComment = (text: string) => {
    if (!interactionState.tempComment || !text.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        ...interactionState.tempComment,
        text,
      },
    ]);
    updateInteractionState({ tempComment: null });
  };

  const deleteComment = (id: number) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const adjustComment = (id: number, newText: string) => {
    setComments(comments.map((c) => (c.id === id ? { ...c, text: newText } : c)));
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        interactionState,
        setComments,
        updateInteractionState,
        addComment,
        deleteComment,
        adjustComment
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return context;
};
