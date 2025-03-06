import React, { useRef } from "react";
import "./App.css";
import ImageArea from "./components/ImageArea";
import CommentList from "./components/CommentList";
import CommentForm from "./components/CommentForm";
import { CommentProvider, useCommentContext } from "./context/CommentContext";

const AppContent: React.FC = () => {
  const { interactionState } = useCommentContext();

  const { tempComment } = interactionState;

  return (
    <div className="app-container">
      <ImageArea
        imageSrc={"https://picsum.photos/600/400"}
      />

      <div className="comment-panel">
        <CommentList/>
        {tempComment && (
          <CommentForm/>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CommentProvider>
      <AppContent />
    </CommentProvider>
  );
};

export default App;
