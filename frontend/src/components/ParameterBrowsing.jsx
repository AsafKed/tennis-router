import React, { useState, useEffect } from 'react';

// Material UI
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography, Grid } from '@mui/material';
import Slider from '@mui/material/Slider';

// Firebase
import { auth } from '../firebase';

function ParameterBrowsing() {
    const [parameters, setParameters] = useState({});
    const [preferences, setPreferences] = useState({});

    useEffect(() => {
        const fetchParameters = async () => {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/parameter_options`);
            const data = await response.json();
            setParameters(data);
            // Initialize preferences with the first non-empty option of each parameter
            const initialPreferences = {};
            for (const key in data) {
                initialPreferences[key] = Array.isArray(data[key]) ? data[key].find(option => option !== '') : data[key][0];
            }
            setPreferences(initialPreferences);
        };
        fetchParameters();
    }, []);

    const handlePreferenceChange = (parameter) => (event, newValue) => {
        setPreferences(prevPreferences => ({
            ...prevPreferences,
            [parameter]: newValue || event.target.value,
        }));
    };

    const handleSavePreferences = async () => {
        const userId = auth.currentUser.uid;
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}/preferences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
        });

        if (response.ok) {
            // console.log('Preferences saved successfully');
        } else {
            console.error('Error saving preferences');
        }
    };

    return (
        <Grid container>
            <Grid item xs={12} sm={6}>
                <Box sx={{ marginTop: 2 }}>
                    <h3>Preferences</h3>
                    <Grid container spacing={3}>
                        {Object.entries(parameters).map(([parameter, options]) => (
                            Array.isArray(options) && options.length > 2 ? (
                                <Grid item xs={12} sm={6} md={4} key={parameter}>
                                    <FormControl fullWidth>
                                        <InputLabel id={`${parameter}-label`}>{parameter}</InputLabel>
                                        <Select
                                            labelId={`${parameter}-label`}
                                            id={`${parameter}-select`}
                                            value={preferences[parameter]}
                                            label={parameter}
                                            onChange={handlePreferenceChange(parameter)}
                                        >
                                            {options.map(option => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            ) : (
                                <Grid item xs={12} sm={6} md={4} key={parameter}>
                                    <Typography id={`${parameter}-label`}>{parameter}</Typography>
                                    <Slider
                                        aria-labelledby={`${parameter}-label`}
                                        value={preferences[parameter]}
                                        min={options[0]}
                                        max={options[1]}
                                        step={1}
                                        marks={[
                                            { value: options[0], label: '<' + options[0] },
                                            { value: (options[0] + options[1]) / 2, label: (options[0] + options[1]) / 2 },
                                            { value: options[1], label: '>' + options[1] },
                                        ]}
                                        valueLabelDisplay="auto"
                                        onChange={handlePreferenceChange(parameter)}
                                    />
                                </Grid>
                            )
                        ))}
                    </Grid>
                    <Box sx={{ marginTop: 2 }}>
                        <Button onClick={handleSavePreferences} variant="contained">
                            Save Preferences
                        </Button>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
                <h3>Players</h3>
            </Grid>
        </Grid>
    );
}

export default ParameterBrowsing;
