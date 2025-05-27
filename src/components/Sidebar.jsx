import React from "react";
import chairModelUrl from "../models/chair.glb";
import sofaModelUrl from "../models/sofa.glb";
import tableModelUrl from "../models/table.glb";
import doorModelUrl from "../models/door.glb";

import chairImg from "../assets/chair.png";
import sofaImg from "../assets/sofa.png";
import tableImg from "../assets/table.png";
import doorImg from "../assets/door.png";

function Sidebar({ onSelectFurniture }) {

  // To be dynamic
  const furnitureModels = [
    { name: "Chair", url: chairModelUrl, img: chairImg },
    { name: "Table", url: tableModelUrl, img: tableImg },
    { name: "Sofa", url: sofaModelUrl, img: sofaImg },
    { name: "Door", url: doorModelUrl, img: doorImg },
  ];

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("furnitureUrl", item.url);
    e.dataTransfer.setData("furnitureName", item.name);

    // Optional: set drag image to custom preview
    if (e.dataTransfer.setDragImage) {
      const img = new Image();
      img.src = item.img;
      e.dataTransfer.setDragImage(img, 32, 32);
    }
  };

  return (
    <aside className="bg-gray-900 text-white w-56 p-4 space-y-4 flex flex-col" aria-label="Furniture Sidebar">
      <h2 className="text-2xl font-bold mb-6">FURNO.AI</h2>
      {furnitureModels.map((item) => (
        <div
          key={item.url}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          className="flex items-center justify-center space-x-4 bg-gray-800 hover:bg-gray-700 rounded-lg p-3 cursor-grab select-none shadow-md transition-transform active:scale-95"
          title={`Drag and drop the ${item.name}`}
          tabIndex={0}
          aria-grabbed="false"
          role="option"
        >
          <img
            src={item.img}
            alt={item.name}
            className="w-20 h-20 object-contain"
            draggable={false}
            
          />
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
