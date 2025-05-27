import React, { useState } from 'react';

const RoomInput = ({ onApply }) => {
  const [prompt, setPrompt] = useState('');
  const [dimensions, setDimensions] = useState({ width: '', height: '', depth: '' });

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    const match = prompt.match(/(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)/);
    if (match) {
      const [_, width, height, depth] = match;
      onApply({ width: parseFloat(width), height: parseFloat(height), depth: parseFloat(depth) });
    }
  };

  const handleDimensionSubmit = (e) => {
    e.preventDefault();
    const { width, height, depth } = dimensions;
    if (width && height && depth) {
      onApply({ width: parseFloat(width), height: parseFloat(height), depth: parseFloat(depth) });
    } else {
      alert('Please fill all dimensions.');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        zIndex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Prompt input - wider */}
      <form onSubmit={handlePromptSubmit} style={{ display: 'flex', flex: '2 1 400px', minWidth: '300px' }}>
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Generate a room.."
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            minWidth: '0',
          }}
        />
      </form>

      {/* Dimension inputs - responsive */}
      <form
        onSubmit={handleDimensionSubmit}
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '8px',
          minWidth: '180px',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flex: '1 1 250px',
        }}
      >
        {['width', 'height', 'depth'].map((dim) => (
          <input
            key={dim}
            type="number"
            min="0"               // Prevent negative values
            placeholder={dim.charAt(0).toUpperCase() + dim.slice(1)}
            value={dimensions[dim]}
            onChange={(e) => setDimensions({ ...dimensions, [dim]: e.target.value })}
            className="border px-2 py-3 rounded"
            style={{
              minWidth: '60px',
              maxWidth: '100px',
              flexGrow: 1,
            }}
          />
        ))}
        <button
          type="submit"
          className="bg-gray-800 text-white px-3 py-3 rounded cursor-pointer"
          style={{ whiteSpace: 'nowrap' }}
        >
          Generate
        </button>
      </form>
    </div>
  );
};

export default RoomInput;
