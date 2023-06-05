import React, { useState } from 'react';

// Material UI
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import Slider from '@mui/material/Slider';

// Firebase
import { auth } from '../firebase';

function UserPreferences() {
    const [preference1, setPreference1] = useState('');
    const [preference2, setPreference2] = useState('');
    const [sliderValue, setSliderValue] = useState(0);
    const [preference3, setPreference3] = useState('');

    const handleSavePreferences = async () => {
        const userId = auth.currentUser.uid;
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}/preferences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                preference1: preference1,
                preference2: preference2,
                sliderValue: sliderValue,
            }),
        });

        if (response.ok) {
            // console.log('Preferences saved successfully');
        } else {
            console.error('Error saving preferences');
        }
    };

    return (
        <Box sx={{ marginTop: 2 }}>
            <h3>Preferences</h3>
            <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                    <InputLabel id="preference1-label">Preference 1</InputLabel>
                    <Select
                        labelId="preference1-label"
                        id="preference1-select"
                        value={preference1}
                        label="Preference 1"
                        onChange={(e) => setPreference1(e.target.value)}
                    >
                        <MenuItem value={'option1'}>Option 1</MenuItem>
                        <MenuItem value={'option2'}>Option 2</MenuItem>
                        <MenuItem value={'option3'}>Option 3</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ minWidth: 120, marginTop: 2 }}>
                <FormControl fullWidth>
                    <InputLabel id="preference2-label">Preference 2</InputLabel>
                    <Select
                        labelId="preference2-label"
                        id="preference2-select"
                        value={preference2}
                        label="Preference 2"
                        onChange={(e) => setPreference2(e.target.value)}
                    >
                        <MenuItem value={'option1'}>Option 1</MenuItem>
                        <MenuItem value={'option2'}>Option 2</MenuItem>
                        <MenuItem value={'option3'}>Option 3</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ marginTop: 2 }}>
                <Typography id="slider-label">Slider Value</Typography>
                <Slider
                    aria-labelledby="slider-label"
                    value={sliderValue}
                    min={0}
                    max={10}
                    step={1}
                    valueLabelDisplay="auto"
                    onChange={(e, newValue) => setSliderValue(newValue)}
                />
            </Box>
            <Box sx={{ minWidth: 120, marginTop: 2 }}>
                <FormControl fullWidth>
                    <InputLabel id="preference3-label">Preference 3</InputLabel>
                    <Select
                        labelId="preference3-label"
                        id="preference3-select"
                        value={preference3}
                        label="Preference 3"
                        onChange={(e) => setPreference3(e.target.value)}
                    >
                        <MenuItem value={'option1'}>Option 1</MenuItem>
                        <MenuItem value={'option2'}>Option 2</MenuItem>
                        <MenuItem value={'option3'}>Option 3</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ marginTop: 2 }}>
                <Button onClick={handleSavePreferences} variant="contained">
                    Save Preferences
                </Button>
            </Box>
        </Box>
    );
}

export default UserPreferences;