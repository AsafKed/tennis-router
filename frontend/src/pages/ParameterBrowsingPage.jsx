import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormControlLabel, Checkbox, Radio, RadioGroup, Typography, Grid, Paper, Divider } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Firebase
import { auth } from '../firebase';

function ParameterBrowsing() {
    const [parameters, setParameters] = useState({});
    const [preferences, setPreferences] = useState({});
    const [expandedParameter, setExpandedParameter] = useState(null);
    const [players, setPlayers] = useState([]);

    // Fetch parameters from backend
    useEffect(() => {
        const fetchParameters = async () => {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/parameter_options`);
            const data = await response.json();
            setParameters(data);
            // Initialize preferences with empty list unless it's gender or previous_winner
            const initialPreferences = {};
            for (const key in data) {
                if (key === 'gender' || key === 'previous_winner')
                    initialPreferences[key] = '';
                else
                    initialPreferences[key] = [];
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
        console.log(`Preference for ${parameter} changed to ${preferences[parameter]}`)
    };

    const handleSavePreferences = async () => {
        console.log(preferences)
        const userId = auth.currentUser ? auth.currentUser.uid : null;
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/preferences/players`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ preferences, "user_id": userId }),
        });

        if (response.ok) {
            const playersData = await response.json();
            setPlayers(playersData);  // Update players state variable
            console.log('Preferences saved', playersData);
        } else {
            console.error('Error saving preferences');
        }
    };


    // Create a mapping from original labels to new labels
    const labelMapping = {
        'Play Style': 'Play Style',
        'Favorite Shot': 'Favorite Shot',
        'Years On Tour': 'Years of Experience',
        'Country Zone': 'Country Zone',
        'Gender': 'Gender',
        'Height': 'Height',
        'Career High Rank': 'Career High Rank',
        'Career High Years Ago': 'Years since Peak Rank',
        'Previous Winner': 'Previous Libema Winner',
        'Personality Tags': 'Personality Characteristics',
    };

    const optionMapping = {
        'Previous Winner': { '': 'All', '1': 'Yes', '0': 'No' },
        'Gender': { '': 'none', 'Female': 'test' },
        'Personality Tags': {
            'Mental strength': 'Mental strength',
            'Tactical play': 'Tactical play',
            'Consistent play': 'Consistent play',
            'Defensive play': 'Defensive play',
            'Emotionally Expressive': 'Emotionally Expressive',
            'Outgoing personality': 'Outgoing personality',
            'Net play': 'Net play',
            'Competitive': 'Competitive',
            'Blank': 'Unknown',
            'Composed': 'Composed',
            'Offensive play': 'Offensive play',
            'Physical': 'Physical',
            'Unique': 'Unique',
        },
    };

    return (
        <Grid container paddingTop={2}>
            <Grid item xs={12} sm={4}>
                <Box sx={{ marginTop: 2 }}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant='h3' sx={{ mb: 2 }}>Preferences</Typography>
                        <Grid container spacing={3} alignItems="flex-start" justifyContent="flex-end">
                            {Object.entries(parameters).map(([parameter, options]) => (
                                Array.isArray(options) && options.length > 2 ? (
                                    <Grid item xs={12} key={parameter}>
                                        <Accordion elevation={0} key={parameter} expanded={expandedParameter === parameter} onChange={() => setExpandedParameter(expandedParameter === parameter ? null : parameter)}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Typography variant='h6'>{labelMapping[displayParameterTitle(parameter)]}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <FormControl component="fieldset">
                                                    {options.filter(option => option !== '').map(option => (
                                                        <FormControlLabel
                                                            key={option}
                                                            control={<Checkbox checked={preferences[parameter].includes(option)} onChange={handlePreferenceChange(parameter)} value={option} />}
                                                            label={optionMapping[displayParameterTitle(parameter)] ? optionMapping[displayParameterTitle(parameter)][option] : option} />
                                                    ))}
                                                </FormControl>
                                            </AccordionDetails>
                                        </Accordion>
                                        <Divider />
                                    </Grid>
                                ) : (
                                    <Grid item xs={12} key={parameter}>
                                        <Accordion elevation={0} key={parameter} expanded={expandedParameter === parameter} onChange={() => setExpandedParameter(expandedParameter === parameter ? null : parameter)}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Typography variant='h6'>{labelMapping[displayParameterTitle(parameter)]}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <FormControl component="fieldset">
                                                    {parameter === 'previous_winner' && (
                                                        <RadioGroup
                                                            aria-label={parameter}
                                                            value={preferences[parameter]}
                                                            onChange={handlePreferenceChange(parameter)}
                                                        >
                                                            <FormControlLabel value="" control={<Radio />} label="All" />
                                                            <FormControlLabel value="1" control={<Radio />} label="Yes" />
                                                            <FormControlLabel value="0" control={<Radio />} label="No" />
                                                        </RadioGroup>
                                                    )}
                                                    {parameter === 'gender' && (
                                                        <RadioGroup
                                                            aria-label={parameter}
                                                            value={preferences[parameter]}
                                                            onChange={handlePreferenceChange(parameter)}
                                                        >
                                                            <FormControlLabel
                                                                control={<Radio />}
                                                                label='All'
                                                                value=''
                                                            />
                                                            {options.map(option => (
                                                                <FormControlLabel
                                                                    key={option}
                                                                    control={<Radio />}
                                                                    label={option}
                                                                    value={option}
                                                                />
                                                            ))}
                                                        </RadioGroup>
                                                    )}
                                                    {(parameter !== 'previous_winner' && parameter !== 'gender') && (
                                                        <RadioGroup
                                                            aria-label={parameter}
                                                            value={preferences[parameter]}
                                                            onChange={handlePreferenceChange(parameter)}
                                                        >
                                                            {options.map(option => (
                                                                <FormControlLabel
                                                                    key={option}
                                                                    control={<Radio />}
                                                                    label={option}
                                                                    value={option}
                                                                />
                                                            ))}
                                                        </RadioGroup>
                                                    )}

                                                </FormControl>
                                            </AccordionDetails>
                                        </Accordion>
                                        <Divider />
                                    </Grid>
                                )
                            ))}
                        </Grid>
                        <Box sx={{ marginTop: 2 }}>
                            <Button onClick={handleSavePreferences} variant="contained">
                                Save Preferences
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Grid>
            <Grid item xs={12} sm={8}>
                <Typography variant='h3' sx={{ mb: 2 }}>Players</Typography>
                <Typography variant='h6' sx={{ mb: 2 }}>This page is under development.</Typography>
            </Grid>
        </Grid>
    );
}

export default ParameterBrowsing;
