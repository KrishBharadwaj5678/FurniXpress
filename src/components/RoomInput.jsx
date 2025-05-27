import React, { useState } from 'react';

const RoomInput = ({ onApply }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const match = prompt.match(/(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)/);
    if (match) {
      const [_, width, height, depth] = match;
      onApply({ width: parseFloat(width), height: parseFloat(height), depth: parseFloat(depth) });
    } else {
      alert('Please enter prompt like: Generate a room of 10,10,3');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        zIndex: 1
      }}
    >
      <input
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="e.g. Generate a room of 10,10,3"
        style={{ flex: 1, padding: '12px', fontSize: '16px', borderRadius: '5px 0 0 5px', border: '1px solid #ccc' }}
      />
      <button 
        type="submit" 
        className='bg-gray-800 text-white px-5 rounded-r-md cursor-pointer'
        style={{ border: '1px solid #ccc', borderLeft: 'none' }}
      >
        Generate
      </button>
    </form>
  );
};

export default RoomInput;
