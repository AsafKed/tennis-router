import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { Button, Card } from '@mui/material';

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
  const [personalityWeight, setPersonalityWeight] = useState(0.33);
  const [numericWeight, setNumericWeight] = useState(0.33);
  const [categoricalWeight, setCategoricalWeight] = useState(0.33);
  const [weightDistribution, setWeightDistribution] = useState('all');

  const handleClick = (id) => {
    setSelectedPoint(id);
    setPersonalityWeight(id === 1 ? 1 : id === 2 ? 0.5 : id === 4 ? 0.5 : id === 5 ? 0.33 : 0);
    setNumericWeight(id === 2 ? 0.5 : id === 3 ? 1 : id === 5 ? 0.33 : id === 6 ? 0.5 : 0);
    setCategoricalWeight(id === 4 ? 0.5 : id === 5 ? 0.33 : id === 6 ? 0.5 : id === 7 ? 1 : 0);
    setWeightDistribution(id === 1 ? 'tag_similarity' : id === 2 ? 'tag_numeric' : id === 3 ? 'numeric' :
      id === 4 ? 'tag_categorical' : id === 5 ? 'all' : id === 6 ? 'numeric_categorical' : 'categorical')
  };

  const handleWeightChange = (event) => {
    // Send the new weightDistribution to the backend
    console.log(weightDistribution)
  }

  return (
    <div>
      <Card>
        <p>Use these dots to select how much each type of data point affects the similarity. Hover over each dot to see how it weighs the different types. The following are descriptions for each of the types.</p>
        <ul>
          <li>Personality Tags: These are tags that describe a person's personality. For example, "funny", "outgoing", "shy", etc. See them at the bottom of each player once clicked.</li>
          <li>Numeric: These are numbers that describe a person. For example, "height", "weight", "age", etc. See them by clicking a player.</li>
          <li>Categorical: These are other notable attributes, such as a person's "handedness", "favorite shot", etc. See them by clicking a player.</li>
        </ul>
        <p>Similarity function ({weightDistribution}):</p>
        <p>similarity = {personalityWeight} * personalitySimilarity + {numericWeight} * numericSimilarity + {categoricalWeight} * categoricalSimilarity</p>

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
        <Tooltip id='my-tooltip' />
        {/* Add an "Update" button which sends this to the backend for player similarity weight */}
        <Button onClick={() => handleWeightChange()}>
          Update weight
        </Button>
      </Card>
    </div>
  );
};

export default TriangleSlider;
