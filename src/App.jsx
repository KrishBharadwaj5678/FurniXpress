// App.jsx
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import BabylonScene from "./components/BabylonScene";
import RoomInput from './components/RoomInput';
import Room2DLayout from "./components/Room2DLayout";

export default function App() {
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [furniturePosition, setFurniturePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 10, height: 5, depth: 10 });

  const roomBounds = { minX: -5, maxX: 5, minZ: -4, maxZ: 4 };
  const layoutSize = { width: 400, height: 300 };

   const handlePlaceFurniture = (x, y) => {
    if (!selectedFurniture) {
      alert("Select furniture first!");
      return;
    }
    setFurniturePosition({ x, y });
  };

  return (
    <div className="flex h-screen">
    <Sidebar onSelectFurniture={setSelectedFurniture} />
    <div className="flex-grow relative">
      <BabylonScene
          {...dimensions}
          furniturePosition={furniturePosition}
          selectedFurniture={selectedFurniture}
      />

       <RoomInput onApply={setDimensions} />
    </div>
    <div className="w-80 bg-gray-100 border-l">
      <Room2DLayout {...dimensions}/>
    </div>
  </div>
  );
}
