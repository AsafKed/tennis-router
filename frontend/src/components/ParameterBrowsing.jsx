import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormControlLabel, Checkbox, Radio, RadioGroup, Typography, Grid, Paper } from '@mui/material';

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

    // Display parameter title with spaces
    const displayParameterTitle = (parameter) => {
        const words = parameter.split('_');
        // Capitalize each word
        const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        // Join words with spaces
        return capitalizedWords.join(' ');
    };

    const handlePreferenceChange = (parameter) => (event, newValue) => {
        const value = event.target.type === 'checkbox' ? event.target.value : newValue || event.target.value;
        if (event.target.type === 'checkbox') {
            setPreferences(prevPreferences => ({
                ...prevPreferences,
                [parameter]: event.target.checked
                    ? [...prevPreferences[parameter], value]
                    : prevPreferences[parameter].filter(option => option !== value),
            }));
        } else {
            setPreferences(prevPreferences => ({
                ...prevPreferences,
                [parameter]: value,
            }));
        }
        console.log(`Preference for ${parameter} changed to ${value}`)
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
        <Grid container paddingTop={2}>
            <Grid item xs={12} sm={4}>
                <Box sx={{ marginTop: 2 }}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant='h3' sx={{ mb: 2 }}>Preferences</Typography>
                        <Grid container spacing={3} alignItems="flex-start">
                            {Object.entries(parameters).map(([parameter, options]) => (
                                Array.isArray(options) && options.length > 2 ? (
                                    <Grid item xs={12} key={parameter}>
                                        <FormControl component="fieldset">
                                            <Typography variant='h6' >{displayParameterTitle(parameter)}</Typography>
                                            {options.map(option => (
                                                <FormControlLabel
                                                    key={option}
                                                    control={<Checkbox checked={preferences[parameter].includes(option)} onChange={handlePreferenceChange(parameter)} value={option} />}
                                                    label={option}
                                                />
                                            ))}
                                        </FormControl>
                                    </Grid>
                                ) : (
                                    <Grid item xs={12} key={parameter}>
                                        <FormControl component="fieldset">
                                            <Typography variant='h6'>{displayParameterTitle(parameter)}</Typography>
                                            <RadioGroup
                                                aria-label={parameter}
                                                value={preferences[parameter]}
                                                onChange={handlePreferenceChange(parameter)}
                                            >
                                                {options.map(option => (
                                                    <FormControlLabel
                                                        key={option}
                                                        value={option}
                                                        control={<Radio />}
                                                        label={option}
                                                    />
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                )
                            ))}
                        </Grid>
                    </Paper>
                    <Box sx={{ marginTop: 2 }}>
                        <Button onClick={handleSavePreferences} variant="contained">
                            Save Preferences
                        </Button>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12} sm={8}>
                <Typography variant='h3' sx={{ mb: 2 }}>Players</Typography>
            </Grid>
        </Grid>
    );
}

export default ParameterBrowsing;
