import React, { useState, useRef, useEffect } from "react";
import chairImg from "../assets/chair.png";
import sofaImg from "../assets/sofa.png";
import tableImg from "../assets/table.png";
import GridLayout from "./GridLayout.jsx"

function Room2DLayout({width, height, depth}) {
  const [placedFurniture, setPlacedFurniture] = useState([]);
  const panelRef = useRef(null);

  // For dragging inside panel
  const dragItemRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const getImageForFurniture = (name) => {
    switch (name) {
      case "Chair":
        return chairImg;
      case "Table":
        return tableImg;
      case "Sofa":
        return sofaImg;
      default:
        return null;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const furnitureUrl = e.dataTransfer.getData("furnitureUrl");
    const furnitureName = e.dataTransfer.getData("furnitureName");
    const furnitureImg = getImageForFurniture(furnitureName);

    if (!furnitureUrl || !furnitureImg) return;

    const panelRect = panelRef.current.getBoundingClientRect();

    // Calculate drop position relative to panel
    const x = e.clientX - panelRect.left;
    const y = e.clientY - panelRect.top;

    setPlacedFurniture((prev) => [
      ...prev,
      { id: Date.now(), url: furnitureUrl, name: furnitureName, img: furnitureImg, x, y },
    ]);
  };

  // Furniture drag inside panel handlers
  const handleMouseDown = (e, id) => {
    e.preventDefault();
    const panelRect = panelRef.current.getBoundingClientRect();
    const furniture = placedFurniture.find((f) => f.id === id);
    if (!furniture) return;

    dragItemRef.current = id;
    dragOffset.current = {
      x: e.clientX - (panelRect.left + furniture.x),
      y: e.clientY - (panelRect.top + furniture.y),
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragItemRef.current) return;

    const panelRect = panelRef.current.getBoundingClientRect();
    const x = e.clientX - panelRect.left - dragOffset.current.x;
    const y = e.clientY - panelRect.top - dragOffset.current.y;

    setPlacedFurniture((prev) =>
      prev.map((item) =>
        item.id === dragItemRef.current
          ? { ...item, x: Math.max(0, Math.min(x, panelRect.width)), y: Math.max(0, Math.min(y, panelRect.height)) }
          : item
      )
    );
  };

  const handleMouseUp = () => {
    dragItemRef.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={panelRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative bg-gray-300 border-2 border-gray-300 w-full h-screen shadow-inner overflow-hidden"
      style={{ userSelect: "none" }}
    >

      {/* Room background (optional) */}
      <div className="absolute inset-0 bg-white bg-grid-pattern">

        <GridLayout />

      </div>
      
      {/* Render placed furniture */}
      {placedFurniture.map(({ id, img, x, y, name }) => (
        <img
          key={id}
          src={img}
          alt={name}
          className="absolute w-20 h-20 object-contain select-none shadow-lg"
          style={{
            left: x - 40, // center image (width/2) 
            top: y - 40, // center image (height/2)
            cursor: "move",
          }}
          draggable={false}
          onMouseDown={(e) => handleMouseDown(e, id)}
        />
      ))}

    </div>
  );
}

export default Room2DLayout;
