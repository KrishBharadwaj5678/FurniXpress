import React, { useState } from "react";

const GridLayout = () => {
  const [gridItems, setGridItems] = useState(Array(9).fill(null));

  const handleDrop = (e, index) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("furnitureImg");
    const furnitureName = e.dataTransfer.getData("furnitureName");
    const furnitureUrl = e.dataTransfer.getData("furnitureUrl");

    if (imageUrl || furnitureUrl) {
      const newGrid = [...gridItems];
      newGrid[index] = {
        name: furnitureName,
        url: furnitureUrl,
        img: imageUrl || "", // fallback
      };
      setGridItems(newGrid);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: "10px",
        padding: "20px",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {gridItems.map((item, index) => (
        <div
          key={index}
          onDrop={(e) => handleDrop(e, index)}
          onDragOver={handleDragOver}
          style={{
            backgroundColor: "#f9f9f9",
            border: "2px dashed #bbb",
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {item && (
            <img
              src={item.img}
              style={{ maxWidth: "90%", maxHeight: "90%" }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default GridLayout;
