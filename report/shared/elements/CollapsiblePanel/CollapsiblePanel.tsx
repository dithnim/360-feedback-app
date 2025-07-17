import React, { useState } from "react";
import "./CollapsiblePanel.scss";

interface CollapsiblePanelProps {
  title?: string;
  position?: { x: number; y: number };
  minimized?: boolean;
  isDraggable?: boolean;
  isMinimizable?: boolean;
  children?: React.ReactNode;
  onMinimizedChange?: (minimized: boolean) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title = "",
  position = { x: 0, y: 0 },
  minimized = false,
  isDraggable = true,
  isMinimizable = true,
  children,
  onMinimizedChange,
  onPositionChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const toggleMinimize = () => {
    if (onMinimizedChange) {
      onMinimizedChange(!minimized);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    };

    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      className={`editable-field ${minimized ? "minimized" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="panel-header edit-header">
        <span>{title}</span>
        <div className="edit-controls">
          {isMinimizable && (
            <button className="minimize-btn" onClick={toggleMinimize}>
              {minimized ? "+" : "-"}
            </button>
          )}
          {isDraggable && (
            <div className="drag-btn" onMouseDown={handleMouseDown}>
              <i className="material-icons">drag_indicator</i>
            </div>
          )}
        </div>
      </div>

      {!minimized && <div className="panel-content edit-body">{children}</div>}
    </div>
  );
};

export default CollapsiblePanel;
