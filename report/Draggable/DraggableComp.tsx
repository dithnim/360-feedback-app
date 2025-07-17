import React, { useState, useRef, useEffect } from "react";

interface DraggableCompProps {
  children: React.ReactNode;
  title?: string;
  initialPosition?: { x: number; y: number }; // Optional initial position
}

const DraggableComp: React.FC<DraggableCompProps> = ({
  children,
  title = "",
  initialPosition,
}) => {
  const [position, setPosition] = useState(
    () => initialPosition || { x: 0, y: 0 }
  );
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  // Only header is draggable
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    };
    const handleMouseUp = () => setDragging(false);
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset]);

  return (
    <div
      ref={nodeRef}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        minWidth: 300,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        border: "1px solid #eee",
        userSelect: dragging ? "none" : undefined,
        transition: dragging ? "none" : "box-shadow 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px 8px 14px",
          borderBottom: "1px solid #f0f0f0",
          borderRadius: "10px 10px 0 0",
          cursor: dragging ? "grabbing" : "grab",
          background: "#f2f3f3",
        }}
        onMouseDown={handleHeaderMouseDown}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 160,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20, color: "#bbb", cursor: "pointer" }}>
            ⋯
          </span>
          <span
            style={{
              fontSize: 18,
              color: dragging ? "#888" : "#bbb",
              marginLeft: 4,
            }}
            title="Drag"
          >
            ☰
          </span>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default DraggableComp;
