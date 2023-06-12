import React, { useState, useEffect } from 'react';
// To display the parameters
import { Box, Button, FormControl, FormControlLabel, Checkbox, Radio, RadioGroup, Typography, Grid, Paper, Divider } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// To display the cards
import { Card, CardContent, CardMedia, Modal } from '@mui/material';
import ReactCountryFlag from "react-country-flag";
import { useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerBrowser/PlayerCard';
import { useParams } from 'react-router-dom';

// Firebase
import { auth } from '../firebase';
import InfoPopup from '../components/InfoPopup';

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
            // Remove career_high_rank_year key from initial preferences
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
    };

    const handleUpdatePreferences = async () => {
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
        } else {
            console.error('Error saving preferences');
        }
    };

    useEffect(() => {
        handleUpdatePreferences();
    }, [preferences]);

    const handleSavePreferences = async () => {
        const userId = auth.currentUser ? auth.currentUser.uid : null;
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/preferences/user/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ preferences, "user_id": userId, "player_names": players.map(player => player.name) }),
        });

        if (response.ok) {
        } else {
            console.error('Error saving preferences');
        }
    };

    ////////////////////////////
    // To open the player's profile
    ////////////////////////////
    const navigate = useNavigate();
    const { playerName: playerNameInUrl } = useParams();
    const [selectedPlayer, setSelectedPlayer] = useState(playerNameInUrl || null);
    const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(!!playerNameInUrl);

    const handlePlayerClick = (playerName) => {
        setSelectedPlayer(playerName);
        setIsPlayerCardOpen(true);
        navigate(`/browser/parameter/${playerName.replace(/ /g, '_')}`);
    };

    const handlePlayerCardClose = () => {
        setIsPlayerCardOpen(false);
        navigate('/browser/parameter');
    };

    useEffect(() => {
        if (playerNameInUrl) {
            setSelectedPlayer(playerNameInUrl.replace(/_/g, ' '));
            setIsPlayerCardOpen(true);
        }
    }, [playerNameInUrl]);


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
                        <Typography variant='h3' sx={{ mb: 2 }}>Filter</Typography>
                        <Grid container spacing={3} alignItems="flex-start" justifyContent="flex-end">
                            {/* Hide these parameters because backend can't handle them yet. TODO fix this! */}
                            {Object.entries(parameters)
                                .filter(([parameter]) => !['years_on_tour', 'height', 'career_high_rank', 'career_high_years_ago', 'personality_tags', 'previous_winner'].includes(parameter))
                                .map(([parameter, options]) => (Array.isArray(options) && options.length > 2 ? (
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
                        {/* <Box sx={{ marginTop: 2, display: 'flex' }}>
                            <Button onClick={handleUpdatePreferences} variant="contained" sx={{ margin: 2 }}>
                                Update Preferences
                            </Button>
                            <Button onClick={handleSavePreferences} variant="contained" sx={{ margin: 2 }}>
                                Save Preferences To Profile
                            </Button>
                        </Box> */}
                    </Paper>
                </Box>
            </Grid>
            <Grid item xs={12} sm={8} padding={2}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant='h3' sx={{ mb: 2 }}>Players: {players.length}</Typography>
                        <InfoPopup infoText="This page is currently only for browsing, not for match recommendations." />
                        {/* <InfoPopup infoText="Aim to have 1-10 players here. When you're satisfied, click 'Save Players To Profile' to save them to your profile. This can be used for recommendations." /> */}
                    </Box>
                    <Grid container spacing={4}>
                        {players.map((player) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={player.name}>
                                <Card onClick={() => handlePlayerClick(player.name)}
                                    sx={{
                                        position: 'relative',
                                        '&:hover': {
                                            boxShadow: 4,
                                            transition: '0.3s',
                                            boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
                                            '& $image': {
                                                borderRadius: '50%',
                                            },
                                        }
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        image={player.image_url}
                                        alt={player.name}
                                        sx={{ objectFit: 'contain', padding: '1em' }}
                                    />
                                    {/* Only display the flag if the player.country_code is not empty */}
                                    {player.country_code && (
                                        <ReactCountryFlag
                                            countryCode={player.country_code}
                                            style={{
                                                width: '3em',
                                                height: '3em',
                                                position: 'absolute',
                                                top: '10px',
                                                left: '10px',
                                                zIndex: 1, // make the flag appear above the image
                                            }}
                                            svg
                                        />
                                    )}
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {player.name}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Rank: {player.rank}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    {selectedPlayer && <Modal open={isPlayerCardOpen} onClose={handlePlayerCardClose}>
                        <PlayerCard playerName={selectedPlayer} handleClose={handlePlayerCardClose} />
                    </Modal>}
                </Paper>
            </Grid>
        </Grid >
    );
}

export default ParameterBrowsing;
