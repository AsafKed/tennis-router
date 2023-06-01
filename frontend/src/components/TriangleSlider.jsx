import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';

const TriangleSlider = () => {
  const points = [
    { id: 1, x: 40, y: 15 },
    { id: 2, x: 90, y: 15 },
    { id: 3, x: 140, y: 15 },
    { id: 4, x: 60, y: 55 },
    { id: 5, x: 90, y: 55 },
    { id: 6, x: 120, y: 55 },
    { id: 7, x: 90, y: 95 },
  ];

  const [selectedPoint, setSelectedPoint] = useState(5);

  const handleClick = (id) => {
    setSelectedPoint(id);
    console.log(id);
  };

  return (
    <div>
      
      <svg width="200" height="140">
        <g transform="translate(10, 10)">
          {points.map((point) => (
            <circle
              data-tooltip-id="my-tooltip"
              data-tooltip-content={`Point ${point.id}`}
              key={point.id}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={selectedPoint === point.id ? 'red' : 'blue'}
              onClick={() => handleClick(point.id)}
            />
          ))}
          <text x="0" y="0" fontSize="10">Personality Tags</text>
          <text x="120" y="0" fontSize="10">Numeric</text>
          <text x="65" y="115" fontSize="10">Categorical</text>
        </g>
      </svg>
      <Tooltip id='my-tooltip'/>
    </div>
  );
};

export default TriangleSlider;
