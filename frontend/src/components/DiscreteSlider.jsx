import React from 'react';
import Slider from '@material-ui/core/Slider';

const marks = [
    {
        value: 0,
        label: '0',
    },
    {
        value: 0.5,
        label: '0.5',
    },
    {
        value: 1,
        label: '1',
    },
];

function valuetext(value) {
    return `${value}`;
}

export default function DiscreteSlider() {
    return (
        <div>
            <h2>Personality Tags</h2>
            <Slider
                defaultValue={0.33}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={0.33}
                marks={marks}
                min={0}
                max={1}
            />
            <h2>Numeric</h2>
            <Slider
                defaultValue={0.33}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={0.33}
                marks={marks}
                min={0}
                max={1}
            />
            <h2>Categorical</h2>
            <Slider
                defaultValue={0.33}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={0.33}
                marks={marks}
                min={0}
                max={1}
            />
        </div>
    );
}
